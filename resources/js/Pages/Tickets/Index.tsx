import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import VoidConfirmModal from '@/Pages/Tickets/Partials/VoidConfirmModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Passenger { id: number; full_name: string; dni: string; }
interface Route { id: number; name: string; origin: string; destination: string; }
interface Trip { id: number; trip_date: string; route: Route; }
interface Seller { id: number; name: string; }

interface Ticket {
    id: number;
    ticket_code: string;
    seat_number: number;
    boarding_stop: string;
    dropoff_stop: string;
    fare: string;
    ticket_status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    passenger: Passenger;
    trip: Trip;
    seller: Seller;
}

interface Paginated<T> {
    data: T[];
    from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tickets: Paginated<Ticket>;
    counts: { total: number; validos: number; anulados: number };
    filters: { search?: string; ticket_status?: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
    valido: { label: 'Válido', badge: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-500' },
    anulado: { label: 'Anulado', badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
    utilizado: { label: 'Utilizado', badge: 'bg-gray-100 text-gray-700 ring-gray-300', dot: 'bg-gray-500' },
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 transition-colors ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function TicketsIndex({ tickets, counts, filters }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.ticket_status ?? '');
    const [voidTarget, setVoidTarget] = useState<Ticket | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(route('tickets.index'),
            { search, ticket_status: statusFilter, ...overrides },
            { preserveState: true, replace: true }
        );
    }

    function clearFilters() {
        setSearch(''); setStatusFilter('');
        router.get(route('tickets.index'), {}, { replace: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Boletos Vendidos</h2>}>
            <Head title="Boletos" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        {flash.success}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 leading-none">{counts.total}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Total emitidos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 leading-none">{counts.validos}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Válidos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 leading-none">{counts.anulados}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Anulados</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                        <input type="text" placeholder="Buscar código o DNI/Nombre..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>

                    <select value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); applyFilters({ ticket_status: e.target.value }); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <option value="">Todos los estados</option>
                        <option value="valido">Válidos</option>
                        <option value="anulado">Anulados</option>
                        <option value="utilizado">Utilizados</option>
                    </select>

                    {(search || statusFilter) && (
                        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-6 py-3.5">Código / Fecha</th>
                                    <th className="px-6 py-3.5">Pasajero</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Ruta y Asiento</th>
                                    <th className="px-6 py-3.5">Cobro</th>
                                    <th className="px-6 py-3.5">Estado</th>
                                    <th className="px-6 py-3.5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                            {search || statusFilter ? 'No hay boletos que coincidan con la búsqueda.' : 'Aún no se han emitido boletos.'}
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.data.map(t => (
                                        <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.ticket_status === 'anulado' ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-4.5">
                                                <p className="font-mono font-bold text-gray-900">{t.ticket_code}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(t.created_at)}</p>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <p className="font-semibold text-gray-900">{t.passenger.full_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">DNI: {t.passenger.dni}</p>
                                            </td>
                                            <td className="px-6 py-4.5 hidden md:table-cell">
                                                <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                                    <span>{t.trip.route.origin}</span>
                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                                    <span>{t.trip.route.destination}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Asiento: <span className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{t.seat_number}</span>
                                                    <span className="mx-1.5">|</span>
                                                    Viaje: {t.trip.trip_date}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <p className="font-semibold text-gray-900">S/ {parseFloat(t.fare).toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 capitalize">{t.payment_method} - {t.payment_status}</p>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <StatusBadge status={t.ticket_status} />
                                            </td>
                                            <td className="px-6 py-4.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors" title="Imprimir ticket">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.728 13.528A3 3 0 108.85 8.85l-1.06 1.061M12 18.75V21m-3-2.25h6m-7.5-6h7.5m-7.5-3h7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                                    </button>
                                                    {t.ticket_status !== 'anulado' && (
                                                        <button onClick={() => setVoidTarget(t)} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors ml-2" title="Anular boleto">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                {tickets.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">Mostrando {tickets.from}–{tickets.to} de {tickets.total} boletos</p>
                        <div className="flex items-center gap-1">
                            {tickets.links.map((link, i) => (
                                <button key={i} disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`min-w-[32px] h-8 px-2 text-sm rounded-lg border transition-colors ${link.active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <VoidConfirmModal ticket={voidTarget} onClose={() => setVoidTarget(null)} />
        </AuthenticatedLayout>
    );
}