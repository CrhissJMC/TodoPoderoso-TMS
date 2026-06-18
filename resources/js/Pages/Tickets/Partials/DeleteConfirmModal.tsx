import { router } from '@inertiajs/react';
import { useState } from 'react';

interface TicketItem { id: number; ticket_code: string; seat_number: number; passenger: { full_name: string } }
interface Props { ticket: TicketItem | null; onClose: () => void; }

export default function DeleteConfirmModal({ ticket, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!ticket) return null;

    function handleDelete() {
        setProcessing(true);
        router.delete(route('tickets.destroy', ticket!.id), {
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-base font-semibold text-gray-900">Anular boleto</h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                        ¿Confirmas anular el boleto{' '}
                        <span className="font-mono font-semibold text-gray-700">{ticket.ticket_code}</span>{' '}
                        de <span className="font-medium text-gray-700">{ticket.passenger.full_name}</span>?
                        <br />
                        <span className="text-xs">El asiento {ticket.seat_number} quedará disponible nuevamente.</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleDelete} disabled={processing}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {processing ? 'Anulando…' : 'Sí, anular'}
                    </button>
                </div>
            </div>
        </div>
    );
}
