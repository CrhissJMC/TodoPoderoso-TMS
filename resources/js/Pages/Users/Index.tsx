import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserModal from './Partials/UserModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    estado: string;
    role_id: number;
    role?: Role;
}

interface Props {
    users: User[];
    roles: Role[];
    filters: { search?: string; role_id?: string };
}

export default function UsersIndex({ users, roles, filters }: Props) {
    const { flash, auth } = usePage().props as any;
    const currentUser = auth.user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const [search, setSearch] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role_id ?? '');

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(
            route('users.index'),
            { search, role_id: roleFilter, ...overrides },
            { preserveState: true, replace: true }
        );
    }

    function clearFilters() {
        setSearch(''); setRoleFilter('');
        router.get(route('users.index'), {}, { replace: true });
    }


    function openCreateModal() {
        setEditingUser(null);
        setIsModalOpen(true);
    }

    function openEditModal(user: User) {
        setEditingUser(user);
        setIsModalOpen(true);
    }
    
    function closeModals() {
        setIsModalOpen(false);
        setEditingUser(null);
    }

    function toggleStatus(user: User) {
        if (user.id === currentUser.id) {
            alert('No puedes cambiar tu propio estado de acceso.');
            return;
        }
        if (confirm(`¿Estás seguro de que deseas ${user.estado === 'activo' ? 'inhabilitar (dar de baja)' : 'reactivar'} a ${user.name}?`)) {
            router.patch(route('users.updateStatus', user.id));
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Usuarios" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Cuentas de Usuarios</h2>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto">
                        + Nuevo Usuario
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); applyFilters({ role_id: e.target.value }); }}
                        className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <option value="">Todos los roles</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {(search || roleFilter) && (
                        <button onClick={clearFilters} className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                        {flash.error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                {user.role?.name || 'Desconocido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.estado === 'activo' ? 'Activo' : 'Inhabilitado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1">
                                            <button onClick={() => openEditModal(user)} className="text-gray-400 hover:text-blue-600 font-medium transition-colors p-1" title="Editar">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                            </button>
                                            {user.id !== currentUser.id && user.id !== 1 && (
                                                <>
                                                    <button onClick={() => toggleStatus(user)} className={`font-medium transition-colors p-1 ${user.estado === 'activo' ? 'text-gray-400 hover:text-orange-600' : 'text-gray-400 hover:text-green-600'}`} title={user.estado === 'activo' ? 'Dar de baja' : 'Reactivar'}>
                                                        {user.estado === 'activo' ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        )}
                                                    </button>
                                                    <button onClick={() => setDeletingUser(user)} className="text-gray-400 hover:text-red-600 font-medium transition-colors p-1" title="Eliminar definitivamente">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <UserModal isOpen={isModalOpen} user={editingUser} roles={roles} onClose={closeModals} />
            <DeleteConfirmModal user={deletingUser} onClose={() => setDeletingUser(null)} />

        </AuthenticatedLayout>
    );
}
