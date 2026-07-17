<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\DriverLicenseController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Página de Bienvenida y Rastreo Público
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'activeRoutes' => App\Models\Route::with('prices')->where('active', true)->orderBy('name')->get(['id', 'name', 'base_fare', 'origin', 'destination']),
    ]);
});

// Rastreo Público de Encomiendas API
Route::get('/api/track', [PackageController::class, 'track'])->name('packages.track.public');

// Dashboard protegido
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// ── GRUPO SEGURO: Solo usuarios logueados pueden acceder aquí ──
Route::middleware(['auth', 'verified'])->group(function () {

    // Perfil de Usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Renovación de Licencia (Chofer)
    Route::get('/driver/license/renew', [DriverLicenseController::class, 'showRenewForm'])->name('driver.license.renew');
    Route::post('/driver/license/renew', [DriverLicenseController::class, 'processRenewal']);

    // Módulo de Vehículos
    Route::middleware('permission:vehiculos.ver')->group(function () {
        Route::get('vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
        Route::get('vehicles/{vehicle}', [VehicleController::class, 'show'])->name('vehicles.show');
    });
    Route::middleware('permission:vehiculos.admin')->group(function () {
        Route::post('vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
        Route::put('vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
        Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
        Route::patch('vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('vehicles.updateStatus');
    });

    // Módulo de Conductores
    Route::middleware('permission:conductores.ver')->group(function () {
        Route::get('drivers', [DriverController::class, 'index'])->name('drivers.index');
        Route::get('drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
    });
    Route::middleware('permission:conductores.admin')->group(function () {
        Route::post('drivers', [DriverController::class, 'store'])->name('drivers.store');
        Route::put('drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
        Route::delete('drivers/{driver}', [DriverController::class, 'destroy'])->name('drivers.destroy');
        Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.updateStatus');
    });

    // Módulo de Rutas y Paradas
    Route::middleware('permission:rutas.ver')->group(function () {
        Route::get('routes', [RouteController::class, 'index'])->name('routes.index');
        Route::get('routes/{route}', [RouteController::class, 'show'])->name('routes.show');
    });
    Route::middleware('permission:rutas.admin')->group(function () {
        Route::post('routes', [RouteController::class, 'store'])->name('routes.store');
        Route::put('routes/{route}', [RouteController::class, 'update'])->name('routes.update');
        Route::delete('routes/{route}', [RouteController::class, 'destroy'])->name('routes.destroy');
        Route::patch('routes/{route}/toggle-active', [RouteController::class, 'toggleActive'])->name('routes.toggleActive');
    });

    // Módulo de Horarios
    Route::middleware('permission:horarios.ver')->group(function () {
        Route::get('schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::get('schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
    });
    Route::middleware('permission:horarios.admin')->group(function () {
        Route::post('schedules', [ScheduleController::class, 'store'])->name('schedules.store');
        Route::put('schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
        Route::delete('schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');
        Route::patch('schedules/{schedule}/toggle-active', [ScheduleController::class, 'toggleActive'])->name('schedules.toggleActive');
    });

    // Módulo de Clientes
    Route::middleware('permission:clientes.ver')->group(function () {
        Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
        Route::get('clients/{client}', [ClientController::class, 'show'])->name('clients.show');
    });
    Route::middleware('permission:clientes.admin')->group(function () {
        Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
        Route::put('clients/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
        Route::post('clients/search-by-document', [ClientController::class, 'searchByDocument'])->name('clients.searchByDocument');
    });

    // Módulo de Viajes
    Route::middleware('permission:viajes.ver')->group(function () {
        Route::get('trips', [TripController::class, 'index'])->name('trips.index');
        Route::get('trips/{trip}', [TripController::class, 'show'])->name('trips.show');
    });
    Route::middleware('permission:viajes.admin')->group(function () {
        Route::post('trips', [TripController::class, 'store'])->name('trips.store');
        Route::put('trips/{trip}', [TripController::class, 'update'])->name('trips.update');
        Route::delete('trips/{trip}', [TripController::class, 'destroy'])->name('trips.destroy');
        Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.updateStatus');
    });

    // Módulo de Boletos
    Route::middleware('permission:boletos.ver')->group(function () {
        Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
        Route::get('trips/{trip}/seat-map', [TicketController::class, 'seatMap'])->name('trips.seatMap');
    });
    Route::middleware('permission:boletos.admin')->group(function () {
        Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store');
        Route::put('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
        Route::delete('tickets/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy');
        Route::patch('tickets/{ticket}/board', [TicketController::class, 'markBoarded'])->name('tickets.markBoarded');
    });

    // Módulo de Encomiendas
    Route::middleware('permission:encomiendas.ver')->group(function () {
        Route::get('packages', [PackageController::class, 'index'])->name('packages.index');
        Route::get('packages/{package}', [PackageController::class, 'show'])->name('packages.show');
    });
    Route::middleware('permission:encomiendas.admin')->group(function () {
        Route::post('packages', [PackageController::class, 'store'])->name('packages.store');
        Route::put('packages/{package}', [PackageController::class, 'update'])->name('packages.update');
        Route::delete('packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::patch('packages/{package}/status', [PackageController::class, 'updateStatus'])->name('packages.updateStatus');
        Route::patch('packages/{package}/assign-trip', [PackageController::class, 'assignTrip'])->name('packages.assignTrip');
    });

    // Módulo de Comprobantes
    Route::get('receipts/ticket/{ticket}/voucher', [ReceiptController::class, 'ticketVoucher'])->name('receipts.ticket.voucher');
    Route::get('receipts/ticket/{ticket}/boleta', [ReceiptController::class, 'ticketBoleta'])->name('receipts.ticket.boleta');
    Route::get('receipts/ticket/{ticket}/factura', [ReceiptController::class, 'ticketFactura'])->name('receipts.ticket.factura');

    Route::get('receipts/package/{package}/voucher', [ReceiptController::class, 'packageVoucher'])->name('receipts.package.voucher');
    Route::get('receipts/package/{package}/boleta', [ReceiptController::class, 'packageBoleta'])->name('receipts.package.boleta');
    Route::get('receipts/package/{package}/factura', [ReceiptController::class, 'packageFactura'])->name('receipts.package.factura');

    // ── MÓDULO DE EMPRESA (Solo Administrador) ──
    Route::middleware('role:administrador')->group(function () {
        Route::get('admin/empresa', [CompanyController::class, 'edit'])->name('admin.company.edit');
        Route::put('admin/empresa', [CompanyController::class, 'update'])->name('admin.company.update');
        Route::put('admin/empresa/precios', [CompanyController::class, 'updatePrices'])->name('admin.company.prices.update');
    });

    // ── MÓDULO DE ROLES Y USUARIOS (Solo Administrador) ──
    Route::middleware('role:administrador')->group(function () {
        // Roles
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');

        // Usuarios
        Route::resource('users', UserController::class)
            ->except(['create', 'edit', 'show']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])
            ->name('users.updateStatus');
    });

});

require __DIR__.'/auth.php';
