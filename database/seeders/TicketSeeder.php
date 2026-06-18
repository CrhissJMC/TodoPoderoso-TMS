<?php

namespace Database\Seeders;

use App\Models\Passenger;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $trip = Trip::whereIn('status', ['programado', 'en_ruta'])->first();
        $passengers = Passenger::take(3)->get();

        if (! $user || ! $trip || $passengers->isEmpty()) return;

        $seats = [1, 2, 3];

        foreach ($passengers as $i => $passenger) {
            Ticket::firstOrCreate(
                ['trip_id' => $trip->id, 'seat_number' => $seats[$i]],
                [
                    'passenger_id'   => $passenger->id,
                    'sold_by'        => $user->id,
                    'boarding_stop'  => $trip->route->origin,
                    'dropoff_stop'   => $trip->route->destination,
                    'fare'           => $trip->route->base_fare,
                    'ticket_status'  => 'emitido',
                    'payment_status' => 'pagado',
                    'payment_method' => $i === 0 ? 'yape' : 'efectivo',
                    'ticket_code'    => 'TKT-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                ]
            );
        }
    }
}
