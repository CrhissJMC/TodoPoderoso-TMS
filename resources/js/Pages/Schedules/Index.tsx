import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ScheduleModal from './Partials/ScheduleModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    base_fare: string;
}

interface Vehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    sellable_seats: number;
}

interface Driver {
    id: number;
    name: string;
    license_number: string;
}

interface Schedule {
    id: number;
    route_id: number;
    vehicle_id: number | null;
    driver_id: number | null;
    route: Route;
    vehicle: Vehicle | null;
    driver: Driver | null;
    departure_time: string;
    days_of_week: string;
    active: boolean;
    days_array: number[];
    formatted_time: string;
}

interface Paginated<T> {
    data: T[];
    from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    schedules: Paginated<Schedule>;
    counts: { total: number; active: number; today: number };
    routes: Route[];
    vehicles: Vehicle[];
    drivers: Driver[];
    filters: { search?: string; route_id?: string; active?: string };
}

// ── Constantes ───────────────────────────────────────────────────────────────

const DAY_LABELS: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

// ── Helpers ──────────────────────────────────────────────────────────────────

function DaysBadges({ days }: { days: number[] }) {
    return (
        <div className="flex gap-1 flex-wrap">
            {ALL_DAYS.map(d => (
                <span
                    key={d}
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${days.includes(d)
                        ? d === 6 ? 'bg-blue-100 text-blue-700'
                            : d === 7 ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-300'
                        }`}
                >
                    {DAY_LABELS[d]}
                </span>
            ))}
        </div>
    );
}

function isTodayActive(daysOfWeek: string): boolean {
    const today = new Date().getDay(); // 0=dom, 1=lun…
    const iso = today === 0 ? 7 : today;
    return daysOfWeek.split(',').map(Number).includes(iso);
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function SchedulesIndex({ schedules, counts, routes, vehicles, drivers, filters }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [routeFilter, setRoute] = useState(filters.route_id ?? '');
    const [activeFilter, setActive] = useState(filters.active ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editSchedule, setEdit] = useState<Schedule | null>(null);
    const [deleteTarget, setDelete] = useState<Schedule | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(route('schedules.index'),
            { search, route_id: routeFilter, active: activeFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch(''); setRoute(''); setActive('');
        router.get(route('schedules.index'), {}, { replace: true });
    }

    function toggleActive(s: Schedule) {
        router.patch(route('schedules.toggleActive', s.id), {}, { preserveScroll: true });
    }

    function openEdit(s: Schedule) { setEdit(s); setModalOpen(true); }
    function closeModal() { setModalOpen(false); setEdit(null); }

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Horarios</h2>
        }>
            <Head title="Horarios" />

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
                        {
                            label: 'Total horarios', value: counts.total,
                            color: 'bg-gray-100 text-gray-600',
                            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" /></svg>,
                        },
                        {
                            label: 'Activos', value: counts.active,
                            color: 'bg-green-100 text-green-600',
                            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                        },
                        {
                            label: 'Operan hoy', value: counts.today,
                            color: 'bg-blue-100 text-blue-600',
                            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
                        },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                {s.icon}
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
                                placeholder="Buscar por ruta…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>

                        <select
                            value={routeFilter}
                            onChange={e => { setRoute(e.target.value); applyFilters({ route_id: e.target.value }); }}
                            className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todas las rutas</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>

                        <select
                            value={activeFilter}
                            onChange={e => { setActive(e.target.value); applyFilters({ active: e.target.value }); }}
                            className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todos</option>
                            <option value="1">Activos</option>
                            <option value="0">Inactivos</option>
                        </select>

                        {(search || routeFilter || activeFilter) && (
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
                        Nuevo horario
                    </button>
                </div>

                {/* Grid de tarjetas */}
                {schedules.data.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-16">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
                            </svg>
                            <p className="text-base font-medium text-gray-500">No hay horarios registrados</p>
                            <p className="text-sm">Agrega el primero con el botón "Nuevo horario"</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {schedules.data.map(s => (
                            <ScheduleCard
                                key={s.id}
                                schedule={s}
                                onEdit={() => openEdit(s)}
                                onDelete={() => setDelete(s)}
                                onToggle={() => toggleActive(s)}
                            />
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {schedules.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {schedules.from}–{schedules.to} de {schedules.total} horarios
                        </p>
                        <div className="flex items-center gap-1">
                            {schedules.links.map((link, i) => (
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

            <ScheduleModal
                isOpen={modalOpen}
                schedule={editSchedule}
                routes={routes}
                vehicles={vehicles}
                drivers={drivers}
                onClose={closeModal}
            />
            <DeleteConfirmModal schedule={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}

// ── Tarjeta de horario ────────────────────────────────────────────────────────

function ScheduleCard({ schedule: s, onEdit, onDelete, onToggle }: {
    schedule: Schedule;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const operatesNow = s.active && isTodayActive(s.days_of_week);

    return (
        <div className={`bg-white rounded-xl border transition-colors flex flex-col h-full ${s.active ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
            {/* Header tarjeta */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-none">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Hora grande */}
                        <div className="text-center flex-shrink-0 pt-0.5">
                            <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums tracking-tight">
                                {s.formatted_time.split(' ')[0]}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                                {s.formatted_time.split(' ')[1]}
                            </p>
                        </div>
                        <div className="w-px h-10 bg-gray-200 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 pr-1">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2" title={s.route.name}>
                                {s.route.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 flex-wrap">
                                <span className="truncate max-w-[80px]" title={s.route.origin}>{s.route.origin}</span>
                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                                <span className="truncate max-w-[80px]" title={s.route.destination}>{s.route.destination}</span>
                            </div>
                        </div>
                    </div>

                    {/* Badge estado */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <button
                            onClick={onToggle}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 transition-colors ${s.active
                                ? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {s.active ? 'Activo' : 'Inactv'}
                        </button>
                        {operatesNow && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 px-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Hoy
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Cuerpo tarjeta */}
            <div className="px-4 py-3 space-y-2.5 flex-1">
                {/* Días */}
                <DaysBadges days={s.days_array} />

                {/* Vehículo */}
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    {s.vehicle ? (
                        <span className="text-gray-700">
                            <span className="font-mono font-medium">{s.vehicle.plate}</span>
                            <span className="text-gray-400 ml-1">— {s.vehicle.brand} {s.vehicle.model}</span>
                            <span className="text-gray-400 ml-1">· {s.vehicle.sellable_seats} asientos</span>
                        </span>
                    ) : (
                        <span className="text-gray-400 italic">Sin vehículo asignado</span>
                    )}
                </div>

                {/* Conductor */}
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                    {s.driver ? (
                        <span className="text-gray-700">{s.driver.name}</span>
                    ) : (
                        <span className="text-gray-400 italic">Sin conductor asignado</span>
                    )}
                </div>

                {/* Tarifa */}
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">S/ {parseFloat(s.route.base_fare).toFixed(2)}</span>
                    <span className="text-gray-400">tarifa base</span>
                </div>
            </div>

            {/* Footer tarjeta */}
            <div className="px-4 pb-3 pt-2 border-t border-gray-100 flex justify-end gap-1 flex-none">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    Editar
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
    );
}