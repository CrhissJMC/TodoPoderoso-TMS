<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->orderBy('name')->get();
        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'estado' => 'activo',
        ]);

        return back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        // El administrador no puede modificar el rol del root_admin si no es necesario,
        // pero vamos a permitir edición general. Solo protegeremos que no se inactive a sí mismo luego.
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function updateStatus(User $user)
    {
        // Un administrador no puede inhabilitarse a sí mismo para no perder el acceso
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes darte de baja a ti mismo.');
        }

        $user->estado = $user->estado === 'activo' ? 'inactivo' : 'activo';
        $user->save();

        $action = $user->estado === 'activo' ? 'reactivado' : 'dado de baja';

        return back()->with('success', "El usuario ha sido {$action} exitosamente.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }
        if ($user->id === 1) {
            return back()->with('error', 'El administrador principal no puede ser eliminado.');
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }
}
