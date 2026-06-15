<?php

namespace Database\Seeders;

use App\Models\Passenger;
use Illuminate\Database\Seeder;

class PassengerSeeder extends Seeder
{
    public function run(): void
    {
        $passengers = [
            ['full_name' => 'María Elena Torres Quispe',  'dni' => '12345678', 'phone' => '987 123 456'],
            ['full_name' => 'José Luis Ramírez Díaz',     'dni' => '87654321', 'phone' => '962 789 012'],
            ['full_name' => 'Ana Sofía Huanca Flores',    'dni' => '11223344', 'phone' => '945 678 901'],
            ['full_name' => 'Carlos Alberto Vega Ríos',   'dni' => '44332211', 'phone' => null],
            ['full_name' => 'Rosa Amelia Díaz Sánchez',   'dni' => '55667788', 'phone' => '978 234 567'],
            ['full_name' => 'Pedro Antonio Llamo Casas',  'dni' => '88776655', 'phone' => '901 345 678'],
            ['full_name' => 'Lucía Fernández Mendoza',    'dni' => '23456789', 'phone' => '934 567 890'],
            ['full_name' => 'Julio César Rojas Paredes',  'dni' => '98765432', 'phone' => '956 890 123'],
        ];

        foreach ($passengers as $p) {
            Passenger::firstOrCreate(['dni' => $p['dni']], $p);
        }
    }
}