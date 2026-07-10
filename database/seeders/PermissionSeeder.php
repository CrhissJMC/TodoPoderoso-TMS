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
        $modules = [
            'usuarios' => 'Usuarios',
            'vehiculos' => 'Vehículos',
            'conductores' => 'Conductores',
            'rutas' => 'Rutas',
            'horarios' => 'Horarios',
            'clientes' => 'Clientes',
            'viajes' => 'Viajes',
            'boletos' => 'Boletos',
            'encomiendas' => 'Encomiendas',
        ];

        foreach ($modules as $slug => $name) {
            Permission::firstOrCreate([
                'name' => "{$slug}.ver",
                'description' => "Ver {$name}",
            ]);

            Permission::firstOrCreate([
                'name' => "{$slug}.admin",
                'description' => "Administrar {$name} (Crear, Editar, Eliminar)",
            ]);
        }
    }
}
