<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            [
                'name' => 'Chachapoyas - Bagua Grande',
                'origin' => 'Chachapoyas',
                'destination' => 'Bagua Grande',
                'estimated_minutes' => 120,
                'base_fare' => 20.00,
                'active' => true,
                'stops' => [
                    ['stop_name' => 'Pedro Ruiz',  'stop_order' => 1, 'minutes_from_origin' => 60,  'fare_from_origin' => 12.00],
                    ['stop_name' => 'Pomacochas',  'stop_order' => 2, 'minutes_from_origin' => 75,  'fare_from_origin' => 14.00],
                    ['stop_name' => 'Florida',     'stop_order' => 3, 'minutes_from_origin' => 90,  'fare_from_origin' => 16.00],
                ],
            ],
            [
                'name' => 'Chachapoyas - Jaén',
                'origin' => 'Chachapoyas',
                'destination' => 'Jaén',
                'estimated_minutes' => 210,
                'base_fare' => 35.00,
                'active' => true,
                'stops' => [
                    ['stop_name' => 'Pedro Ruiz', 'stop_order' => 1, 'minutes_from_origin' => 60,  'fare_from_origin' => 12.00],
                    ['stop_name' => 'Bagua Grande', 'stop_order' => 2, 'minutes_from_origin' => 120, 'fare_from_origin' => 20.00],
                ],
            ],
            [
                'name' => 'Chachapoyas - Leymebamba',
                'origin' => 'Chachapoyas',
                'destination' => 'Leymebamba',
                'estimated_minutes' => 90,
                'base_fare' => 15.00,
                'active' => true,
                'stops' => [],
            ],
        ];

        foreach ($routes as $routeData) {
            $stops = $routeData['stops'];
            unset($routeData['stops']);

            $route = Route::firstOrCreate(
                ['name' => $routeData['name']],
                $routeData,
            );

            if ($route->wasRecentlyCreated && count($stops) > 0) {
                $route->stops()->createMany($stops);
            }
        }
    }
}
