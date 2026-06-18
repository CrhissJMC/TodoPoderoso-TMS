import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RouteModal from './Partials/RouteModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';
import StopsDrawer from './Partials/StopsDrawer';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface RouteStop {
    id: number;
    stop_name: string;
    stop_order: number;
    minutes_from_origin: number | null;
    fare_from_origin: string | null;
}

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    estimated_minutes: number | null;
    base_fare: string;
    active: boolean;
    stops_count: number;
    stops: RouteStop[];
    duration_label: string;
}

interface PaginatedRoutes {
    data: Route[];
    from: number;
    to: number;
    total: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    routes: PaginatedRoutes;
    counts: { total: number; active: number; inactive: number };
    filters: { search?: string; active?: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(mins: number | null): string {
    if (!mins) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function formatFare(fare: string): string {
    return `S/ ${parseFloat(fare).toFixed(2)}`;
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function RoutesIndex({ routes, counts, filters }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [activeFilter, setActive] = useState(filters.active ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRoute, setEditRoute] = useState<Route | null>(null);
    const [deleteTarget, setDelete] = useState<Route | null>(null);
    const [stopsRoute, setStopsRoute] = useState<Route | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(
            route('routes.index'),
            { search, active: activeFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch(''); setActive('');
        router.get(route('routes.index'), {}, { replace: true });
    }

    function toggleActive(r: Route) {
        router.patch(route('routes.toggleActive', r.id), {}, { preserveScroll: true });
    }

    function openEdit(r: Route) { setEditRoute(r); setModalOpen(true); }
    function closeModal() { setModalOpen(false); setEditRoute(null); }

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Rutas y Paradas</h2>
        }>
            <Head title="Rutas" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                        {flash.error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total rutas', value: counts.total, color: 'bg-gray-100 text-gray-600' },
                        { label: 'Activas', value: counts.active, color: 'bg-green-100 text-green-600' },
                        { label: 'Inactivas', value: counts.inactive, color: 'bg-gray-100 text-gray-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 leading-none">{s.value}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row flex-1 gap-2">
                        <div className="relative w-full sm:flex-1 sm:max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Nombre, origen, destino…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>

                        <select
                            value={activeFilter}
                            onChange={e => { setActive(e.target.value); applyFilters({ active: e.target.value }); }}
                            className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todas</option>
                            <option value="1">Activas</option>
                            <option value="0">Inactivas</option>
                        </select>

                        {(search || activeFilter) && (
                            <button onClick={clearFilters} className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                Limpiar
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap w-full sm:w-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nueva ruta
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ruta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Duración</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tarifa base</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Paradas</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {routes.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-500">No hay rutas registradas</p>
                                            <p className="text-sm">Agrega la primera con el botón "Nueva ruta"</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : routes.data.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">

                                    {/* Ruta */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{r.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                                                    <span>{r.origin}</span>
                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                    </svg>
                                                    <span>{r.destination}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Duración */}
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                        {formatMinutes(r.estimated_minutes)}
                                    </td>

                                    {/* Tarifa */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="font-medium text-gray-900">{formatFare(r.base_fare)}</span>
                                    </td>

                                    {/* Paradas */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <button
                                            onClick={() => setStopsRoute(r)}
                                            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                            {r.stops_count > 0
                                                ? `${r.stops_count} parada${r.stops_count !== 1 ? 's' : ''}`
                                                : 'Sin paradas'}
                                        </button>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActive(r)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 transition-colors ${r.active
                                                ? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100'
                                                : 'bg-gray-100 text-gray-500 ring-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${r.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {r.active ? 'Activa' : 'Inactiva'}
                                        </button>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setStopsRoute(r)}
                                                title="Ver paradas"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => openEdit(r)}
                                                title="Editar"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDelete(r)}
                                                title="Eliminar"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {routes.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {routes.from}–{routes.to} de {routes.total} rutas
                        </p>
                        <div className="flex items-center gap-1">
                            {routes.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`min-w-[32px] h-8 px-2 text-sm rounded-lg border transition-colors
                                        ${link.active
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <RouteModal isOpen={modalOpen} routeData={editRoute} onClose={closeModal} />
            <StopsDrawer route={stopsRoute} onClose={() => setStopsRoute(null)} />
            <DeleteConfirmModal route={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}