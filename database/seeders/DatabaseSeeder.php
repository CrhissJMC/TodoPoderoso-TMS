<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Seguridad y Usuarios (Tu base actual)
            RoleSeeder::class,
            PermissionSeeder::class,
            RootUserSeeder::class,
            AssignPermissionsSeeder::class,

            // 2. Tablas base operativas (No dependen de nadie)
            VehicleSeeder::class,   // Necesario para conductores y viajes
            RouteSeeder::class,     // Necesario para paradas, horarios y viajes
            PassengerSeeder::class, // Necesario para boletos

            // 3. Tablas de primer nivel (Dependen de las bases)
            DriverSeeder::class,    // Depende de Vehicle
            ScheduleSeeder::class,  // Depende de Route, Vehicle, Driver

            // 4. Logística principal
            TripSeeder::class,      // Depende de Route, User, (opcionalmente Schedule, Vehicle, Driver)

            // 5. Operaciones de venta (Si ya tienes creados estos seeders)
            // TicketSeeder::class,
            // PackageSeeder::class,
        ]);
    }
}