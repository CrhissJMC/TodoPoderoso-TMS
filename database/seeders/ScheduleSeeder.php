<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $routeBagua     = Route::where('name', 'like', '%Bagua Grande%')->first();
        $routeJaen      = Route::where('name', 'like', '%Jaén%')->first();
        $routeLeyme     = Route::where('name', 'like', '%Leymebamba%')->first();

        $vehicle1 = Vehicle::first();
        $vehicle2 = Vehicle::skip(1)->first();

        $driver1  = Driver::where('status', 'activo')->first();
        $driver2  = Driver::where('status', 'activo')->skip(1)->first();

        $schedules = [
            // Chachapoyas → Bagua Grande: salidas mañana y tarde L-S
            [
                'route_id'       => $routeBagua?->id,
                'vehicle_id'     => $vehicle1?->id,
                'driver_id'      => $driver1?->id,
                'departure_time' => '06:00:00',
                'days_of_week'   => '1,2,3,4,5,6',
                'active'         => true,
            ],
            [
                'route_id'       => $routeBagua?->id,
                'vehicle_id'     => $vehicle2?->id,
                'driver_id'      => $driver2?->id,
                'departure_time' => '13:00:00',
                'days_of_week'   => '1,2,3,4,5,6',
                'active'         => true,
            ],
            // Chachapoyas → Jaén: una salida diaria
            [
                'route_id'       => $routeJaen?->id,
                'vehicle_id'     => $vehicle1?->id,
                'driver_id'      => $driver1?->id,
                'departure_time' => '08:00:00',
                'days_of_week'   => '1,2,3,4,5,6,7',
                'active'         => true,
            ],
            // Chachapoyas → Leymebamba: solo fines de semana
            [
                'route_id'       => $routeLeyme?->id,
                'vehicle_id'     => $vehicle2?->id,
                'driver_id'      => $driver2?->id,
                'departure_time' => '09:00:00',
                'days_of_week'   => '6,7',
                'active'         => true,
            ],
        ];

        foreach ($schedules as $s) {
            if (! $s['route_id']) continue;

            Schedule::firstOrCreate(
                ['route_id' => $s['route_id'], 'departure_time' => $s['departure_time']],
                $s,
            );
        }
    }
}
