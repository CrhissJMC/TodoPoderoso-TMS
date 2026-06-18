import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TripModal from './Partials/TripModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';
import StatusChangeModal from './Partials/StatusChangeModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Route { id: number; name: string; origin: string; destination: string; base_fare: string; estimated_minutes: number | null; }
interface Vehicle { id: number; plate: string; brand: string; model: string; sellable_seats: number; }
interface Driver { id: number; name: string; license_number: string; }
interface Schedule { id: number; departure_time: string; }

interface Trip {
    id: number;
    // 🔴 CAMPOS AGREGADOS PARA SOLUCIONAR EL ERROR DE TYPESCRIPT:
    schedule_id: number | null;
    route_id: number;
    vehicle_id: number | null;
    driver_id: number | null;
    // -----------------------------------------------------------
    route: Route;
    vehicle: Vehicle | null;
    driver: Driver | null;
    schedule: Schedule | null;
    trip_date: string;
    status: string;
    observations: string | null;
    tickets_count: number;
    packages_count: number;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    trips: Paginated<Trip>;
    counts: Record<string, number>;
    routes: Route[];
    vehicles: Vehicle[];
    drivers: Driver[];
    filters: Record<string, string>;
    statuses: string[];
}

// ── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; select: string; dot: string }> = {
    programado: {
        label: 'Programado',
        badge: 'bg-gray-100 text-gray-600 ring-gray-200',
        select: 'bg-gray-50 text-gray-600 border-gray-300',
        dot: 'bg-gray-400',
    },
    abordando: {
        label: 'Abordando',
        badge: 'bg-blue-100 text-blue-700 ring-blue-200',
        select: 'bg-blue-50 text-blue-700 border-blue-300',
        dot: 'bg-blue-500',
    },
    en_ruta: {
        label: 'En ruta',
        badge: 'bg-amber-100 text-amber-700 ring-amber-200',
        select: 'bg-amber-50 text-amber-700 border-amber-300',
        dot: 'bg-amber-500',
    },
    completado: {
        label: 'Completado',
        badge: 'bg-green-100 text-green-700 ring-green-200',
        select: 'bg-green-50 text-green-700 border-green-300',
        dot: 'bg-green-500',
    },
    cancelado: {
        label: 'Cancelado',
        badge: 'bg-red-100 text-red-600 ring-red-200',
        select: 'bg-red-50 text-red-600 border-red-300',
        dot: 'bg-red-400',
    },
};

function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.programado;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function TripsIndex({ trips, counts, routes, vehicles, drivers, filters, statuses }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatus] = useState(filters.status ?? '');
    const [dateFilter, setDate] = useState(filters.date ?? '');
    const [routeFilter, setRoute] = useState(filters.route_id ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTrip, setEdit] = useState<Trip | null>(null);
    const [deleteTarget, setDelete] = useState<Trip | null>(null);
    const [statusTarget, setStatusT] = useState<Trip | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(route('trips.index'),
            { search, status: statusFilter, date: dateFilter, route_id: routeFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch(''); setStatus(''); setDate(''); setRoute('');
        router.get(route('trips.index'), {}, { replace: true });
    }

    const hasFilters = search || statusFilter || dateFilter || routeFilter;

    function openEdit(t: Trip) { setEdit(t); setModalOpen(true); }
    function closeModal() { setModalOpen(false); setEdit(null); }

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Viajes</h2>
        }>
            <Head title="Viajes" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Flash */}
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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                        { key: 'programado', label: 'Programados', color: 'text-gray-600' },
                        { key: 'abordando', label: 'Abordando', color: 'text-blue-600' },
                        { key: 'en_ruta', label: 'En ruta', color: 'text-amber-600' },
                        { key: 'completado', label: 'Hoy completados', color: 'text-green-600' },
                        { key: 'cancelado', label: 'Hoy cancelados', color: 'text-red-500' },
                    ].map(s => (
                        <button
                            key={s.key}
                            onClick={() => { setStatus(s.key); applyFilters({ status: s.key }); }}
                            className={`bg-white rounded-xl border px-4 py-3 text-left transition-colors hover:border-gray-300 ${statusFilter === s.key ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200'}`}
                        >
                            <p className={`text-xl font-semibold leading-none ${s.color}`}>{counts[s.key] ?? 0}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative min-w-[180px] flex-1 max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                            <input type="text" placeholder="Buscar ruta…" value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>

                        {/* Fecha */}
                        <input type="date" value={dateFilter}
                            onChange={e => { setDate(e.target.value); applyFilters({ date: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />

                        {/* Estado */}
                        <select value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
                        </select>

                        {/* Ruta */}
                        <select value={routeFilter}
                            onChange={e => { setRoute(e.target.value); applyFilters({ route_id: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todas las rutas</option>
                            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>

                        {hasFilters && (
                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                Limpiar
                            </button>
                        )}
                    </div>

                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Nuevo viaje
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ruta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Vehículo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Conductor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Boletos / Enc.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {trips.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                                            <p className="text-base font-medium text-gray-500">
                                                {hasFilters ? 'No hay viajes con esos filtros' : 'No hay viajes registrados'}
                                            </p>
                                            <p className="text-sm">Agrega el primero con el botón "Nuevo viaje"</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : trips.data.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Fecha */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 text-sm">{formatDate(t.trip_date)}</p>
                                        {t.schedule && (
                                            <p className="text-xs text-gray-400 mt-0.5">{t.schedule.departure_time.substring(0, 5)}</p>
                                        )}
                                    </td>

                                    {/* Ruta */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{t.route.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                            <span>{t.route.origin}</span>
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                            <span>{t.route.destination}</span>
                                        </div>
                                    </td>

                                    {/* Vehículo */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {t.vehicle ? (
                                            <div>
                                                <span className="font-mono text-xs bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">{t.vehicle.plate}</span>
                                                <p className="text-xs text-gray-400 mt-0.5">{t.vehicle.brand} {t.vehicle.model}</p>
                                            </div>
                                        ) : <span className="text-gray-400 text-sm">—</span>}
                                    </td>

                                    {/* Conductor */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {t.driver
                                            ? <p className="text-sm text-gray-700">{t.driver.name}</p>
                                            : <span className="text-gray-400 text-sm">—</span>}
                                    </td>

                                    {/* Boletos / Encomiendas */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                                                {t.tickets_count}
                                            </span>
                                            <span className="text-gray-300">·</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                                {t.packages_count}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <button onClick={() => setStatusT(t)} className="hover:opacity-75 transition-opacity">
                                            <StatusBadge status={t.status} />
                                        </button>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={route('trips.show', t.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Ver detalle">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </Link>
                                            {!['completado', 'cancelado'].includes(t.status) && (
                                                <button onClick={() => openEdit(t)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Editar">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                                </button>
                                            )}
                                            {!['abordando', 'en_ruta'].includes(t.status) && (
                                                <button onClick={() => setDelete(t)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {trips.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">Mostrando {trips.from}–{trips.to} de {trips.total} viajes</p>
                        <div className="flex items-center gap-1">
                            {trips.links.map((link, i) => (
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

            <TripModal isOpen={modalOpen} trip={editTrip} routes={routes} vehicles={vehicles} drivers={drivers} onClose={closeModal} />
            <StatusChangeModal trip={statusTarget} onClose={() => setStatusT(null)} />
            <DeleteConfirmModal trip={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}