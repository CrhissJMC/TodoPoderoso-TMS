import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Trip { id: number; route: { name: string }; trip_date: string; }
interface Props { trip: Trip | null; onClose: () => void; }

function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DeleteConfirmModal({ trip, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!trip) return null;

    function handleDelete() {
        setProcessing(true);
        router.delete(route('trips.destroy', trip!.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-base font-semibold text-gray-900">Eliminar viaje</h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                        ¿Confirmas eliminar el viaje de{' '}
                        <span className="font-medium text-gray-700">{trip.route.name}</span>{' '}
                        del{' '}<span className="font-medium text-gray-700">{formatDate(trip.trip_date)}</span>?
                        Los boletos y encomiendas asociados también se desvincularan.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleDelete} disabled={processing}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {processing ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
