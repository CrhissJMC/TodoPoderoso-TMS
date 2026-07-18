<?php

namespace App\Console\Commands;

use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateTripStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-trip-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualiza automaticamente los viajes a en_ruta si la hora de salida se cumple y hay tickets/encomiendas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $today = $now->format('Y-m-d');

        $trips = Trip::with(['schedule', 'tickets', 'packages'])
            ->whereDate('trip_date', $today)
            ->whereIn('status', ['programado', 'abordando'])
            ->get();

        $updatedCount = 0;
        $cancelledCount = 0;

        foreach ($trips as $trip) {
            if (! $trip->schedule) {
                continue;
            }

            // Combinar la fecha del viaje con la hora de salida programada
            $departureTime = Carbon::parse($trip->trip_date->format('Y-m-d').' '.$trip->schedule->departure_time);

            if ($now->greaterThanOrEqualTo($departureTime)) {
                $hasPassengers = $trip->tickets->count() > 0;
                $hasPackages = $trip->packages->count() > 0;

                if ($hasPassengers || $hasPackages) {
                    $trip->update(['status' => 'en_ruta']);
                    $updatedCount++;
                } else {
                    $trip->update(['status' => 'cancelado']);
                    $cancelledCount++;
                }
            }
        }

        $this->info("Viajes despachados: {$updatedCount}, Viajes cancelados: {$cancelledCount}");
    }
}
