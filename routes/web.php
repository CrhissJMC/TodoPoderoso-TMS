<?php

use App\Http\Controllers\ProfileController;
use App\Http\Requests\VehicleRequest;
use App\Http\Controllers\VehicleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::resource('vehicles', VehicleController::class)
     ->only(['index', 'store', 'update', 'destroy']);

Route::patch('vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus'])
     ->name('vehicles.updateStatus');

require __DIR__.'/auth.php';
