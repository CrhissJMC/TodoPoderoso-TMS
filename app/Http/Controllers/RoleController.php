<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with(['permissions', 'users' => function ($query) {
            $query->select('id', 'name', 'email', 'estado', 'role_id');
        }])->get();
        
        $modules = [
            'usuarios'    => 'Usuarios',
            'vehiculos'   => 'Vehículos',
            'conductores' => 'Conductores',
            'rutas'       => 'Rutas',
            'horarios'    => 'Horarios',
            'clientes'    => 'Clientes',
            'viajes'      => 'Viajes',
            'boletos'     => 'Boletos',
            'encomiendas' => 'Encomiendas',
        ];

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'modules' => $modules,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
            'description' => 'nullable|string|max:1000',
            'permissions' => 'required|array',
        ]);

        $role = Role::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        $moduleConfig = $request->input('permissions');
        $permissionsToAttach = [];

        foreach ($moduleConfig as $module => $accessLevel) {
            if ($accessLevel === 'ver') {
                $perm = Permission::where('name', "{$module}.ver")->first();
                if ($perm) $permissionsToAttach[] = $perm->id;
            } elseif ($accessLevel === 'admin') {
                $permVer = Permission::where('name', "{$module}.ver")->first();
                $permAdmin = Permission::where('name', "{$module}.admin")->first();
                if ($permVer) $permissionsToAttach[] = $permVer->id;
                if ($permAdmin) $permissionsToAttach[] = $permAdmin->id;
            }
        }

        $role->permissions()->sync($permissionsToAttach);

        return back()->with('success', 'Rol creado correctamente.');
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($role->id !== 1 && $request->has('description')) {
            $role->update(['description' => $request->input('description')]);
        }

        $moduleConfig = $request->input('permissions'); // e.g. ['usuarios' => 'admin', 'vehiculos' => 'ver', ...]

        $permissionsToAttach = [];

        foreach ($moduleConfig as $module => $accessLevel) {
            if ($accessLevel === 'ver') {
                $perm = Permission::where('name', "{$module}.ver")->first();
                if ($perm) $permissionsToAttach[] = $perm->id;
            } elseif ($accessLevel === 'admin') {
                $permVer = Permission::where('name', "{$module}.ver")->first();
                $permAdmin = Permission::where('name', "{$module}.admin")->first();
                if ($permVer) $permissionsToAttach[] = $permVer->id;
                if ($permAdmin) $permissionsToAttach[] = $permAdmin->id;
            }
        }

        // Si es el rol de administrador, no permitimos que se quite a sí mismo los permisos por seguridad
        // pero vamos a confiar en el admin. Al menos el root user tiene superpoderes si usamos role=1, pero dejemos que se editen.
        // Mejor protejamos que al rol administrador siempre tenga todo, pero el requerimiento es que el administrador configure lo que quiera.
        // El enunciado dice "donde pueda acceder solo el admin, en este podra seleccionar que tipo de permisos podra tener cada tipo de usuario".
        // Solo para no romper el sistema, evitemos editar el rol ID 1.
        if ($role->id === 1) {
            return back()->with('error', 'Los permisos del Administrador principal no pueden ser modificados.');
        }

        $role->permissions()->sync($permissionsToAttach);

        return back()->with('success', 'Permisos actualizados correctamente.');
    }
}
