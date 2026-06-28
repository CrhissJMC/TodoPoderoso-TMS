import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DriverModal from './Partials/DriverModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';
import VehicleModal from '../Vehicles/Partials/VehicleModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Vehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    status: string;
}

interface Driver {
    id: number;
    name: string;
    dni: string;
    phone: string;
    email: string | null;
    license_number: string;
    license_type: string;
    license_expiry: string | null;
    contract_type: string;
    status: string;
    vehicle_id: number | null;
    vehicle: Vehicle | null;
}

interface Paginated<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    drivers: Paginated<Driver>;
    counts: { total: number; activo: number; en_viaje: number; inactivo: number };
    filters: { search?: string; status?: string };
    statuses: string[];
    licenseTypes: string[];
    contractTypes: string[];
    availableVehicles: Vehicle[];
    vehicleTypes: string[];
    vehicleStatuses: string[];
}

// ── Mapeos de UI ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    activo: 'bg-green-50 text-green-700 ring-green-200',
    en_viaje: 'bg-blue-50 text-blue-700 ring-blue-200',
    inactivo: 'bg-gray-100 text-gray-600 ring-gray-200',
};

// ── Componente Principal ──────────────────────────────────────────────────────

export default function DriversIndex({
    drivers,
    counts,
    filters,
    statuses,
    licenseTypes,
    contractTypes,
    availableVehicles,
    vehicleTypes,
    vehicleStatuses
}: Props) {
    const { flash, auth } = usePage().props as any;
    const permissions = auth.permissions || [];
    const hasAdmin = permissions.includes('conductores.admin');

    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    // Control de modales
    const [modalOpen, setModalOpen] = useState(false);
    const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

    const [editDriver, setEditDriver] = useState<Driver | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);

    function applyFilters(overrides = {}) {
        router.get(
            route('drivers.index'),
            { search, status: statusFilter, ...overrides },
            { preserveState: true, replace: true }
        );
    }

    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        router.get(route('drivers.index'), {}, { replace: true });
    }

    function openEdit(driver: Driver) {
        setEditDriver(driver);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditDriver(null);
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Conductores</h2>}>
            <Head title="Conductores" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Alertas de Flash */}
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

                {/* Tarjetas de Estadísticas Responsivas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total registrados', value: counts.total, color: 'bg-gray-100 text-gray-600' },
                        { label: 'Activos', value: counts.activo, color: 'bg-green-100 text-green-600' },
                        { label: 'En viaje', value: counts.en_viaje, color: 'bg-blue-100 text-blue-600' },
                        { label: 'Inactivos', value: counts.inactivo, color: 'bg-gray-100 text-gray-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 shadow-sm">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 leading-none">{s.value}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar (Buscador, Filtros y Botón) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row flex-1 gap-2">
                        <div className="relative w-full sm:flex-1 sm:max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar nombre, DNI o licencia…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map((s: string) => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                        </select>

                        {(search || statusFilter) && (
                            <button onClick={clearFilters} className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                Limpiar
                            </button>
                        )}
                    </div>

                    {hasAdmin && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap w-full sm:w-auto shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Nuevo conductor
                        </button>
                    )}
                </div>

                {/* Tabla de Conductores */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-6 py-3.5">Conductor</th>
                                    <th className="px-6 py-3.5">Licencia / Cat</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Contrato</th>
                                    <th className="px-6 py-3.5">Vehículo</th>
                                    <th className="px-6 py-3.5">Estado</th>
                                    <th className="px-6 py-3.5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {drivers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                            No se encontraron conductores registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    drivers.data.map(d => (
                                        <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4.5">
                                                <p className="font-semibold text-gray-900 leading-tight">{d.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">DNI: {d.dni} • Cel: {d.phone}</p>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <p className="font-mono text-sm text-gray-800">{d.license_number}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Cat: {d.license_type}</p>
                                            </td>
                                            <td className="px-6 py-4.5 hidden md:table-cell">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${d.contract_type === 'Propietario' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {d.contract_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                {d.vehicle ? (
                                                    <span className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded">
                                                        {d.vehicle.plate}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'activo' ? 'bg-green-500' : d.status === 'en_viaje' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                                    {d.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5 text-right">
                                                {hasAdmin && (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button onClick={() => openEdit(d)} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => setDeleteTarget(d)} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                {drivers.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {drivers.from}–{drivers.to} de {drivers.total} conductores
                        </p>
                        <div className="flex items-center gap-1">
                            {drivers.links.map((link, i) => (
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

            {/* MODAL 1: REGISTRO / EDICIÓN DEL CONDUCTOR */}
            <DriverModal
                isOpen={modalOpen}
                driver={editDriver}
                statuses={statuses}
                licenseTypes={licenseTypes}
                contractTypes={contractTypes}
                availableVehicles={availableVehicles}
                onClose={closeModal}
                onOpenNewVehicle={() => setVehicleModalOpen(true)}
            />

            {/* MODAL 2 (MODAL SOBRE MODAL): REGISTRO RÁPIDO DE VEHÍCULO */}
            <VehicleModal
                isOpen={vehicleModalOpen}
                vehicle={null}
                types={vehicleTypes}
                statuses={vehicleStatuses}
                onClose={() => setVehicleModalOpen(false)}
            />

            {/* MODAL 3: ELIMINACIÓN DE CONDUCTOR */}
            <DeleteConfirmModal driver={deleteTarget} onClose={() => setDeleteTarget(null)} />
        </AuthenticatedLayout>
    );
}