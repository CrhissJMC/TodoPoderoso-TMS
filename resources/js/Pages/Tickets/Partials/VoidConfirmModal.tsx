import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_code: string;
    passenger: { full_name: string };
    fare: string;
}

interface Props {
    ticket: Ticket | null;
    onClose: () => void;
}

export default function VoidConfirmModal({ ticket, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!ticket) return null;

    function handleVoid() {
        setProcessing(true);
        // Usamos el método DELETE que en el controlador cambia el estado a 'anulado'
        router.delete(route('tickets.destroy', ticket!.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto ring-8 ring-red-50/50">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Anular Boleto</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        Estás a punto de anular el boleto <span className="font-mono font-bold text-gray-700">{ticket.ticket_code}</span> a nombre de <span className="font-medium text-gray-700">{ticket.passenger.full_name}</span>.
                    </p>
                    <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 text-left">
                        <strong>Nota Financiera:</strong> Esta acción marcará el boleto como "Anulado" y descontará los <strong>S/ {parseFloat(ticket.fare).toFixed(2)}</strong> del reporte de ingresos. Esta acción no se puede deshacer.
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleVoid} disabled={processing}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {processing ? 'Anulando…' : 'Sí, anular boleto'}
                    </button>
                </div>
            </div>
        </div>
    );
}