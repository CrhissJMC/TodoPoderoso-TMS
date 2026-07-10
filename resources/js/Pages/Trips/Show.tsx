import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Stop { id: number; stop_name: string; stop_order: number; fare_from_origin: string | null; }
interface Route { id: number; name: string; origin: string; destination: string; base_fare: string; stops: Stop[]; }
interface Vehicle { id: number; plate: string; brand: string; model: string; sellable_seats: number; }
interface Driver { id: number; name: string; license_number: string; }
interface User { id: number; name: string; }
interface Client { id: number; name: string; document_number: string; }
interface Ticket { id: number; seat_number: number; fare: string; ticket_status: string; payment_method: string; boarding_stop: string; dropoff_stop: string; client: Client; ticket_code: string; }
interface Package { id: number; sender_name: string; receiver_name: string; origin: string; destination: string; package_type: string; price: string; status: string; tracking_code: string; }
interface Log { id: number; previous_status: string; new_status: string; changed_at: string; changed_by: User; }

interface Trip {
    id: number; status: string; trip_date: string; observations: string | null;
    route: Route; vehicle: Vehicle | null; driver: Driver | null; creator: User;
    tickets: Ticket[]; packages: Package[]; status_logs: Log[];
}

interface Props {
    trip: Trip;
    statuses: string[];
    statusConfig: Record<string, { label: string; color: string }>;
    allowedTransitions: string[];
}

const STATUS_BADGE: Record<string, string> = {
    programado: 'bg-gray-100 text-gray-600 ring-gray-200',
    abordando: 'bg-blue-100 text-blue-700 ring-blue-200',
    en_ruta: 'bg-amber-100 text-amber-700 ring-amber-200',
    completado: 'bg-green-100 text-green-700 ring-green-200',
    cancelado: 'bg-red-100 text-red-600 ring-red-200',
};

const TICKET_STATUS: Record<string, string> = {
    emitido: 'bg-blue-50 text-blue-700',
    abordado: 'bg-green-50 text-green-700',
    anulado: 'bg-red-50 text-red-500'
};
const PKG_STATUS: Record<string, string> = { recibido: 'bg-gray-100 text-gray-600', en_ruta: 'bg-amber-50 text-amber-700', entregado: 'bg-green-50 text-green-700' };

function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}
function formatDateTime(d: string) {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function TripShow({ trip, statusConfig }: Props) {
    const totalTickets = trip.tickets.reduce((s, t) => s + parseFloat(t.fare), 0);
    const totalPackages = trip.packages.reduce((s, p) => s + parseFloat(p.price), 0);

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('trips.index')} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                </Link>
                <h2 className="text-xl font-semibold text-gray-800">Detalle del viaje</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_BADGE[trip.status]}`}>
                    {statusConfig[trip.status]?.label ?? trip.status}
                </span>
            </div>
        }>
            <Head title={`Viaje — ${trip.route.name}`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Info principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Ruta */}
                    <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ruta</p>
                        <p className="text-lg font-semibold text-gray-900">{trip.route.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{formatDate(trip.trip_date)}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg font-medium">{trip.route.origin}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">{trip.route.destination}</span>
                        </div>
                        {trip.observations && (
                            <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-100 pt-3">{trip.observations}</p>
                        )}
                    </div>

                    {/* Resumen */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resumen</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vehículo</span>
                                <span className="font-mono font-medium text-gray-900">{trip.vehicle?.plate ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Conductor</span>
                                <span className="text-gray-900">{trip.driver?.name ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Boletos</span>
                                <span className="text-gray-900">{trip.tickets.length} / {trip.vehicle?.sellable_seats ?? '?'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Encomiendas</span>
                                <span className="text-gray-900">{trip.packages.length}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between font-medium">
                                <span className="text-gray-700">Total ingresos</span>
                                <span className="text-gray-900">S/ {(totalTickets + totalPackages).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Boletos */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Boletos ({trip.tickets.length})</p>
                        <p className="text-sm font-medium text-gray-900">S/ {totalTickets.toFixed(2)}</p>
                    </div>
                    {trip.tickets.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Sin boletos vendidos</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Pasajero</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Asiento</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Tramo</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Tarifa</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trip.tickets.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <p className="font-medium text-gray-900">{t.client.name}</p>
                                            <p className="text-xs text-gray-400">Doc: {t.client.document_number} · {t.ticket_code}</p>
                                        </td>
                                        <td className="px-4 py-2.5 hidden md:table-cell">
                                            <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs inline-flex items-center justify-center">{t.seat_number}</span>
                                        </td>
                                        <td className="px-4 py-2.5 hidden md:table-cell text-xs text-gray-500">
                                            {t.boarding_stop} → {t.dropoff_stop}
                                        </td>
                                        <td className="px-4 py-2.5 font-medium text-gray-900">S/ {parseFloat(t.fare).toFixed(2)}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_STATUS[t.ticket_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {t.ticket_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Encomiendas */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Encomiendas ({trip.packages.length})</p>
                        <p className="text-sm font-medium text-gray-900">S/ {totalPackages.toFixed(2)}</p>
                    </div>
                    {trip.packages.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Sin encomiendas asignadas</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Código</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Remitente → Receptor</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Tipo</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Precio</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trip.packages.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{p.tracking_code}</td>
                                        <td className="px-4 py-2.5">
                                            <p className="text-gray-900">{p.sender_name}</p>
                                            <p className="text-xs text-gray-400">→ {p.receiver_name}</p>
                                        </td>
                                        <td className="px-4 py-2.5 hidden md:table-cell text-gray-600 capitalize">{p.package_type.replace('_', ' ')}</td>
                                        <td className="px-4 py-2.5 font-medium text-gray-900">S/ {parseFloat(p.price).toFixed(2)}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${PKG_STATUS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Bitácora */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Bitácora de estados</p>
                    <div className="space-y-3">
                        {trip.status_logs.map((log, i) => (
                            <div key={log.id} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${STATUS_BADGE[log.new_status]?.includes('green') ? 'bg-green-500' : STATUS_BADGE[log.new_status]?.includes('amber') ? 'bg-amber-500' : STATUS_BADGE[log.new_status]?.includes('blue') ? 'bg-blue-500' : STATUS_BADGE[log.new_status]?.includes('red') ? 'bg-red-400' : 'bg-gray-400'}`} />
                                    {i < trip.status_logs.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" style={{ minHeight: '16px' }} />}
                                </div>
                                <div className="flex-1 pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-900">{log.new_status}</span>
                                        {log.previous_status !== '—' && (
                                            <span className="text-xs text-gray-400">desde {log.previous_status}</span>
                                        )}
                                        <span className="text-xs text-gray-400 ml-auto">{formatDateTime(log.changed_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">por {log.changed_by.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
