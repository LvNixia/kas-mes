<?php

use App\Http\Controllers\KasController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route(Auth::check() ? 'kas' : 'login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('kas', [KasController::class, 'index'])->name('kas');
    Route::post('kas/transactions', [KasController::class, 'storeTransaction'])->name('kas.transactions.store');
    Route::post('kas/transactions/{transaction}', [KasController::class, 'updateTransaction'])->name('kas.transactions.update');
    Route::delete('kas/transactions/{transaction}', [KasController::class, 'destroyTransaction'])->name('kas.transactions.destroy');
    Route::post('kas/categories', [KasController::class, 'storeCategory'])->name('kas.categories.store');
    Route::delete('kas/categories/{category}', [KasController::class, 'destroyCategory'])->name('kas.categories.destroy');
    Route::patch('kas/settings', [KasController::class, 'updateSettings'])->name('kas.settings.update');
    Route::get('kas/backup', [KasController::class, 'downloadBackup'])->name('kas.backup');
    Route::post('kas/restore', [KasController::class, 'restore'])->name('kas.restore');
});

require __DIR__.'/settings.php';
