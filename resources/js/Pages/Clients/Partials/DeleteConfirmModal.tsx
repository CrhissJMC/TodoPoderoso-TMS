import { router } from '@inertiajs/react';

interface Client {
    id: number;
    name: string;
    document_number: string;
}

interface Props {
    client: Client | null;
    onClose: () => void;
}

export default function DeleteConfirmModal({ client, onClose }: Props) {
    if (!client) return null;

    function handleConfirm() {
        router.delete(route('clients.destroy', client!.id), {
            onSuccess: onClose,
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-900">Eliminar Cliente</h3>
                <p className="text-sm text-gray-500 mt-2">
                    ¿Estás seguro que deseas eliminar a <strong>{client.name}</strong>?
                    <br />Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
