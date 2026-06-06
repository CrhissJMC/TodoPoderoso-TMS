<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RootUserSeeder extends Seeder
{
    /**
     * The easily modifiable password for the root administrator.
     */
    public const ROOT_PASSWORD = 'password123';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'administrador')->firstOrFail();

        User::updateOrCreate(
            ['email' => 'administrador@todopoderoso.com'],
            [
                'name' => 'root',
                'password' => Hash::make(self::ROOT_PASSWORD),
                'role_id' => $adminRole->id,
                'estado' => 'activo',
            ]
        );
    }
}
