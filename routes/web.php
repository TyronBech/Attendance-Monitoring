<?php

use App\Http\Controllers\AttendanceScanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Report\ComputerUseController;
use App\Http\Controllers\Report\UserLogsController;
use App\Models\UISetting;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $settings = UISetting::latest()->first();

    return Inertia::render('welcome', ['ui' => $settings]);
})->middleware('guest')->name('home');

// Attendance Scanning Routes (Requires Auth & Attendance Display / Admin Role)
Route::middleware(['auth', 'attendance_display'])->group(function () {
    Route::get('/attendance', [AttendanceScanController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/scan', [AttendanceScanController::class, 'scanRfid'])->name('attendance.scan');
    Route::get('/attendance/recent-scans', [AttendanceScanController::class, 'recentScans'])->name('attendance.recent-scans');
    Route::post('/attendance/visitor', [AttendanceScanController::class, 'storeVisitor'])->name('attendance.visitor');
    Route::post('/attendance/computer-use', [AttendanceScanController::class, 'storeComputerUse'])->name('attendance.computer-use');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Reports (User logs + Computer use)
    Route::prefix('report')->group(function () {
        Route::get('user-logs', [UserLogsController::class, 'index'])->name('report.user-logs');
        Route::get('user-logs/export', [UserLogsController::class, 'export'])->name('report.user-logs.export');
        Route::get('user-logs/export-pdf', [UserLogsController::class, 'exportPdf'])->name('report.user-logs.export-pdf');
        Route::get('user-logs/graph', [UserLogsController::class, 'graph'])->name('report.user-logs.graph');

        Route::get('computer-use', [ComputerUseController::class, 'index'])->name('report.computer-use');
        Route::get('computer-use/export', [ComputerUseController::class, 'export'])->name('report.computer-use.export');
        Route::get('computer-use/export-pdf', [ComputerUseController::class, 'exportPdf'])->name('report.computer-use.export-pdf');
        Route::get('computer-use/graph', [ComputerUseController::class, 'graph'])->name('report.computer-use.graph');
    });
});

require __DIR__.'/settings.php';
