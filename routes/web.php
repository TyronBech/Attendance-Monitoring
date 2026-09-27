<?php

use App\Http\Controllers\AttendanceScanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Import\ImportController;
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

    // Bulk Import (Students + Employees)
    Route::prefix('import')->group(function () {
        Route::get('students', [ImportController::class, 'studentsIndex'])->name('import.students');
        Route::get('students/template', [ImportController::class, 'downloadStudentTemplate'])->name('import.students.template');
        Route::post('students/preview', [ImportController::class, 'previewStudents'])->name('import.students.preview');
        Route::post('students/execute', [ImportController::class, 'importStudents'])->name('import.students.execute');

        Route::get('employees', [ImportController::class, 'employeesIndex'])->name('import.employees');
        Route::get('employees/template', [ImportController::class, 'downloadEmployeeTemplate'])->name('import.employees.template');
        Route::post('employees/preview', [ImportController::class, 'previewEmployees'])->name('import.employees.preview');
        Route::post('employees/execute', [ImportController::class, 'importEmployees'])->name('import.employees.execute');
    });
});

require __DIR__.'/settings.php';
