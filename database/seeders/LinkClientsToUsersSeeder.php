<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LinkClientsToUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = Client::whereNull('user_id')->get();

        foreach ($clients as $client) {
            // Generar un correo si no tiene
            $email = $client->email ?: Str::slug($client->name).'@tms.com';

            // Comprobar si existe un usuario con este correo
            $user = User::where('email', $email)->first();

            if (! $user) {
                // Crear el usuario con rol de cliente (asumiendo role_id = 6 para cliente)
                $user = User::create([
                    'name' => $client->name,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role_id' => 6, // 6 = cliente
                ]);
            }

            // Vincular el cliente al usuario
            $client->user_id = $user->id;
            $client->save();
        }
    }
}
