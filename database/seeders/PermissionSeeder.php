<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'usuarios.ver',
                'description' => 'Ver listado de usuarios',
            ],
            [
                'name' => 'usuarios.cambiar_rol',
                'description' => 'Cambiar rol de usuarios',
            ],
            [
                'name' => 'usuarios.suspender',
                'description' => 'Suspender usuarios',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }
    }
}
