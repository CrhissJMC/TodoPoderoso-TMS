<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\PassengerController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\PackageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirigir la raíz al Login
Route::get('/', function () {
    return redirect()->route('login');
});

// Dashboard protegido
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ── GRUPO SEGURO: Solo usuarios logueados pueden acceder aquí ──
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Perfil de Usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Módulo de Vehículos
    Route::resource('vehicles', VehicleController::class)
         ->only(['index', 'store', 'update', 'destroy']);
    Route::patch('vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus'])
         ->name('vehicles.updateStatus');

    // Módulo de Conductores
    Route::resource('drivers', DriverController::class)
         ->only(['index', 'store', 'update', 'destroy']);
    Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])
         ->name('drivers.updateStatus');

    // Módulo de Rutas y Paradas
    Route::resource('routes', RouteController::class)
         ->only(['index', 'store', 'update', 'destroy']);
    Route::patch('routes/{route}/toggle-active', [RouteController::class, 'toggleActive'])
         ->name('routes.toggleActive');
      
    // Módulo de Horarios
    Route::resource('schedules', ScheduleController::class)
         ->only(['index', 'store', 'update', 'destroy']);
    Route::patch('schedules/{schedule}/toggle-active', [ScheduleController::class, 'toggleActive'])
         ->name('schedules.toggleActive');

    // ── CORRECCIONES APLICADAS DESDE AQUÍ ──

    // Módulo de Pasajeros
    Route::resource('passengers', PassengerController::class)
         ->only(['index', 'store', 'update', 'destroy']);
    // Agregamos la ruta de búsqueda por DNI en lugar de toggle-active
    Route::post('passengers/search-by-dni', [PassengerController::class, 'searchByDni'])
         ->name('passengers.searchByDni');
     
    // Módulo de Viajes
    // Usamos 'except' en lugar de 'only' para que Laravel SÍ cree la ruta trips.show
    Route::resource('trips', TripController::class)
         ->except(['create', 'edit']); 
    // Usamos updateStatus en lugar de toggleActive
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])
         ->name('trips.updateStatus');
         
    // Módulo de Boletos
    Route::resource('tickets', TicketController::class)
         ->except(['create', 'edit', 'show']);
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus'])
         ->name('tickets.updateStatus');
     
     Route::resource('packages', PackageController::class)
         ->only(['index', 'store', 'update', 'destroy']);

    Route::patch('packages/{package}/status', [PackageController::class, 'updateStatus'])
         ->name('packages.updateStatus');

    // Consulta de rastreo (puede exponerse sin auth si se desea)
    Route::get('packages/track', [PackageController::class, 'track'])
         ->name('packages.track');
         
});

require __DIR__.'/auth.php';