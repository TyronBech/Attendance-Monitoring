<?php

use App\Http\Controllers\Report\ComputerUseController;
use App\Http\Controllers\Report\UserLogsController;
use App\Models\UISetting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    $settings = UISetting::latest()->first();

    return view('main-welcome', ['settings' => $settings]);
})->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

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
