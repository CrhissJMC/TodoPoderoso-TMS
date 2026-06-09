import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function DeleteConfirmModal({ vehicle, onClose }: any) {
    const [processing, setProcessing] = useState(false);

    if (!vehicle) return null;

    function handleDelete() {
        setProcessing(true);
        router.delete(route('vehicles.destroy', vehicle.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 sm:p-8 flex flex-col gap-5 shadow-2xl" role="dialog" aria-modal="true">

                {/* Icono Peligro */}
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto sm:mx-0">
                    <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" className="text-red-600 dark:text-red-500" strokeWidth="2">
                        <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Texto */}
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminar vehículo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        ¿Estás seguro de que deseas eliminar el vehículo <strong className="text-gray-900 dark:text-white">{vehicle.plate} — {vehicle.brand} {vehicle.model}</strong>? Esta acción no se puede deshacer.
                    </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={onClose} className="px-5 py-2.5 w-full sm:w-auto rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleDelete} disabled={processing} className="px-5 py-2.5 w-full sm:w-auto rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm">
                        {processing ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}