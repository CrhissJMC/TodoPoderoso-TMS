<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle = Vehicle::where('status', 'disponible')->first();

        $drivers = [
            [
                'name'           => 'Carlos Mendoza Torres',
                'license_number' => 'Q01234567',
                'license_type'   => 'B',
                'license_expiry' => '2026-08-15',
                'phone'          => '987 654 321',
                'email'          => 'cmendoza@ejemplo.com',
                'dni'            => '12345678',
                'status'         => 'activo',
                'vehicle_id'     => $vehicle?->id,
                'observations'   => null,
            ],
            [
                'name'           => 'Ana Sofía Quispe',
                'license_number' => 'Q09876543',
                'license_type'   => 'B',
                'license_expiry' => '2025-03-10',
                'phone'          => '912 345 678',
                'email'          => null,
                'dni'            => '87654321',
                'status'         => 'en_viaje',
                'vehicle_id'     => null,
                'observations'   => 'Licencia por vencer — gestionar renovación.',
            ],
            [
                'name'           => 'Roberto Huanca Lima',
                'license_number' => 'Q05551234',
                'license_type'   => 'A-II',
                'license_expiry' => '2027-12-01',
                'phone'          => '965 432 100',
                'email'          => 'rhuanca@ejemplo.com',
                'dni'            => '55512340',
                'status'         => 'inactivo',
                'vehicle_id'     => null,
                'observations'   => null,
            ],
        ];

        foreach ($drivers as $d) {
            Driver::firstOrCreate(['license_number' => $d['license_number']], $d);
        }
    }
}
