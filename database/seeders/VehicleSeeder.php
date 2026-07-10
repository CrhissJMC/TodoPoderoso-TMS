<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'plate' => 'ABC-123',
                'brand' => 'Toyota',
                'model' => 'Yaris',
                'year' => 2023,
                'capacity_seats' => 5, // Asientos totales del auto
                'sellable_seats' => 4, // Asientos que se le pueden vender a los pasajeros
                'type' => 'Auto',
                'status' => 'disponible',
                'color' => 'Rojo',
                'observations' => 'Auto sedán para viajes rápidos.',
            ],
            [
                'plate' => 'XYZ-789',
                'brand' => 'Hyundai',
                'model' => 'H-1',
                'year' => 2022,
                'capacity_seats' => 15,
                'sellable_seats' => 14, // Asumiendo que el copiloto se vende
                'type' => 'Minivan',
                'status' => 'en_ruta', // Estado corregido
                'color' => 'Plateado',
                'observations' => 'Minivan en ruta con grupo de personas.',
            ],
            [
                'plate' => 'LMN-456',
                'brand' => 'Kia',
                'model' => 'Rio',
                'year' => 2021,
                'capacity_seats' => 5,
                'sellable_seats' => 4,
                'type' => 'Auto',
                'status' => 'mantenimiento', // Estado corregido
                'color' => 'Negro',
                'observations' => 'Cambio de llantas y aceite pendiente.',
            ],
        ];

        foreach ($vehicles as $v) {
            Vehicle::firstOrCreate(['plate' => $v['plate']], $v);
        }
    }
}
