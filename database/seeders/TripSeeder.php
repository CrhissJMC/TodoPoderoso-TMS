<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Trip;
use App\Models\TripStatusLog;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class TripSeeder extends Seeder
{
    public function run(): void
    {
        $user     = User::first();
        $route    = Route::first();
        $vehicle  = Vehicle::first();
        $driver   = Driver::where('status', 'activo')->first();
        $schedule = Schedule::first();

        if (! $user || ! $route) return;

        $trips = [
            [
                'schedule_id'  => $schedule?->id,
                'route_id'     => $route->id,
                'vehicle_id'   => $vehicle?->id,
                'driver_id'    => $driver?->id,
                'created_by'   => $user->id,
                'trip_date'    => today()->toDateString(),
                'status'       => 'programado',
                'observations' => null,
            ],
            [
                'schedule_id'  => null,
                'route_id'     => $route->id,
                'vehicle_id'   => $vehicle?->id,
                'driver_id'    => $driver?->id,
                'created_by'   => $user->id,
                'trip_date'    => today()->toDateString(),
                'status'       => 'en_ruta',
                'observations' => 'Salida puntual.',
            ],
            [
                'schedule_id'  => $schedule?->id,
                'route_id'     => $route->id,
                'vehicle_id'   => $vehicle?->id,
                'driver_id'    => $driver?->id,
                'created_by'   => $user->id,
                'trip_date'    => today()->subDay()->toDateString(),
                'status'       => 'completado',
                'observations' => 'Viaje sin novedades.',
            ],
        ];

        foreach ($trips as $tripData) {
            $trip = Trip::create($tripData);

            TripStatusLog::create([
                'trip_id'         => $trip->id,
                'changed_by'      => $user->id,
                'previous_status' => '—',
                'new_status'      => $trip->status,
                'changed_at'      => now(),
            ]);
        }
    }
}
