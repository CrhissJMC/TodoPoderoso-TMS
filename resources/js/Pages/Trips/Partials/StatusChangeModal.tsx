import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Trip { id: number; status: string; route: { name: string }; trip_date: string; }
interface Props { trip: Trip | null; onClose: () => void; }

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
    programado: { label: 'Programado', icon: 'M12 6v6l4 2',         color: 'text-gray-600',  bg: 'bg-gray-50',   border: 'border-gray-200' },
    abordando:  { label: 'Abordando',  icon: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9', color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-200' },
    en_ruta:    { label: 'En ruta',    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-200' },
    completado: { label: 'Completado', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200' },
    cancelado:  { label: 'Cancelado',  icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-200' },
};

const ALLOWED: Record<string, string[]> = {
    programado: ['abordando', 'cancelado'],
    abordando:  ['en_ruta', 'cancelado'],
    en_ruta:    ['completado', 'cancelado'],
    completado: [],
    cancelado:  [],
};

function formatDate(d: string) {
    const dateString = d.split('T')[0];
    return new Date(dateString + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function StatusChangeModal({ trip, onClose }: Props) {
    const [selected, setSelected]     = useState('');
    const [observations, setObs]      = useState('');
    const [processing, setProcessing] = useState(false);

    if (!trip) return null;

    const allowed = ALLOWED[trip.status] ?? [];
    const needsObs = selected === 'cancelado' || selected === 'completado';

    function handleSubmit() {
        if (!selected) return;
        setProcessing(true);
        router.patch(route('trips.updateStatus', trip!.id),
            { status: selected, observations: observations || undefined },
            {
                onSuccess: () => { setSelected(''); setObs(''); onClose(); },
                onFinish: () => setProcessing(false),
            }
        );
    }

    function handleClose() { setSelected(''); setObs(''); onClose(); }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Cambiar estado</h3>
                        <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">{trip.route.name}</span>
                        {' · '}{formatDate(trip.trip_date)}
                    </p>
                    {/* Estado actual */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Estado actual:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_CONFIG[trip.status]?.bg} ${STATUS_CONFIG[trip.status]?.color} ring-current ring-opacity-30`}>
                            {STATUS_CONFIG[trip.status]?.label}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {allowed.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Este viaje no puede cambiar de estado.</p>
                            <p className="text-xs text-gray-400 mt-1">Los viajes completados y cancelados son definitivos.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Selecciona el nuevo estado</p>

                            {/* Opciones */}
                            <div className="space-y-2">
                                {allowed.map(s => {
                                    const cfg = STATUS_CONFIG[s];
                                    const isSelected = selected === s;
                                    return (
                                        <button key={s} type="button" onClick={() => setSelected(s)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                                                isSelected ? `${cfg.border} ${cfg.bg}` : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? cfg.bg : 'bg-gray-100'}`}>
                                                <svg className={`w-4 h-4 ${isSelected ? cfg.color : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon}/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isSelected ? cfg.color : 'text-gray-700'}`}>{cfg.label}</p>
                                                {s === 'cancelado' && <p className="text-xs text-gray-400 mt-0.5">Se cancelarán las encomiendas en ruta</p>}
                                                {s === 'completado' && <p className="text-xs text-gray-400 mt-0.5">Las encomiendas se marcarán como entregadas</p>}
                                                {s === 'en_ruta' && <p className="text-xs text-gray-400 mt-0.5">Las encomiendas pasarán a "en ruta"</p>}
                                            </div>
                                            {isSelected && (
                                                <svg className={`w-5 h-5 ml-auto flex-shrink-0 ${cfg.color}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Observaciones */}
                            {selected && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Observaciones{needsObs && <span className="text-red-500 ml-0.5">*</span>}
                                    </label>
                                    <textarea value={observations} onChange={e => setObs(e.target.value)}
                                        placeholder={selected === 'cancelado' ? 'Motivo de cancelación…' : 'Novedades del viaje…'}
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <button onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        {allowed.length === 0 ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {allowed.length > 0 && (
                        <button onClick={handleSubmit}
                            disabled={!selected || (needsObs && !observations.trim()) || processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing ? 'Guardando…' : 'Confirmar cambio'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
