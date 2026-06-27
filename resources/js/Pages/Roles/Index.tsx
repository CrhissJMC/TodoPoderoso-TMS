import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Permission {
    id: number;
    name: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
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
    const [isSaving, setIsSaving] = useState(false);

    // Calcular el estado de los permisos cuando se selecciona un rol
    useEffect(() => {
        if (!selectedRole) return;
        
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
            permissions: permissionsState
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
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-700">Roles del Sistema</h3>
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
                                    {selectedRole.id === 1 && (
                                        <div className="m-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-900">Rol Administrador Principal</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    El rol <strong>administrador</strong> tiene acceso irrestricto a todo el sistema por defecto. Sus permisos no pueden ser removidos para evitar la pérdida de control del sistema.
                                                </p>
                                            </div>
                                        </div>
                                    )}

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
        </AuthenticatedLayout>
    );
}
