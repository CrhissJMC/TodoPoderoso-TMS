<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class AssignPermissionsSeeder extends Seeder
{
    /**
     * Permisos por rol, según la función de cada uno en el sistema.
     * El administrador recibe todos los permisos existentes por separado.
     */
    private const ROLE_PERMISSIONS = [
        // Conduce viajes: ve sus viajes, rutas, horarios y el vehículo asignado,
        // y puede cambiar el estado del viaje (abordando/en_ruta/completado/cancelado).
        'chofer' => [
            'viajes.ver', 'viajes.admin',
            'horarios.ver',
            'rutas.ver',
            'vehiculos.ver',
        ],

        // Vende boletos: gestiona clientes y boletos, y necesita ver viajes/horarios/rutas
        // disponibles para poder asignar el boleto al viaje correcto.
        'operador_ventas' => [
            'viajes.ver',
            'horarios.ver',
            'rutas.ver',
            'clientes.ver', 'clientes.admin',
            'boletos.ver', 'boletos.admin',
        ],

        // Gestiona encomiendas: mismo criterio que ventas pero para paquetes.
        'operador_encomiendas' => [
            'viajes.ver',
            'horarios.ver',
            'rutas.ver',
            'clientes.ver', 'clientes.admin',
            'encomiendas.ver', 'encomiendas.admin',
        ],

        // Agente de mostrador: atiende al público en general, ve todo lo operativo
        // y administra clientes, boletos y encomiendas (combina venta + encomiendas).
        'agente' => [
            'vehiculos.ver',
            'conductores.ver',
            'rutas.ver',
            'horarios.ver',
            'viajes.ver',
            'clientes.ver', 'clientes.admin',
            'boletos.ver', 'boletos.admin',
            'encomiendas.ver', 'encomiendas.admin',
        ],

        // Cliente autorregistrado: el sistema no tiene todavía un portal de autoservicio
        // (no hay páginas de "mis boletos"/"mis encomiendas"), así que no se le asignan
        // permisos de módulo; solo conserva el acceso base (dashboard, perfil).
        'cliente' => [],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Administrador: todos los permisos existentes.
        $adminRole = Role::where('name', 'administrador')->firstOrFail();
        $allPermissions = Permission::all();
        $adminRole->permissions()->sync($allPermissions->pluck('id'));

        // Resto de roles: el set específico de permisos definido arriba.
        foreach (self::ROLE_PERMISSIONS as $roleName => $permissionNames) {
            $role = Role::where('name', $roleName)->first();

            if (! $role) {
                continue;
            }

            $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
