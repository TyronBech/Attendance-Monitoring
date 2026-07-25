<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\UISetting;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserLogsController extends Controller
{
    /**
     * Display the attendance monitoring report page.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $from = $request->input('start', '');
        $to = $request->input('end', '');
        $userType = $request->input('user_type', 'all');
        $perPage = $request->input('perPage', 10);

        $validator = Validator::make($request->all(), [
            'start' => 'nullable|date',
            'end' => 'nullable|date|after_or_equal:start',
            'search' => 'nullable|string|max:255',
            'user_type' => 'nullable|in:all,student,employee,visitor',
            'perPage' => 'nullable|integer|min:1|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $this->generateData($request, new Log, false);

        $hours = $data->map(function ($item) {
            return Carbon::parse($item->time_in)->format('H:i:s');
        });
        $peakHour = $this->computePeakHourLabel($this->findPeakHour($hours));

        $ui = UISetting::latest()->first();

        return Inertia::render('report/user-logs', [
            'data' => $data,
            'search' => $search,
            'fromInputDate' => $from,
            'toInputDate' => $to,
            'peak_hour' => $peakHour,
            'perPage' => $perPage,
            'userType' => $userType,
            'ui' => $ui,
        ]);
    }

    /**
     * Export attendance monitoring report as PDF.
     */
    public function exportPdf(Request $request)
    {
        $data = $this->generateData($request, new Log, true);
        $this->generatePDF($data);

        return redirect()->route('report.user-logs')->with('toast-success', 'Successfully exported to PDF');
    }

    /**
     * Simple CSV export for user logs.
     */
    public function export(Request $request)
    {
        $format = $request->input('format', 'csv');
        $query = Log::with('user');
        if ($request->filled('start')) {
            $query->whereDate('time_in', '>=', $request->input('start'));
        }
        if ($request->filled('end')) {
            $query->whereDate('time_in', '<=', $request->input('end'));
        }
        $rows = $query->orderBy('time_in', 'desc')->get();

        if ($format === 'csv') {
            $filename = 'user-logs-'.date('YmdHis').'.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];
            $callback = function () use ($rows) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['id', 'user', 'computer_use', 'time_in', 'time_out', 'remarks']);
                foreach ($rows as $r) {
                    fputcsv($out, [
                        $r->id,
                        $r->user ? ($r->user->first_name.' '.$r->user->last_name) : '',
                        $r->computer_use,
                        $r->time_in,
                        $r->time_out,
                        $r->remarks,
                    ]);
                }
                fclose($out);
            };

            return response()->stream($callback, 200, $headers);
        }

        return redirect()->back();
    }

    /**
     * Return JSON aggregation for graphs (count per date).
     */
    public function graph(Request $request)
    {
        $query = Log::query();
        if ($request->filled('start')) {
            $query->whereDate('time_in', '>=', $request->input('start'));
        }
        if ($request->filled('end')) {
            $query->whereDate('time_in', '<=', $request->input('end'));
        }
        $data = $query->selectRaw('DATE(time_in) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    /**
     * Generate the query data for display or export.
     *
     * @return Collection|LengthAwarePaginator
     */
    private function generateData(Request $request, Log $model, bool $isExport = false)
    {
        $startStr = $request->input('start');
        $endStr = $request->input('end');
        $search = strtolower($request->input('search', ''));
        $userType = $request->input('user_type', 'all');
        $perPage = $request->input('perPage', 10);

        $query = $model->newQuery()
            ->with([
                'user:id,privilege_id,first_name,middle_name,last_name',
                'user.privileges',
            ])
            ->whereHas('user')
            ->where('computer_use', 'No')
            ->whereNotNull('time_in');

        if ($startStr && $endStr) {
            $query->whereDate('time_in', '>=', $startStr);
            $query->whereDate('time_in', '<=', $endStr);
        }

        if (strlen($search) > 0) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(first_name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(CONCAT(first_name, " ", last_name)) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(CONCAT(last_name, ", ", first_name)) LIKE ?', ["%{$search}%"]);
                });
            });
        }

        if ($userType !== 'all') {
            $query->whereHas('user.privileges', function ($q) use ($userType) {
                $q->where('user_type', $userType);
            });
        }

        $query->orderBy('time_in', 'desc')->orderBy('id', 'desc');

        if ($isExport) {
            $data = $query->get();
            if ($data->isNotEmpty()) {
                $min = $data->last()->time_in;
                $max = $data->first()->time_in;
                $data->reporting_period = 'From '.Carbon::parse($min)->format('F j, Y').' to '.Carbon::parse($max)->format('F j, Y');
            } else {
                $data->reporting_period = 'N/A';
            }

            return $data;
        }

        return $query->paginate($perPage)->appends($request->all());
    }

    /**
     * Generate PDF using Dompdf and stream it.
     */
    private function generatePDF(Collection $data): void
    {
        ini_set('memory_limit', '2048M');
        ini_set('max_execution_time', 300);

        $settings = UISetting::first() ?? new UISetting;
        $items = [
            'title' => 'Attendance Monitoring Report',
            'logo' => $settings->org_logo_full ?? base64_encode(file_get_contents(public_path('img/BPSLogoFull.png'))),
            'user' => Auth::user()->first_name.' '.Auth::user()->last_name,
            'date' => 'as of '.date('F j, Y'),
            'data' => $data,
            'totalCount' => $data->count(),
        ];

        $options = new Options;
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(view('pdf.user-pdf-report', $items));
        $dompdf->setPaper('legal', 'portrait');
        $dompdf->render();
        $dompdf->stream('users-report '.date('Y-m-d').'.pdf', ['Attachment' => true]);
        exit;
    }

    /**
     * Find the peak hour from a collection of time strings.
     */
    private function findPeakHour($times): string
    {
        $hourCounts = [];
        foreach ($times as $time) {
            $hour = substr($time, 0, 2);
            $hourCounts[$hour] = isset($hourCounts[$hour]) ? $hourCounts[$hour] + 1 : 1;
        }
        if (count($hourCounts) === 0) {
            return '00';
        }
        $maxCount = 0;
        $peakHour = '00';
        foreach ($hourCounts as $hour => $count) {
            if ($count > $maxCount) {
                $maxCount = $count;
                $peakHour = $hour;
            }
        }

        return $peakHour;
    }

    /**
     * Convert numeric hour string to human-readable label.
     */
    private function computePeakHourLabel(string $hour): string
    {
        $h = (int) $hour;
        if ($h === 12) {
            return '12:00 PM';
        }
        if ($h === 0) {
            return '12:00 AM';
        }
        if ($h > 12) {
            return ($h - 12).':00 PM';
        }

        return $h.':00 AM';
    }
}
