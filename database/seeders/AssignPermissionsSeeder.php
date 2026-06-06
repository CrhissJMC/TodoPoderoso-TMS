<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class AssignPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin role
        $adminRole = Role::where('name', 'administrador')->firstOrFail();

        // Get all permissions
        $permissions = Permission::all();

        // Attach all permissions to admin role
        foreach ($permissions as $permission) {
            $adminRole->permissions()->attach($permission->id);
        }
    }
}
