import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import VehicleModal from './Partials/VehicleModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

// ── Constantes de UI ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    Auto: 'Auto',
    Minivan: 'Minivan',
    Bus: 'Bus',
    Otro: 'Otro',
};

// Mapeo de colores Tailwind para los nuevos estados
const STATUS_STYLES: Record<string, { label: string, classes: string }> = {
    disponible: { label: 'Disponible', classes: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
    en_ruta: { label: 'En ruta', classes: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    mantenimiento: { label: 'Mantenimiento', classes: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
    inactivo: { label: 'Inactivo', classes: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
};

// ── Componentes pequeños ────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string, value: number | string, accent: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-1 shadow-sm">
            <span className="text-3xl font-bold" style={{ color: accent }}>{value}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        </div>
    );
}

// ── Página principal ────────────────────────────────────────────────────────

export default function VehiclesIndex({ vehicles, counts, filters, types, statuses }: any) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatus] = useState(filters?.status ?? '');
    const [typeFilter, setType] = useState(filters?.type ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [deleteTarget, setDelete] = useState(null);

    // ── Búsqueda / filtros ──────────────────────────────────────────────────

    function applyFilters(overrides = {}) {
        router.get(
            route('vehicles.index'),
            { search, status: statusFilter, type: typeFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function handleSearchKey(e: any) {
        if (e.key === 'Enter') applyFilters({ search: e.target.value });
    }

    function clearFilters() {
        setSearch('');
        setStatus('');
        setType('');
        router.get(route('vehicles.index'), {}, { replace: true });
    }

    function changeStatus(vehicle: any, newStatus: string) {
        router.patch(
            route('vehicles.updateStatus', vehicle.id),
            { status: newStatus },
            { preserveScroll: true },
        );
    }

    function openEdit(vehicle: any) {
        setEditVehicle(vehicle);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditVehicle(null);
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-white">Flota de Vehículos</h2>}>
            <Head title="Vehículos" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard label="Total" value={counts.total} accent="#6b7280" />
                    <StatCard label="Disponibles" value={counts.disponible} accent="#16a34a" />
                    <StatCard label="En ruta" value={counts.en_ruta} accent="#2563eb" />
                    <StatCard label="Mantenimiento" value={counts.mantenimiento} accent="#d97706" />
                </div>

                {/* Toolbar (Filtros y Búsqueda) */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Buscador */}
                        <div className="relative flex-1 sm:max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none">
                                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar placa, marca..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKey}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            />
                        </div>

                        {/* Filtros Dropdown */}
                        <select
                            value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map((s: string) => (
                                <option key={s} value={s}>{STATUS_STYLES[s]?.label ?? s}</option>
                            ))}
                        </select>

                        <select
                            value={typeFilter}
                            onChange={e => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
                        >
                            <option value="">Todos los tipos</option>
                            {types.map((t: string) => (
                                <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                            ))}
                        </select>

                        {(search || statusFilter || typeFilter) && (
                            <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                Limpiar
                            </button>
                        )}
                    </div>

                    <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Nuevo vehículo
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Placa</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Vehículo</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Tipo</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Asientos (Vendibles)</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Estado</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {vehicles.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                                            <p className="text-base font-medium text-gray-600 dark:text-gray-300">No hay vehículos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vehicles.data.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 border-2 border-gray-200 dark:border-gray-600 rounded-md font-mono text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 tracking-widest">
                                                {v.plate}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{v.brand} {v.model}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Año: {v.year ?? '—'} {v.color && `• Color: ${v.color}`}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{TYPE_LABELS[v.type] ?? v.type}</td>

                                        {/* NUEVO: Asientos Vendibles vs Totales */}
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                            {v.sellable_seats} <span className="text-xs text-gray-500 font-normal">/ {v.capacity_seats} totales</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <select
                                                value={v.status}
                                                onChange={e => changeStatus(v, e.target.value)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none text-center ${STATUS_STYLES[v.status]?.classes ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                            >
                                                {statuses.map((s: string) => (
                                                    <option key={s} value={s}>{STATUS_STYLES[s]?.label ?? s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(v)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                                    <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                                                        <path d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => setDelete(v)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                                    <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                                                        <path d="M6 4h8M4 4h12M5 4l1 12h8l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M8 8v5M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {vehicles.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando <span className="font-medium text-gray-900 dark:text-white">{vehicles.from}</span>–<span className="font-medium text-gray-900 dark:text-white">{vehicles.to}</span> de <span className="font-medium text-gray-900 dark:text-white">{vehicles.total}</span> vehículos
                        </span>
                        <div className="flex gap-1">
                            {vehicles.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border ${link.active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <VehicleModal isOpen={modalOpen} vehicle={editVehicle} types={types} statuses={statuses} onClose={closeModal} />
            <DeleteConfirmModal vehicle={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}