<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestUsersSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            'administrador',
            'chofer',
            'operador ventas',
            'operador encomiendas',
            'agente',
            'cliente'
        ];

        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            // Crear 5 usuarios para este rol
            for ($i = 1; $i <= 5; $i++) {
                $safeName = str_replace(' ', '_', $roleName);
                $email = "{$safeName}{$i}@test.com";

                User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => ucfirst($roleName) . " Test {$i}",
                        'password' => Hash::make('password123'),
                        'role_id' => $role->id,
                        'estado' => 'activo',
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );
            }
        }
    }
}
