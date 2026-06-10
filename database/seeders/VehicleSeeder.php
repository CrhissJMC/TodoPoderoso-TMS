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
                'plate'         => 'ABC-123',
                'brand'         => 'Toyota',
                'model'         => 'Yaris',
                'year'          => 2023,
                'capacity'      => 400, // 400 kilogramos
                'capacity_unit' => 'kg',
                'type'          => 'auto',
                'status'        => 'disponible',
                'color'         => 'Rojo',
                'observations'  => 'Auto sedán para viajes rápidos.',
            ],
            [
                'plate'         => 'XYZ-789',
                'brand'         => 'Hyundai',
                'model'         => 'H-1',
                'year'          => 2022,
                'capacity'      => 1000, // 1000 kilogramos
                'capacity_unit' => 'kg',
                'type'          => 'minivan',
                'status'        => 'en_viaje',
                'color'         => 'Plateado',
                'observations'  => 'Minivan en ruta con grupo de personas.',
            ],
            [
                'plate'         => 'LMN-456',
                'brand'         => 'Kia',
                'model'         => 'Rio',
                'year'          => 2021,
                'capacity'      => 450, // 450 kilogramos
                'capacity_unit' => 'kg',
                'type'          => 'auto',
                'status'        => 'en_mantenimiento',
                'color'         => 'Negro',
                'observations'  => 'Cambio de llantas y aceite pendiente.',
            ],
        ];

        foreach ($vehicles as $v) {
            Vehicle::firstOrCreate(['plate' => $v['plate']], $v);
        }
    }
}