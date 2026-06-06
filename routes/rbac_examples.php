<?php

// 📌 EJEMPLOS DE RUTAS PROTEGIDAS CON RBAC
// 📝 Descomentar y adaptar según sea necesario

// ============================================
// ADMINISTRACIÓN DE USUARIOS
// ============================================

// Solo administradores pueden ver todos los usuarios
// Route::get('/admin/users', [UserController::class, 'index'])
//     ->middleware(['auth', 'verified', 'role:administrador'])
//     ->name('admin.users.index');

// Solo usuarios con permiso 'usuarios.ver' pueden verlos
// Route::get('/admin/users', [UserController::class, 'index'])
//     ->middleware(['auth', 'verified', 'permission:usuarios.ver'])
//     ->name('admin.users.index');

// Solo usuarios con permiso 'usuarios.cambiar_rol' pueden cambiar roles
// Route::patch('/admin/users/{user}/role', [UserController::class, 'updateRole'])
//     ->middleware(['auth', 'verified', 'permission:usuarios.cambiar_rol'])
//     ->name('admin.users.updateRole');

// Solo usuarios con permiso 'usuarios.suspender' pueden suspender usuarios
// Route::post('/admin/users/{user}/suspend', [UserController::class, 'suspend'])
//     ->middleware(['auth', 'verified', 'permission:usuarios.suspender'])
//     ->name('admin.users.suspend');

// Múltiples permisos: cualquiera de los dos
// Route::patch('/admin/users/{user}/status', [UserController::class, 'updateStatus'])
//     ->middleware(['auth', 'verified', 'permission:usuarios.cambiar_rol,usuarios.suspender'])
//     ->name('admin.users.updateStatus');

// ============================================
// PANEL DE ADMINISTRACIÓN
// ============================================

// Solo administradores acceden al panel
// Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
//     ->middleware(['auth', 'verified', 'role:administrador'])
//     ->name('admin.dashboard');

// ============================================
// REPORTES (EJEMPLO FUTURO)
// ============================================

// Route::get('/reports/sales', [ReportController::class, 'sales'])
//     ->middleware(['auth', 'verified', 'permission:reportes.generar'])
//     ->name('reports.sales');

// Route::post('/reports/export', [ReportController::class, 'export'])
//     ->middleware(['auth', 'verified', 'permission:reportes.exportar'])
//     ->name('reports.export');

// ============================================
// VALIDACIÓN DENTRO DE CONTROLLERS
// ============================================

/*
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Verificar permiso específico
        if (!$user->hasPermission('usuarios.ver')) {
            abort(403, 'No tienes permiso para ver usuarios.');
        }

        $users = User::all();
        return response()->json($users);
    }

    public function updateRole(Request $request, User $targetUser)
    {
        // Verificar que tiene el permiso
        if (!$request->user()->hasPermission('usuarios.cambiar_rol')) {
            abort(403, 'No tienes permiso para cambiar roles.');
        }

        $targetUser->update(['role_id' => $request->role_id]);
        return response()->json(['message' => 'Rol actualizado']);
    }

    public function suspend(Request $request, User $targetUser)
    {
        // Verificar que tiene el permiso
        if (!$request->user()->hasPermission('usuarios.suspender')) {
            abort(403, 'No tienes permiso para suspender usuarios.');
        }

        $targetUser->update(['estado' => 'suspendido']);
        return response()->json(['message' => 'Usuario suspendido']);
    }
}
*/

// ============================================
// VALIDACIÓN EN POLICIES
// ============================================

/*
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermission('usuarios.ver');
    }

    public function updateRole(User $user, User $model)
    {
        return $user->hasPermission('usuarios.cambiar_rol');
    }

    public function suspend(User $user, User $model)
    {
        return $user->hasPermission('usuarios.suspender');
    }
}
*/

// ============================================
// VALIDACIÓN EN BLADE TEMPLATES
// ============================================

/*
@if(auth()->user()->hasPermission('usuarios.ver'))
    <table>
        <!-- Listar usuarios -->
    </table>
@else
    <p>No tienes permiso para ver usuarios.</p>
@endif

@if(auth()->user()->hasPermission('usuarios.cambiar_rol'))
    <button onclick="changeRole()">Cambiar Rol</button>
@endif

@if(auth()->user()->hasPermission('usuarios.suspender'))
    <button onclick="suspend()">Suspender</button>
@endif
*/
