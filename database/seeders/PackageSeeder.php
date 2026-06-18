<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $user    = User::first();
        $trip    = Trip::whereIn('status', ['programado', 'en_ruta'])->first();

        if (! $user) return;

        $packages = [
            [
                'sender_name'    => 'Luis Paredes',
                'receiver_name'  => 'Carmen Díaz',
                'origin'         => 'Chachapoyas',
                'destination'    => 'Bagua Grande',
                'trip_id'        => $trip?->id,
                'received_by'    => $user->id,
                'package_type'   => 'sobre_manila',
                'weight'         => null,
                'dimensions'     => null,
                'price'          => 5.00,
                'payment_method' => 'efectivo',
                'payment_status' => 'pagado',
                'status'         => $trip?->status === 'en_ruta' ? 'en_ruta' : 'recibido',
                'tracking_code'  => 'PKG-00001',
                'observations'   => 'Documentos legales. Entregar en mano.',
            ],
            [
                'sender_name'    => 'Roberto Quispe',
                'receiver_name'  => 'Sofía Huanca',
                'origin'         => 'Chachapoyas',
                'destination'    => 'Pedro Ruiz',
                'trip_id'        => $trip?->id,
                'received_by'    => $user->id,
                'package_type'   => 'caja',
                'weight'         => 3.50,
                'dimensions'     => '30x20x15 cm',
                'price'          => 15.00,
                'payment_method' => 'yape',
                'payment_status' => 'pagado',
                'status'         => 'recibido',
                'tracking_code'  => 'PKG-00002',
                'observations'   => 'Frágil — contiene artesanías.',
            ],
            [
                'sender_name'    => 'Ana Torres',
                'receiver_name'  => 'Miguel Vega',
                'origin'         => 'Bagua Grande',
                'destination'    => 'Chachapoyas',
                'trip_id'        => null,
                'received_by'    => $user->id,
                'package_type'   => 'sobre_manila',
                'weight'         => null,
                'dimensions'     => null,
                'price'          => 5.00,
                'payment_method' => 'efectivo',
                'payment_status' => 'pendiente',
                'status'         => 'recibido',
                'tracking_code'  => 'PKG-00003',
                'observations'   => null,
            ],
        ];

        foreach ($packages as $p) {
            Package::firstOrCreate(['tracking_code' => $p['tracking_code']], $p);
        }
    }
}
