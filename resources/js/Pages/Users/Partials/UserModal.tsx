import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

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
}

interface Props {
    isOpen: boolean;
    user: User | null;
    roles: Role[];
    onClose: () => void;
}

export default function UserModal({ isOpen, user, roles, onClose }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (user) {
                setData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    role_id: user.role_id.toString(),
                });
            } else {
                reset();
            }
        }
    }, [isOpen, user]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={submit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Nombre completo" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                            <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="usuario@empresa.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña {user ? '(Opcional)' : '*'}
                            </label>
                            <input type="password" required={!user} minLength={8} value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder={user ? "Dejar en blanco para mantener actual" : "Mínimo 8 caracteres"} />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol de Acceso *</label>
                            <select required value={data.role_id} onChange={e => setData('role_id', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">Seleccione un rol...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{processing ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
