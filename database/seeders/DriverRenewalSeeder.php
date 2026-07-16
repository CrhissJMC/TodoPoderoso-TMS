<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DriverRenewalSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'chofer']);
        $vehicles = Vehicle::all();

        if ($vehicles->isEmpty()) {
            $this->command->warn('No hay vehículos registrados para asignar a los conductores.');
        }

        // Helper to generate a random peruvian DNI
        $generateDni = function () {
            return str_pad(rand(0, 99999999), 8, '0', STR_PAD_LEFT);
        };

        // Helper to generate a peruvian phone
        $generatePhone = function () {
            return '9'.str_pad(rand(0, 99999999), 8, '0', STR_PAD_LEFT);
        };

        $names = [
            'Juan Perez', 'Carlos Mendoza', 'Miguel Soto', 'Luis Vargas', 'Jorge Castro',
            'Pedro Ramirez', 'Jose Flores', 'Manuel Ortiz', 'Raul Silva', 'Fernando Rojas',
            'Ricardo Morales', 'Andres Fernandez', 'Victor Gutierrez', 'Daniel Chavez', 'Hugo Navarro',
            'Roberto Rios', 'Julio Espinoza', 'Cesar Aguilar', 'Mario Dominguez', 'Oscar Reyes',
            'Eduardo Delgado', 'Hector Romero', 'Diego Herrera', 'Javier Medina', 'Martin Salazar',
            'Gabriel Suarez', 'Alejandro Cruz', 'Ivan Cabrera', 'Sebastian Paredes', 'Cristian Leon',
        ];

        // Mezclar nombres para aleatoriedad
        shuffle($names);

        // --- 1. Crear 20 conductores regulares ---
        for ($i = 0; $i < 20; $i++) {
            $name = array_pop($names);
            $email = strtolower(str_replace(' ', '.', $name)).'@test.com';
            $dni = $generateDni();

            // Crear el usuario
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password123'),
                    'role_id' => $role->id,
                    'estado' => 'activo',
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );

            // Vencimiento aleatorio entre +12 y +15 meses
            $expiry = Carbon::now()->addMonths(rand(12, 15))->addDays(rand(0, 30));

            Driver::create([
                'name' => $name,
                'license_number' => $dni,
                'license_type' => rand(0, 1) ? 'A-IIa' : 'A-IIb',
                'license_expiry' => $expiry,
                'phone' => $generatePhone(),
                'email' => $email,
                'dni' => $dni,
                'status' => 'activo',
                'contract_type' => 'empleado',
                'rental_fee' => null,
                'vehicle_id' => $vehicles->isNotEmpty() ? $vehicles->random()->id : null,
                'user_id' => $user->id,
            ]);
        }

        // --- 2. Crear 5 conductores con vencimiento en exactamente 31 días y estado en_renovacion ---
        for ($i = 0; $i < 5; $i++) {
            $name = array_pop($names);
            $email = strtolower(str_replace(' ', '.', $name)).'@test.com';
            $dni = $generateDni();

            // Crear el usuario
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password123'),
                    'role_id' => $role->id,
                    'estado' => 'activo',
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );

            // Vencimiento en 31 días exactos
            $expiry = Carbon::now()->addDays(31);

            Driver::create([
                'name' => $name,
                'license_number' => $dni,
                'license_type' => rand(0, 1) ? 'A-IIa' : 'A-IIb',
                'license_expiry' => $expiry,
                'phone' => $generatePhone(),
                'email' => $email,
                'dni' => $dni,
                'status' => 'en_renovacion', // Estado solicitado
                'contract_type' => 'empleado',
                'rental_fee' => null,
                'vehicle_id' => $vehicles->isNotEmpty() ? $vehicles->random()->id : null,
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('25 conductores (20 regulares, 5 en renovación) creados exitosamente.');
    }
}
