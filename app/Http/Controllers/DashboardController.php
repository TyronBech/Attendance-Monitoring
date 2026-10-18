<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\UISetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the home analytics dashboard.
     */
    public function index(): Response
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
        $formatGradeSection = function (?User $user): string {
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

        $topUsers = function (string $computerUse) use ($formatGradeSection): Collection {
            return Log::with(['user.students', 'user.employees', 'user.visitors', 'user.privileges'])
                ->where('computer_use', $computerUse)
                ->whereNotNull('time_in')
                ->whereHas('user')
                ->select('user_id')
                ->selectRaw('COUNT(*) as activity_count')
                ->groupBy('user_id')
                ->orderByDesc('activity_count')
                ->orderBy('user_id')
                ->limit(5)
                ->get()
                ->values()
                ->map(function (Log $log, int $index) use ($formatGradeSection): array {
                    $user = $log->user;

                    return [
                        'rank' => $index + 1,
                        'id' => $user->id,
                        'name' => $user->name,
                        'user_type' => ucfirst($user->privileges->user_type ?? ($user->visitors ? 'Visitor' : 'User')),
                        'grade_section' => $formatGradeSection($user),
                        'count' => (int) $log->activity_count,
                        'avatar' => $user->avatar,
                    ];
                });
        };

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
            'topLibraryUsers' => $topUsers('No'),
            'topResearchUsers' => $topUsers('Yes'),
            'currentMonthName' => $now->format('F Y'),
            'ui' => $ui,
        ]);
    }
}
