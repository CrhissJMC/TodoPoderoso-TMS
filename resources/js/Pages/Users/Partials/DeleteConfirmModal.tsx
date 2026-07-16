import { router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Props {
    user: User | null;
    onClose: () => void;
}

export default function DeleteConfirmModal({ user, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!user) return null;

    function confirmDelete() {
        setProcessing(true);
        router.delete(route('users.destroy', user!.id), {
            onSuccess: () => {
                setProcessing(false);
                onClose();
            },
            onError: () => setProcessing(false)
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Usuario</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        ¿Estás seguro de que deseas eliminar permanentemente a <strong>{user.name}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={processing} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} disabled={processing} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                            {processing ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
