<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDetail;
use App\Models\Log as UserLog;
use App\Models\StudentDetail;
use App\Models\UISetting;
use App\Models\User;
use App\Models\UserGroup;
use App\Models\VisitorDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as SystemLog;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AttendanceScanController extends Controller
{
    public function index()
    {
        $uiSettings = UISetting::latest()->first();

        return Inertia::render('attendance/index', [
            'uiSettings' => $uiSettings,
            'recentScans' => $this->getRecentScansList(),
        ]);
    }

    public function recentScans()
    {
        return response()->json([
            'status' => 'success',
            'recentScans' => $this->getRecentScansList(),
        ]);
    }

    private function getRecentScansList(int $limit = 5): array
    {
        $logs = UserLog::with(['user.students', 'user.employees', 'user.visitors', 'user.privileges'])
            ->latest('id')
            ->take($limit)
            ->get();

        return $logs->map(function ($log) {
            $user = $log->user;
            if (! $user) {
                return [
                    'id' => $log->id,
                    'name' => 'Unknown User',
                    'groupName' => 'Visitor',
                    'timeLabel' => Carbon::parse($log->updated_at ?? $log->time_in)->format('h:i A'),
                    'type' => $log->computer_use === 'Yes' ? 'Online Research Use' : ($log->time_out ? 'Time Out' : 'Time In'),
                    'image' => null,
                ];
            }

            $userType = $user->privileges->user_type ?? ($user->visitors ? 'Visitor' : 'User');
            $type = 'Time In';
            if ($log->computer_use === 'Yes') {
                $type = 'Online Research Use';
            } elseif ($log->time_out !== null || strtolower($log->remarks ?? '') === 'on time') {
                $type = 'Time Out';
            }

            $timeValue = $log->time_out ?? $log->time_in ?? $log->updated_at ?? $log->created_at;

            return [
                'id' => $log->id,
                'name' => $user->name,
                'groupName' => ucfirst($userType),
                'timeLabel' => $timeValue ? Carbon::parse($timeValue)->format('h:i A') : 'Just now',
                'type' => $type,
                'image' => $user->profile_image ? (str_starts_with($user->profile_image, 'data:') ? $user->profile_image : asset($user->profile_image)) : null,
            ];
        })->toArray();
    }

    public function scanRfid(Request $request)
    {
        // Decode base64 payload if provided
        if ($request->has('payload')) {
            try {
                $decoded = json_decode(base64_decode($request->payload), true);
                if (isset($decoded['rfid'])) {
                    $request->merge(['rfid' => $decoded['rfid']]);
                }
            } catch (\Throwable $e) {
                SystemLog::error('Attendance payload decoding failed: '.$e->getMessage());
            }
        }

        $identifier = trim(
            $request->input('rfid')
                ?? $request->input('id_number')
                ?? $request->input('employee_id')
                ?? $request->input('email')
                ?? ''
        );

        if (empty($identifier)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please scan your RFID card or enter your ID number.',
            ], 400);
        }

        $user = null;

        // 1. Search by email (for registered visitors)
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = User::whereRaw('LOWER(TRIM(email)) = ?', [strtolower($identifier)])->first();
        }

        // 2. Search by RFID directly
        if (! $user) {
            $user = User::where('rfid', $identifier)->first();
        }

        // 3. Search by student ID number
        if (! $user) {
            $studentDetail = StudentDetail::whereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($identifier)])->first();
            if ($studentDetail) {
                $user = $studentDetail->users;
            }
        }

        // 4. Search by employee ID
        if (! $user) {
            $employeeDetail = EmployeeDetail::whereRaw('LOWER(TRIM(employee_id)) = ?', [strtolower($identifier)])->first();
            if ($employeeDetail) {
                $user = $employeeDetail->users;
            }
        }

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'ID number / RFID code not found. Please try again or fill out the visitor form.',
            ], 404);
        }

        // Group & role details
        $groupName = 'User';
        if ($user->privileges) {
            $groupName = $user->privileges->user_type;
        } elseif ($user->visitors) {
            $groupName = 'Visitor';
        }

        $level = null;
        $section = null;
        $role = null;

        if (strtolower($groupName) === 'student' && $user->students) {
            $level = $user->students->level;
            $section = $user->students->section;
        } elseif ($user->employees) {
            $role = $user->employees->employee_role;
        }

        // Toggle Time In / Time Out
        $currentTime = Carbon::now('Asia/Manila');

        $activeLog = UserLog::where('user_id', $user->id)
            ->where(function ($query) {
                $query->where('remarks', 'await')
                    ->orWhereNull('time_out');
            })
            ->latest('id')
            ->first();

        if ($activeLog && strtolower($activeLog->remarks ?? '') === 'await' && ! $activeLog->time_out) {
            // Record TIME OUT
            $activeLog->time_out = $currentTime->toDateTimeString();
            $activeLog->remarks = 'On Time';
            $activeLog->save();

            $scanType = 'Time Out';
            $message = 'Time Out recorded for '.$user->name;
        } else {
            // Record TIME IN
            $newLog = new UserLog;
            $newLog->user_id = $user->id;
            $newLog->computer_use = 'No';
            $newLog->time_in = $currentTime->toDateTimeString();
            $newLog->remarks = 'await';
            $newLog->save();

            $scanType = 'Time In';
            $message = 'Time In recorded for '.$user->name;
        }

        $userData = [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->name,
            'group_name' => $groupName,
            'level' => $level,
            'section' => $section,
            'role' => $role,
            'image' => $user->profile_image ? (str_starts_with($user->profile_image, 'data:') ? $user->profile_image : asset($user->profile_image)) : null,
            'scanType' => $scanType,
        ];

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'remarks' => $scanType === 'Time Out' ? 'On Time' : 'await',
            'data' => $userData,
            'recentScan' => [
                'id' => $user->id.'-'.time(),
                'name' => $user->name,
                'groupName' => ucfirst($groupName),
                'timeLabel' => $currentTime->format('h:i A'),
                'type' => $scanType,
                'image' => $userData['image'],
            ],
        ]);
    }

    public function storeVisitor(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'gender' => 'required|string',
            'purpose' => 'required|string|max:255',
            'school_org' => 'required|string|max:255',
        ]);

        $visitorGroup = UserGroup::whereRaw('LOWER(user_type) = ?', ['visitor'])->first();
        $privilegeId = $visitorGroup ? $visitorGroup->id : null;

        // Check if user already exists by email
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->first();

        if (! $user) {
            $user = User::create([
                'email' => strtolower($validated['email']),
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'suffix' => $validated['suffix'] ?? null,
                'gender' => $validated['gender'],
                'privilege_id' => $privilegeId,
                'password' => bcrypt(Str::random(16)),
            ]);
        }

        VisitorDetail::updateOrCreate(
            ['user_id' => $user->id],
            [
                'purpose' => $validated['purpose'],
                'school_org' => $validated['school_org'],
            ]
        );

        // Auto log Time In for visitor
        $currentTime = Carbon::now('Asia/Manila');
        $newLog = new UserLog;
        $newLog->user_id = $user->id;
        $newLog->computer_use = 'No';
        $newLog->time_in = $currentTime->toDateTimeString();
        $newLog->remarks = 'await';
        $newLog->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor Time In recorded for '.$user->name,
            'recentScan' => [
                'id' => $user->id.'-'.time(),
                'name' => $user->name,
                'groupName' => 'Visitor',
                'timeLabel' => $currentTime->format('h:i A'),
                'type' => 'Time In',
                'image' => null,
            ],
        ]);
    }

    public function storeComputerUse(Request $request)
    {
        $identifier = trim($request->input('identifier') ?? $request->input('rfid') ?? '');

        if (empty($identifier)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please enter your ID Number or scan RFID.',
            ], 400);
        }

        $user = User::where('rfid', $identifier)
            ->orWhereRaw('LOWER(email) = ?', [strtolower($identifier)])
            ->first();

        if (! $user) {
            $studentDetail = StudentDetail::whereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($identifier)])->first();
            if ($studentDetail) {
                $user = $studentDetail->users;
            }
        }

        if (! $user) {
            $employeeDetail = EmployeeDetail::whereRaw('LOWER(TRIM(employee_id)) = ?', [strtolower($identifier)])->first();
            if ($employeeDetail) {
                $user = $employeeDetail->users;
            }
        }

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found for online research use logging.',
            ], 404);
        }

        $currentTime = Carbon::now('Asia/Manila');
        $newLog = new UserLog;
        $newLog->user_id = $user->id;
        $newLog->computer_use = 'Yes';
        $newLog->time_in = $currentTime->toDateTimeString();
        $newLog->remarks = 'Online Research Use';
        $newLog->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Computer station scan recorded for '.$user->name,
            'recentScan' => [
                'id' => $user->id.'-'.time(),
                'name' => $user->name,
                'groupName' => ucfirst($user->privileges->user_type ?? 'User'),
                'timeLabel' => $currentTime->format('h:i A'),
                'type' => 'Online Research Use',
                'image' => null,
            ],
        ]);
    }
}
