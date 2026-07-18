<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Driver;
use App\Models\Package;
use App\Models\Route;
use App\Models\RoutePrice;
use App\Models\Schedule;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\TripStatusLog;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateSimulationData extends Command
{
    protected $signature = 'app:generate-simulation-data';

    protected $description = 'Genera datos de simulación para el día de hoy (Viajes, Boletos y Encomiendas)';

    public function handle()
    {
        $this->info('Iniciando la generación de datos de simulación para el día de hoy...');

        $user = User::first();
        if (! $user) {
            $this->error('No hay usuarios en la base de datos.');

            return 1;
        }

        // Limpiar datos previos de hoy para evitar duplicados
        $this->info('Limpiando datos de hoy...');
        $todayStr = today()->toDateString();

        // Obtener IDs de viajes creados para hoy
        $todayTripIds = Trip::where('trip_date', $todayStr)->pluck('id');

        // Eliminar comprobantes/tickets/encomiendas relacionados a esos viajes
        Ticket::whereIn('trip_id', $todayTripIds)->forceDelete();
        Package::whereIn('trip_id', $todayTripIds)->forceDelete();
        TripStatusLog::whereIn('trip_id', $todayTripIds)->delete();
        Trip::whereIn('id', $todayTripIds)->delete();

        // También eliminar encomiendas creadas hoy sin viaje
        Package::whereDate('created_at', today())->forceDelete();

        $routes = Route::all();
        $vehicles = Vehicle::all();
        $drivers = Driver::where('status', 'activo')->get();
        $clients = Client::all();
        $schedules = Schedule::all();

        if ($routes->isEmpty() || $vehicles->isEmpty() || $drivers->isEmpty() || $clients->isEmpty() || $schedules->isEmpty()) {
            $this->error('Faltan datos base (Rutas, Vehículos, Conductores, Clientes o Horarios) en la base de datos.');

            return 1;
        }

        $this->info('Generando viajes y boletos...');

        $createdTripsCount = 0;
        $createdTicketsCount = 0;
        $createdPackagesCount = 0;
        $ticketSeq = 1;

        // Generar viajes basados en todos los horarios de hoy
        foreach ($schedules as $idx => $schedule) {
            // Determinar estado del viaje (90% realizados/en curso, 10% cancelados)
            $isCanceled = ($idx % 10 === 0); // 10% de probabilidad de cancelación

            // Si el horario de salida ya pasó en el día de hoy:
            $scheduleTime = Carbon::createFromFormat('H:i:s', $schedule->departure_time);
            $nowTime = now();

            if ($isCanceled) {
                $status = 'cancelado';
            } elseif ($scheduleTime->isPast()) {
                $status = 'completado';
            } else {
                // Si falta menos de 15 minutos o ya es hora, pero en el futuro inmediato, "en_ruta" o "programado"
                $status = 'programado';
            }

            // Seleccionar vehículo y conductor aleatorios
            $vehicle = $vehicles->random();
            $driver = $drivers->random();

            $trip = Trip::create([
                'schedule_id' => $schedule->id,
                'route_id' => $schedule->route_id,
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'created_by' => $user->id,
                'trip_date' => $todayStr,
                'status' => $status,
                'time' => $schedule->departure_time,
                'observations' => $status === 'cancelado' ? 'Cancelado por problemas climáticos en ruta.' : 'Simulación de viaje de hoy.',
            ]);

            $createdTripsCount++;

            // Registrar log del estado
            TripStatusLog::create([
                'trip_id' => $trip->id,
                'changed_by' => $user->id,
                'previous_status' => '—',
                'new_status' => $trip->status,
                'changed_at' => now(),
            ]);

            // Generar boletos para el viaje (si no está cancelado, o incluso si está cancelado se generan como cancelados)
            // Capacidad vendible
            $capacity = $vehicle->sellable_seats ?? 15;

            // Ocupación: 40% a 95%
            $occupancyPercentage = rand(40, 95);
            $ticketsToGenerate = (int) round(($capacity * $occupancyPercentage) / 100);

            // Generar asientos aleatorios no repetidos
            $seats = range(1, $capacity);
            shuffle($seats);
            $selectedSeats = array_slice($seats, 0, $ticketsToGenerate);

            foreach ($selectedSeats as $seatIndex => $seatNumber) {
                $client = $clients->random();

                // Distribución de estado de abordaje: 95% abordados, 5% no abordados
                $boardingChance = rand(1, 100);
                if ($trip->status === 'cancelado') {
                    $ticketStatus = 'cancelado';
                } elseif ($trip->status === 'completado') {
                    $ticketStatus = ($boardingChance <= 95) ? 'abordado' : 'no_abordado';
                } else {
                    $ticketStatus = 'emitido'; // Si el viaje está programado
                }

                $routePrice = RoutePrice::where('route_id', $trip->route_id)
                    ->where('origin_name', $trip->route->origin)
                    ->where('destination_name', $trip->route->destination)
                    ->first();
                $fare = $routePrice ? $routePrice->ticket_fare : ($trip->route->base_fare ?? 50.00);

                Ticket::create([
                    'trip_id' => $trip->id,
                    'client_id' => $client->id,
                    'sold_by' => $user->id,
                    'seat_number' => $seatNumber,
                    'boarding_stop' => $trip->route->origin,
                    'dropoff_stop' => $trip->route->destination,
                    'fare' => $fare,
                    'ticket_status' => $ticketStatus,
                    'payment_status' => 'pagado',
                    'payment_method' => collect(['efectivo', 'yape', 'plin', 'tarjeta'])->random(),
                    'ticket_code' => 'TKT-'.date('Ymd').'-'.str_pad($ticketSeq++, 6, '0', STR_PAD_LEFT),
                    'created_at' => now(),
                ]);

                $createdTicketsCount++;
            }
        }

        $this->info('Generando encomiendas...');

        // Generar encomiendas (30% recibidas, 70% entregadas)
        // Generamos un total aproximado de 30 encomiendas para hoy
        $totalPackages = 30;

        // Obtener viajes activos de hoy
        $activeTrips = Trip::where('trip_date', $todayStr)->get();

        for ($i = 0; $i < $totalPackages; $i++) {
            $sender = $clients->random();
            $receiver = $clients->filter(fn ($c) => $c->id !== $sender->id)->random();
            $route = $routes->random();

            // Decidir estado: 30% recibido, 70% entregado
            $statusChance = rand(1, 100);
            if ($statusChance <= 30) {
                // Unos recibidos, otros pueden estar en ruta si hay viaje activo
                $hasTrip = rand(1, 2) === 1 && $activeTrips->isNotEmpty();
                $trip = $hasTrip ? $activeTrips->random() : null;
                $status = ($trip && $trip->status === 'en_ruta') ? 'en_ruta' : 'recibido';
            } else {
                // Entregado
                $status = 'entregado';
                $trip = $activeTrips->isNotEmpty() ? $activeTrips->random() : null;
            }

            $packageType = collect(['sobre_manila', 'caja_pequena', 'caja_mediana', 'caja_grande'])->random();
            $routePrice = RoutePrice::where('route_id', $route->id)
                ->where('origin_name', $route->origin)
                ->where('destination_name', $route->destination)
                ->first();

            $price = 10.00;
            if ($routePrice) {
                $price = match ($packageType) {
                    'sobre_manila' => $routePrice->pkg_fare_sobre_manila,
                    'caja_pequena' => $routePrice->pkg_fare_caja_pequena,
                    'caja_mediana' => $routePrice->pkg_fare_caja_mediana,
                    'caja_grande' => $routePrice->pkg_fare_caja_grande,
                    default => 10.00
                };
            } else {
                $price = match ($packageType) {
                    'sobre_manila' => 5.00,
                    'caja_pequena' => 15.00,
                    'caja_mediana' => 30.00,
                    'caja_grande' => 50.00,
                    default => 10.00
                };
            }

            Package::create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'origin' => $route->origin,
                'destination' => $route->destination,
                'trip_id' => $trip?->id,
                'received_by' => $user->id,
                'package_type' => $packageType,
                'weight' => rand(1, 15) + (rand(0, 9) / 10),
                'dimensions' => rand(10, 50).'x'.rand(10, 50).'x'.rand(10, 50).' cm',
                'price' => $price,
                'payment_method' => collect(['efectivo', 'yape', 'plin', 'tarjeta'])->random(),
                'payment_status' => 'pagado',
                'status' => $status,
                'tracking_code' => 'PKG-'.date('Ymd').'-'.str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                'observations' => 'Simulación de encomienda generada hoy.',
                'created_at' => now(),
            ]);

            $createdPackagesCount++;
        }

        $this->info('Simulación finalizada con éxito:');
        $this->line("- Viajes creados hoy: {$createdTripsCount}");
        $this->line("- Boletos emitidos: {$createdTicketsCount}");
        $this->line("- Encomiendas registradas: {$createdPackagesCount}");

        return 0;
    }
}
