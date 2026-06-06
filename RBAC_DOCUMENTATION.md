# 🔐 Sistema RBAC - Documentación de Uso

**Estado:** ✅ Infraestructura implementada y lista para usar

---

## 📋 Tabla de Contenidos
1. [Estructura](#estructura)
2. [Tablas de BD](#tablas-de-bd)
3. [Modelos](#modelos)
4. [Middlewares](#middlewares)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Cómo Agregar Nuevos Permisos](#cómo-agregar-nuevos-permisos)

---

## 🏗️ Estructura

```
├─ Migraciones:
│  ├─ create_permissions_table (id, name, description)
│  └─ create_role_permission_table (role_id, permission_id)
│
├─ Modelos:
│  ├─ Permission (BelongsToMany Role)
│  ├─ Role (HasMany User, BelongsToMany Permission)
│  └─ User (BelongsTo Role, hasPermission(), hasAllPermissions(), hasAnyPermission())
│
├─ Middlewares:
│  ├─ RoleMiddleware (verifica role específico)
│  └─ PermissionMiddleware (verifica permisos)
│
└─ Seeders:
   ├─ PermissionSeeder (crea permisos iniciales)
   └─ AssignPermissionsSeeder (asigna permisos a roles)
```

---

## 💾 Tablas de BD

### permissions
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Registros iniciales:**
| id | name | description |
|----|----|---|
| 1 | usuarios.ver | Ver listado de usuarios |
| 2 | usuarios.cambiar_rol | Cambiar rol de usuarios |
| 3 | usuarios.suspender | Suspender usuarios |

### role_permission
```sql
CREATE TABLE role_permission (
  id SERIAL PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

**Registros iniciales:**
- Role 1 (administrador) → Permission 1, 2, 3 (todos los permisos)

---

## 🧩 Modelos

### Permission Model

```php
namespace App\Models;

class Permission extends Model
{
    protected $fillable = ['name', 'description'];

    /**
     * Get the roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission')
            ->withTimestamps();
    }
}
```

### Role Model (Actualizado)

```php
class Role extends Model
{
    /**
     * Get the permissions associated with this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission')
            ->withTimestamps();
    }

    /**
     * Check if the role has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()
            ->where('name', $permission)
            ->exists();
    }
}
```

### User Model (Actualizado)

```php
class User extends Authenticatable
{
    /**
     * Check if the user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if (!$this->role) {
            return false;
        }
        return $this->role->hasPermission($permission);
    }

    /**
     * Check if the user has all specified permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if the user has any of the specified permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }
}
```

---

## 🛡️ Middlewares

### RoleMiddleware

**Archivo:** `app/Http/Middleware/RoleMiddleware.php`

Verifica que el usuario tenga un rol específico.

```php
public function handle(Request $request, Closure $next, string $role): Response
{
    if (!Auth::check()) {
        return redirect('login');
    }

    $user = $request->user();
    if (!$user->role || $user->role->name !== $role) {
        abort(403, 'Unauthorized. This role is required.');
    }

    return $next($request);
}
```

**Uso:** `->middleware('role:administrador')`

---

### PermissionMiddleware

**Archivo:** `app/Http/Middleware/PermissionMiddleware.php`

Verifica que el usuario tenga al menos uno de los permisos especificados.

```php
public function handle(Request $request, Closure $next, string ...$permissions): Response
{
    if (!Auth::check()) {
        return redirect('login');
    }

    $user = $request->user();

    // Check if user has at least one of the specified permissions
    foreach ($permissions as $permission) {
        if ($user->hasPermission($permission)) {
            return $next($request);
        }
    }

    abort(403, 'Unauthorized. Required permission not found.');
}
```

**Uso:** `->middleware('permission:usuarios.ver')`  
**Uso múltiple:** `->middleware('permission:usuarios.ver,usuarios.suspender')`

---

## 📖 Ejemplos de Uso

### 1. Proteger Ruta con Rol Específico

**Archivo:** `routes/web.php`

```php
// Solo administradores pueden acceder
Route::get('/admin/dashboard', function () {
    return view('admin.dashboard');
})->middleware(['auth', 'verified', 'role:administrador']);
```

### 2. Proteger Ruta con Permiso Específico

```php
// Solo usuarios con permiso 'usuarios.ver' pueden acceder
Route::get('/users', [UserController::class, 'index'])
    ->middleware(['auth', 'verified', 'permission:usuarios.ver']);
```

### 3. Proteger Ruta con Múltiples Permisos (cualquiera)

```php
// Usuario debe tener al menos uno de estos permisos
Route::patch('/users/{id}/status', [UserController::class, 'updateStatus'])
    ->middleware(['auth', 'verified', 'permission:usuarios.cambiar_rol,usuarios.suspender']);
```

### 4. Verificación Dentro de un Controller

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Verificar un permiso específico
        if ($user->hasPermission('usuarios.ver')) {
            $users = User::all();
            return view('users.index', ['users' => $users]);
        }

        abort(403, 'No tienes permiso para ver usuarios.');
    }

    public function changeRole(Request $request, User $targetUser)
    {
        // Verificar si tiene TODO un conjunto de permisos
        if ($user->hasAllPermissions(['usuarios.ver', 'usuarios.cambiar_rol'])) {
            $targetUser->update(['role_id' => $request->role_id]);
        }
    }

    public function manageStatus(Request $request, User $targetUser)
    {
        // Verificar si tiene CUALQUIERA de los permisos
        if ($request->user()->hasAnyPermission(['usuarios.cambiar_rol', 'usuarios.suspender'])) {
            // Permitir cambio de estado
        }
    }
}
```

### 5. Verificación en Blade (Views)

```blade
@if(auth()->user()->hasPermission('usuarios.cambiar_rol'))
    <button>Cambiar Rol</button>
@endif

@if(auth()->user()->hasAnyPermission(['usuarios.ver', 'usuarios.suspender']))
    <div class="admin-panel">
        <!-- Panel de administración -->
    </div>
@endif
```

### 6. Verificación en Requests/Policies

```php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function update(User $user, User $model)
    {
        // Permitir si el usuario actual tiene permiso
        return $user->hasPermission('usuarios.cambiar_rol');
    }

    public function suspend(User $user, User $model)
    {
        return $user->hasPermission('usuarios.suspender');
    }
}
```

---

## 🆕 Cómo Agregar Nuevos Permisos

### Opción 1: Vía Seeder (Recomendado)

**1. Crear nuevo seeder:**
```bash
php artisan make:seeder NewPermissionsSeeder
```

**2. Agregar permisos en el seeder:**
```php
namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class NewPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'reportes.generar', 'description' => 'Generar reportes'],
            ['name' => 'reportes.exportar', 'description' => 'Exportar reportes'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }
    }
}
```

**3. Ejecutar:**
```bash
php artisan db:seed --class=NewPermissionsSeeder
```

### Opción 2: Vía Tinker (Rápido)

```bash
php artisan tinker
```

```php
>>> App\Models\Permission::create(['name' => 'reportes.generar', 'description' => 'Generar reportes'])
>>> $admin = App\Models\Role::where('name', 'administrador')->first()
>>> $admin->permissions()->attach(App\Models\Permission::where('name', 'reportes.generar')->first())
```

### Opción 3: Vía BD Directa (Solo desarrollo)

```sql
INSERT INTO permissions (name, description, created_at, updated_at)
VALUES ('reportes.generar', 'Generar reportes', NOW(), NOW());

INSERT INTO role_permission (role_id, permission_id, created_at, updated_at)
SELECT 1, id, NOW(), NOW() FROM permissions WHERE name = 'reportes.generar';
```

---

## 🔄 Asignar Permisos a Otros Roles

```php
// En seeder o controller
$choferRole = Role::where('name', 'chofer')->first();

// Asignar permisos específicos
$choferRole->permissions()->attach([
    Permission::where('name', 'usuarios.ver')->first()->id,
]);
```

---

## 📊 Verificar Permisos de un Rol

```bash
php artisan tinker
```

```php
>>> $admin = App\Models\Role::with('permissions')->find(1)
>>> $admin->permissions
>>> $admin->hasPermission('usuarios.ver')  # true
>>> $admin->hasPermission('reportes.generar')  # false (si no está asignado)
```

---

## 🎯 Próximos Pasos

1. **Crear Policies** para autorización granular
2. **Crear Gates** para verificaciones adicionales
3. **Implementar UI para gestión de permisos** (Dashboard de admin)
4. **Agregar auditoría** de cambios de permisos
5. **Tests automatizados** para RBAC

---

## 📝 Notas

- ✅ Sistema RBAC está **100% operacional**
- ✅ Todos los permisos están asignados al rol **administrador**
- ✅ Middlewares están **registrados y listos**
- ⏳ UI para gestión de permisos: **Pendiente (futura implementación)**
- ⏳ Tests automatizados: **Pendiente (futura implementación)**

---

**Última actualización:** 2026-06-06
