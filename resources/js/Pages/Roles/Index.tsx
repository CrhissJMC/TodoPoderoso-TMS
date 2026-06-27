import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Permission {
    id: number;
    name: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
    users: { id: number; name: string; email: string; estado: string; role_id: number; }[];
}

interface Props {
    roles: Role[];
    modules: Record<string, string>;
}

export default function RolesIndex({ roles, modules }: Props) {
    const { flash } = usePage().props as any;
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);

    // Estado local para los permisos (modulo -> 'no' | 'ver' | 'admin')
    const [permissionsState, setPermissionsState] = useState<Record<string, string>>({});
    const [descriptionState, setDescriptionState] = useState('');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    
    const { data: formData, setData: setFormData, post, processing: isCreating, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        permissions: Object.keys(modules).reduce((acc, mod) => ({ ...acc, [mod]: 'no' }), {} as Record<string, string>)
    });

    function openCreateModal() {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => setIsCreateModalOpen(false)
        });
    }

    // Calcular el estado de los permisos cuando se selecciona un rol
    useEffect(() => {
        if (!selectedRole) return;
        
        setDescriptionState(selectedRole.description || '');
        setIsEditingDesc(false);

        const newState: Record<string, string> = {};
        const rolePerms = selectedRole.permissions.map(p => p.name);

        Object.keys(modules).forEach(mod => {
            const hasAdmin = rolePerms.includes(`${mod}.admin`);
            const hasVer = rolePerms.includes(`${mod}.ver`);
            
            if (hasAdmin) newState[mod] = 'admin';
            else if (hasVer) newState[mod] = 'ver';
            else newState[mod] = 'no';
        });

        setPermissionsState(newState);
    }, [selectedRole, modules]);

    function handlePermissionChange(moduleSlug: string, value: string) {
        setPermissionsState(prev => ({ ...prev, [moduleSlug]: value }));
    }

    function handleSave() {
        if (!selectedRole) return;
        setIsSaving(true);
        router.put(route('roles.update', selectedRole.id), {
            permissions: permissionsState,
            description: descriptionState
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                // Refrescar el rol seleccionado con los nuevos datos
                router.reload({ only: ['roles'] });
            },
            onError: () => setIsSaving(false)
        });
    }

    // Actualiza el role seleccionado si las props de roles cambian
    useEffect(() => {
        if (selectedRole) {
            const updated = roles.find(r => r.id === selectedRole.id);
            if (updated) setSelectedRole(updated);
        }
    }, [roles]);

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Roles y Permisos</h2>
        }>
            <Head title="Roles y Permisos" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
                
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

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Lista de Roles */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700">Roles del Sistema</h3>
                                <button onClick={openCreateModal} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                                    + Crear Rol
                                </button>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {roles.map(role => (
                                    <li key={role.id}>
                                        <button
                                            onClick={() => setSelectedRole(role)}
                                            className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                                                selectedRole?.id === role.id 
                                                    ? 'bg-blue-50 text-blue-700' 
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className="font-medium capitalize">{role.name}</span>
                                            {role.id === 1 && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Master</span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Configuración de Permisos */}
                    <div className="w-full md:w-2/3">
                        {selectedRole ? (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 capitalize">
                                            Permisos: {selectedRole.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Configura el nivel de acceso para cada módulo de la aplicación.
                                        </p>
                                        <div className="mt-2">
                                            <button onClick={() => setIsUsersModalOpen(true)} className="text-xs font-medium text-blue-600 hover:text-blue-800 underline">
                                                Ver lista de usuarios ({selectedRole.users?.length || 0})
                                            </button>
                                        </div>
                                    </div>
                                    {selectedRole.id !== 1 && (
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    )}
                                </div>

                                <div className="p-0 overflow-y-auto">
                                    <div className="m-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-blue-900 capitalize">Rol {selectedRole.name}</h4>
                                                {selectedRole.id !== 1 && !isEditingDesc && (
                                                    <button onClick={() => setIsEditingDesc(true)} className="text-xs text-blue-600 hover:text-blue-800 underline font-medium">
                                                        Modificar descripción
                                                    </button>
                                                )}
                                            </div>
                                            {selectedRole.id === 1 ? (
                                                <p className="text-sm text-blue-700 mt-1">
                                                    El rol <strong>administrador</strong> tiene acceso irrestricto a todo el sistema por defecto. Sus permisos no pueden ser removidos para evitar la pérdida de control del sistema.
                                                </p>
                                            ) : (
                                                <div className="mt-2">
                                                    {isEditingDesc ? (
                                                        <textarea 
                                                            className="w-full text-sm border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" 
                                                            rows={2} 
                                                            value={descriptionState} 
                                                            onChange={e => setDescriptionState(e.target.value)}
                                                            placeholder="Escribe la descripción del rol..."
                                                        ></textarea>
                                                    ) : (
                                                        <p className="text-sm text-blue-700">
                                                            {selectedRole.description || 'Este rol no tiene una descripción configurada aún. Puedes editar sus permisos en la tabla inferior.'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Módulo</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Nivel de Acceso</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {Object.entries(modules).map(([slug, name]) => (
                                                <tr key={slug} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                        {name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={permissionsState[slug] || 'no'}
                                                            onChange={e => handlePermissionChange(slug, e.target.value)}
                                                            disabled={selectedRole.id === 1 || isSaving}
                                                            className={`text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 ${
                                                                permissionsState[slug] === 'admin' ? 'border-green-300 bg-green-50 text-green-800' :
                                                                permissionsState[slug] === 'ver' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                                                'border-gray-200 bg-white text-gray-700'
                                                            }`}
                                                        >
                                                            <option value="no">Sin Acceso (No)</option>
                                                            <option value="ver">Solo Lectura (Ver)</option>
                                                            <option value="admin">Acceso Total (Admin)</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs hidden sm:table-cell">
                                                        {permissionsState[slug] === 'admin' && 'Puede crear, editar y eliminar registros.'}
                                                        {permissionsState[slug] === 'ver' && 'Solo puede ver la información, sin modificar nada.'}
                                                        {(permissionsState[slug] === 'no' || !permissionsState[slug]) && 'No puede acceder al módulo ni verlo en el menú.'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64 text-gray-500">
                                Selecciona un rol para ver y editar sus permisos
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal Crear Rol */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && setIsCreateModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Rol</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="flex-1 overflow-y-auto">
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData('name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej. Auditor" />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea value={formData.description} onChange={e => setFormData('description', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Describe brevemente las responsabilidades del rol..."></textarea>
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Permisos por defecto</label>
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-gray-100">
                                                {Object.entries(modules).map(([slug, name]) => (
                                                    <tr key={slug}>
                                                        <td className="px-4 py-2 font-medium text-gray-700">{name}</td>
                                                        <td className="px-4 py-2">
                                                            <select value={formData.permissions[slug]} onChange={e => setFormData('permissions', { ...formData.permissions, [slug]: e.target.value })} className="text-sm border-gray-300 rounded-lg py-1.5 focus:ring-blue-500 focus:border-blue-500">
                                                                <option value="no">No</option>
                                                                <option value="ver">Ver</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={isCreating} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{isCreating ? 'Guardando...' : 'Crear Rol'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Lista de Usuarios */}
            {isUsersModalOpen && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && setIsUsersModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Usuarios: {selectedRole.name}</h3>
                            <button onClick={() => setIsUsersModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {!selectedRole.users || selectedRole.users.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No hay usuarios asignados a este rol.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedRole.users.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                            <div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {u.estado}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
