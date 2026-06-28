<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['name' => 'María Elena Torres Quispe',  'document_type' => 'DNI', 'document_number' => '12345678', 'phone' => '987 123 456'],
            ['name' => 'José Luis Ramírez Díaz',     'document_type' => 'DNI', 'document_number' => '87654321', 'phone' => '962 789 012'],
            ['name' => 'Ana Sofía Huanca Flores',    'document_type' => 'DNI', 'document_number' => '11223344', 'phone' => '945 678 901'],
            ['name' => 'Carlos Alberto Vega Ríos',   'document_type' => 'DNI', 'document_number' => '44332211', 'phone' => null],
            ['name' => 'Rosa Amelia Díaz Sánchez',   'document_type' => 'DNI', 'document_number' => '55667788', 'phone' => '978 234 567'],
            ['name' => 'Pedro Antonio Llamo Casas',  'document_type' => 'DNI', 'document_number' => '88776655', 'phone' => '901 345 678'],
            ['name' => 'Lucía Fernández Mendoza',    'document_type' => 'DNI', 'document_number' => '23456789', 'phone' => '934 567 890'],
            ['name' => 'Julio César Rojas Paredes',  'document_type' => 'DNI', 'document_number' => '98765432', 'phone' => '956 890 123'],
            ['name' => 'Empresa Los Andes S.A.C.',   'document_type' => 'RUC', 'document_number' => '20123456789', 'phone' => '01 555 1234'],
        ];

        foreach ($clients as $c) {
            Client::firstOrCreate(
                ['document_type' => $c['document_type'], 'document_number' => $c['document_number']],
                $c
            );
        }
    }
}
