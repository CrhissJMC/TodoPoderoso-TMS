import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TicketModal from './Partials/TicketModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

interface Stop { name: string; fare: string | null; }
interface AvailableTrip {
    id: number; label: string; status: string; route_name: string;
    origin: string; destination: string; base_fare: string;
    sellable_seats: number; stops: Stop[]; occupied_seats: number[];
}

interface TicketItem {
    id: number; trip_id: number;
    trip: { route: { name: string }; vehicle: { plate: string } | null };
    client: { name: string; document_type: string; document_number: string; phone: string | null };
    seat_number: number; boarding_stop: string; dropoff_stop: string; fare: string;
    ticket_status: string; payment_status: string; payment_method: string;
    ticket_code: string; sold_by: { name: string }; created_at: string;
    voided_by?: { name: string } | null;
    voided_at?: string | null;
}

interface Paginated<T> {
    data: T[]; from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tickets: Paginated<TicketItem>;
    counts: Record<string, number>;
    availableTrips: AvailableTrip[];
    filters: Record<string, string>;
    ticketStatuses: string[];
    paymentMethods: string[];
    paymentStatuses: string[];
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
    emitido: { label: 'Emitido', badge: 'bg-blue-100 text-blue-700 ring-blue-200' },
    abordado: { label: 'Abordado', badge: 'bg-green-100 text-green-700 ring-green-200' },
    anulado: { label: 'Anulado', badge: 'bg-red-100 text-red-600 ring-red-200' },
};

const METHOD_LABELS: Record<string, string> = { efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta' };
const PSTATUS_BADGE: Record<string, string> = { pagado: 'bg-green-50 text-green-700', pendiente: 'bg-yellow-50 text-yellow-700' };

function formatDateTime(d: string) {
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function TicketsIndex({ tickets, counts, availableTrips, filters, ticketStatuses, paymentMethods, paymentStatuses }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTicket, setEdit] = useState<TicketItem | null>(null);
    const [deleteTarget, setDelete] = useState<TicketItem | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(route('tickets.index'), { search, status: statusFilter, ...overrides }, { preserveState: true, replace: true });
    }

    function clearFilters() { setSearch(''); setStatus(''); router.get(route('tickets.index'), {}, { replace: true }); }

    function markBoarded(t: TicketItem) {
        router.patch(route('tickets.markBoarded', t.id), {}, { preserveScroll: true });
    }

    function openEdit(t: TicketItem) {
        setEdit({ ...t, trip_id: t.trip_id } as any);
        setModalOpen(true);
    }
    function closeModal() { setModalOpen(false); setEdit(null); }

    const hasFilters = search || statusFilter;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Venta de Boletos</h2>}>
            <Head title="Boletos" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

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

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { key: 'total', label: 'Total boletos', color: 'bg-gray-100 text-gray-600' },
                        { key: 'emitido', label: 'Emitidos', color: 'bg-blue-100 text-blue-600' },
                        { key: 'abordado', label: 'Abordados', color: 'bg-green-100 text-green-600' },
                        { key: 'anulado', label: 'Anulados', color: 'bg-red-100 text-red-500' },
                    ].map(s => (
                        <button key={s.key}
                            onClick={() => s.key !== 'total' && (setStatus(s.key), applyFilters({ status: s.key }))}
                            className={`bg-white rounded-xl border px-4 py-3 text-left transition-colors hover:border-gray-300 ${statusFilter === s.key ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200'}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                            </div>
                            <p className="text-xl font-semibold text-gray-900 leading-none">{counts[s.key] ?? 0}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                            <input type="text" placeholder="Código, cliente, documento…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <select value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">Todos los estados</option>
                            {ticketStatuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
                        </select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Limpiar</button>
                        )}
                    </div>
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Vender boleto
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Viaje</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Asiento / Tramo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Pago</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.data.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-16">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                                        <p className="text-base font-medium text-gray-500">{hasFilters ? 'No hay boletos con esos filtros' : 'No hay boletos vendidos'}</p>
                                        <p className="text-sm">Vende el primero con "Vender boleto"</p>
                                    </div>
                                </td></tr>
                            ) : tickets.data.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-1 rounded">{t.ticket_code}</span>
                                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(t.created_at)}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{t.client?.name}</p>
                                        <p className="text-xs text-gray-400">{t.client?.document_type}: {t.client?.document_number}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <p className="text-gray-700">{t.trip.route.name}</p>
                                        {t.trip.vehicle && <p className="text-xs text-gray-400 font-mono">{t.trip.vehicle.plate}</p>}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-semibold text-xs inline-flex items-center justify-center mr-2">{t.seat_number}</span>
                                        <span className="text-xs text-gray-500">{t.boarding_stop} → {t.dropoff_stop}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <p className="font-semibold text-gray-900">S/ {parseFloat(t.fare).toFixed(2)}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-xs text-gray-500">{METHOD_LABELS[t.payment_method] ?? t.payment_method}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PSTATUS_BADGE[t.payment_status] ?? 'bg-gray-100'}`}>{t.payment_status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_CONFIG[t.ticket_status]?.badge ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                                            {STATUS_CONFIG[t.ticket_status]?.label ?? t.ticket_status}
                                        </span>
                                        <div className="mt-1 flex flex-col gap-0.5">
                                            {t.sold_by && (
                                                <span className="text-[10px] text-gray-500">Vendido por: {t.sold_by.name}</span>
                                            )}
                                            {t.ticket_status === 'anulado' && t.voided_by && (
                                                <span className="text-[10px] text-red-500">Anulado por: {t.voided_by.name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {t.ticket_status === 'emitido' && (
                                                <button onClick={() => markBoarded(t)} title="Marcar como abordado"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                            )}
                                            {t.ticket_status !== 'anulado' && (
                                                <button onClick={() => openEdit(t)} title="Editar"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                                </button>
                                            )}
                                            {t.ticket_status !== 'anulado' && (
                                                <button onClick={() => setDelete(t)} title="Anular"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tickets.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">Mostrando {tickets.from}–{tickets.to} de {tickets.total} boletos</p>
                        <div className="flex items-center gap-1">
                            {tickets.links.map((link, i) => (
                                <button key={i} disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`min-w-[32px] h-8 px-2 text-sm rounded-lg border transition-colors ${link.active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <TicketModal isOpen={modalOpen} ticket={editTicket as any} availableTrips={availableTrips}
                paymentMethods={paymentMethods} paymentStatuses={paymentStatuses} onClose={closeModal} />
            <DeleteConfirmModal ticket={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}
