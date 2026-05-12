<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Log;
use App\Models\UISetting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class ComputerUseController extends Controller
{
  public function index(Request $request)
  {
    $search = $request->input('search', '');
    $from = $request->input('start', '');
    $to = $request->input('end', '');
    $userType = $request->input('user_type', 'students');
    $perPage = $request->input('perPage', 10);

    $validator = Validator::make($request->all(), [
      'perPage' => 'nullable|integer|min:1|max:500',
    ]);
    if ($validator->fails()) {
      return back()->withErrors($validator)->withInput();
    }

    $query = Log::with('user');
    if (!empty($search)) {
      $query->whereHas('user', function ($q) use ($search) {
        $q->where('first_name', 'like', "%$search%")
          ->orWhere('last_name', 'like', "%$search%")
          ->orWhere('email', 'like', "%$search%");
      });
    }
    if (!empty($from)) {
      $query->whereDate('time_in', '>=', $from);
    }
    if (!empty($to)) {
      $query->whereDate('time_in', '<=', $to);
    }

    $data = $query->orderBy('time_in', 'desc')->paginate($perPage)->withQueryString();

    $hours = $data->pluck('time_in')->filter()->map(function ($t) {
      return date('H', strtotime($t));
    })->toArray();
    $hourCounts = array_count_values($hours);
    $peakHour = '00:00';
    if (!empty($hourCounts)) {
      $max = array_search(max($hourCounts), $hourCounts);
      $peakHour = sprintf('%02d:00', $max);
    }

    $ui = UISetting::latest()->first();

    return Inertia::render('report/computers', [
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
   * CSV export for computer use report
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
      $filename = 'computer-use-' . date('YmdHis') . '.csv';
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
            $r->user ? ($r->user->first_name . ' ' . $r->user->last_name) : '',
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
}
