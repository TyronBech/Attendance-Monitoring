<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\UISetting;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the home analytics dashboard.
     */
    public function index()
    {
        $now = Carbon::now();

        // 1. Currently time-in users in the library (active, time_out is null)
        $currentlyActiveLibraryCount = Log::where('computer_use', 'No')
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->count();

        // 2. Currently computer use counts (active, time_out is null)
        $currentlyActiveComputerCount = Log::where('computer_use', 'Yes')
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->count();

        // 3. Last 12 Months period start & end
        $startPeriod = $now->copy()->subMonths(11)->startOfMonth();
        $endPeriod = $now->copy()->endOfMonth();

        // 12 Months Library Time-In Users
        $libraryLogsPeriod = Log::where('computer_use', 'No')
            ->whereNotNull('time_in')
            ->whereBetween('time_in', [$startPeriod, $endPeriod])
            ->select(['id', 'time_in'])
            ->get()
            ->groupBy(function ($log) {
                return Carbon::parse($log->time_in)->format('Y-m');
            });

        $libraryMonthlyGraph = [];
        $monthlyLibraryTotalCount = 0;

        for ($i = 11; $i >= 0; $i--) {
            $monthDate = $now->copy()->subMonths($i);
            $key = $monthDate->format('Y-m');
            $count = isset($libraryLogsPeriod[$key]) ? $libraryLogsPeriod[$key]->count() : 0;
            $monthlyLibraryTotalCount += $count;

            $libraryMonthlyGraph[] = [
                'date' => $key,
                'label' => $monthDate->format('F Y'),
                'shortLabel' => $monthDate->format('M'),
                'count' => $count,
            ];
        }

        // 12 Months Computer Logs
        $computerLogsPeriod = Log::where('computer_use', 'Yes')
            ->whereNotNull('time_in')
            ->whereBetween('time_in', [$startPeriod, $endPeriod])
            ->select(['id', 'time_in'])
            ->get()
            ->groupBy(function ($log) {
                return Carbon::parse($log->time_in)->format('Y-m');
            });

        $computerMonthlyGraph = [];
        $monthlyComputerTotalCount = 0;

        for ($i = 11; $i >= 0; $i--) {
            $monthDate = $now->copy()->subMonths($i);
            $key = $monthDate->format('Y-m');
            $count = isset($computerLogsPeriod[$key]) ? $computerLogsPeriod[$key]->count() : 0;
            $monthlyComputerTotalCount += $count;

            $computerMonthlyGraph[] = [
                'date' => $key,
                'label' => $monthDate->format('F Y'),
                'shortLabel' => $monthDate->format('M'),
                'count' => $count,
            ];
        }

        $periodLabel = $startPeriod->format('M Y').' - '.$endPeriod->format('M Y');

        // Helper closure to format Grade & Section
        $formatGradeSection = function ($user) {
            if (! $user) {
                return 'N/A';
            }

            if ($user->students) {
                $lvl = trim((string) ($user->students->level ?? ''));
                $sec = trim((string) ($user->students->section ?? ''));

                if ($lvl !== '' && $sec !== '') {
                    $levelFormatted = str_starts_with(strtolower($lvl), 'grade') ? $lvl : "Grade {$lvl}";

                    return "{$levelFormatted} - {$sec}";
                }

                if ($lvl !== '') {
                    return str_starts_with(strtolower($lvl), 'grade') ? $lvl : "Grade {$lvl}";
                }

                if ($sec !== '') {
                    return $sec;
                }
            }

            if ($user->employees) {
                return $user->employees->employee_role ?? 'Employee';
            }

            if ($user->visitors) {
                return $user->visitors->school_org ?? 'Visitor';
            }

            return 'N/A';
        };

        // 4. Top 10 recent time-in users in the library (most recent as no. 1)
        $recentLibraryUsers = Log::with(['user.students', 'user.employees', 'user.visitors', 'user.privileges'])
            ->where('computer_use', 'No')
            ->whereNotNull('time_in')
            ->orderBy('time_in', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->values()
            ->map(function ($log, $index) use ($formatGradeSection) {
                $user = $log->user;
                $userType = $user ? ucfirst($user->privileges->user_type ?? ($user->visitors ? 'Visitor' : 'User')) : 'User';

                return [
                    'rank' => $index + 1,
                    'id' => $log->id,
                    'name' => $user ? $user->name : 'Unknown User',
                    'user_type' => $userType,
                    'grade_section' => $formatGradeSection($user),
                    'time_in' => Carbon::parse($log->time_in)->format('M d, Y h:i A'),
                    'avatar' => $user ? $user->avatar : null,
                ];
            });

        // 5. Top 10 recent computer use logs (most recent as no. 1)
        $recentComputerUsers = Log::with(['user.students', 'user.employees', 'user.visitors', 'user.privileges'])
            ->where('computer_use', 'Yes')
            ->whereNotNull('time_in')
            ->orderBy('time_in', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->values()
            ->map(function ($log, $index) use ($formatGradeSection) {
                $user = $log->user;
                $userType = $user ? ucfirst($user->privileges->user_type ?? ($user->visitors ? 'Visitor' : 'User')) : 'User';

                return [
                    'rank' => $index + 1,
                    'id' => $log->id,
                    'name' => $user ? $user->name : 'Unknown User',
                    'user_type' => $userType,
                    'grade_section' => $formatGradeSection($user),
                    'time_in' => Carbon::parse($log->time_in)->format('M d, Y h:i A'),
                    'remarks' => $log->remarks ?? 'Online Research',
                    'avatar' => $user ? $user->avatar : null,
                ];
            });

        $ui = UISetting::latest()->first();

        return Inertia::render('dashboard', [
            'metrics' => [
                'currentlyActiveLibrary' => $currentlyActiveLibraryCount,
                'currentlyActiveComputer' => $currentlyActiveComputerCount,
                'monthlyLibraryTotal' => $monthlyLibraryTotalCount,
                'monthlyLibraryGraph' => $libraryMonthlyGraph,
                'monthlyComputerTotal' => $monthlyComputerTotalCount,
                'monthlyComputerGraph' => $computerMonthlyGraph,
                'periodLabel' => $periodLabel,
            ],
            'recentLibraryUsers' => $recentLibraryUsers,
            'recentComputerUsers' => $recentComputerUsers,
            'currentMonthName' => $now->format('F Y'),
            'ui' => $ui,
        ]);
    }
}
