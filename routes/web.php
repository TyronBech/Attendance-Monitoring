<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $settings = App\Models\UISetting::latest()->first();
    return view('main-welcome', ['settings' => $settings]);
})->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Reports (User logs + Computer use)
    Route::prefix('report')->group(function () {
        Route::get('user-logs', [\App\Http\Controllers\Report\UserLogsController::class, 'index'])->name('report.user-logs');
        Route::get('user-logs/export', [\App\Http\Controllers\Report\UserLogsController::class, 'export'])->name('report.user-logs.export');
        Route::get('user-logs/graph', [\App\Http\Controllers\Report\UserLogsController::class, 'graph'])->name('report.user-logs.graph');

        Route::get('computer-use', [\App\Http\Controllers\Report\ComputerUseController::class, 'index'])->name('report.computer-use');
        Route::get('computer-use/export', [\App\Http\Controllers\Report\ComputerUseController::class, 'export'])->name('report.computer-use.export');
        Route::get('computer-use/graph', [\App\Http\Controllers\Report\ComputerUseController::class, 'graph'])->name('report.computer-use.graph');
    });
});

require __DIR__ . '/settings.php';
