import { useState, KeyboardEvent } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DriverModal from './Partials/DriverModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

// ── Interfaces TypeScript ────────────────────────────────────────────────────

interface Vehicle {
    id: number;
    plate: string;
    brand?: string;
    model?: string;
}

interface Driver {
    id: number;
    name: string;
    dni?: string | null;
    license_number: string;
    license_type: string;
    license_expiry?: string | null;
    phone: string;
    email?: string | null;
    status: 'activo' | 'en_viaje' | 'inactivo' | string;
    vehicle_id?: number | null;
    vehicle?: Vehicle | null;
    contract_type?: string;
    rental_fee?: string | null;
    observations?: string | null;
}

interface PaginatedDrivers {
    data: Driver[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface DriversIndexProps {
    drivers: PaginatedDrivers;
    counts: { total: number; activo: number; en_viaje: number; inactivo: number };
    availableVehicles: Vehicle[];
    filters: { search?: string; status?: string };
    statuses: string[];
    licenseTypes: string[];
    contractTypes: string[];
}

// ── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    activo: { label: 'Activo', classes: 'bg-green-100 text-green-700 ring-green-200' },
    en_viaje: { label: 'En viaje', classes: 'bg-blue-100 text-blue-700 ring-blue-200' },
    inactivo: { label: 'Inactivo', classes: 'bg-gray-100 text-gray-600 ring-gray-200' },
};

const STATUS_SELECT: Record<string, string> = {
    activo: 'bg-green-50 text-green-700 border-green-300 focus:ring-green-300',
    en_viaje: 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-300',
    inactivo: 'bg-gray-50 text-gray-600 border-gray-300 focus:ring-gray-300',
};

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({ label, value, colorClass, icon }: { label: string; value: number; colorClass: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-semibold text-gray-900 leading-none">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

function LicenseExpiry({ date }: { date?: string | null }) {
    if (!date) return <span className="text-gray-400 text-sm">—</span>;

    const expiry = new Date(date);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Vencida
            </span>
        );
    }
    if (diffDays <= 30) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {diffDays}d restantes
            </span>
        );
    }
    return (
        <span className="text-sm text-gray-600">
            {expiry.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
    );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function DriversIndex({ drivers, counts, availableVehicles, filters, statuses, licenseTypes, contractTypes }: DriversIndexProps) {
    const { flash } = usePage<any>().props;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatus] = useState(filters?.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editDriver, setEditDriver] = useState<Driver | null>(null);
    const [deleteTarget, setDelete] = useState<Driver | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(
            route('drivers.index'),
            { search, status: statusFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function handleSearchKey(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') applyFilters({ search: (e.target as HTMLInputElement).value });
    }

    function clearFilters() {
        setSearch(''); setStatus('');
        router.get(route('drivers.index'), {}, { replace: true });
    }

    function changeStatus(driver: Driver, newStatus: string) {
        router.patch(
            route('drivers.updateStatus', driver.id),
            { status: newStatus },
            { preserveScroll: true },
        );
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
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Conductores</h2>
        }>
            <Head title="Conductores" />

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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total conductores" value={counts.total} colorClass="bg-gray-100 text-gray-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>} />
                    <StatCard label="Activos" value={counts.activo} colorClass="bg-green-100 text-green-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard label="En viaje" value={counts.en_viaje} colorClass="bg-blue-100 text-blue-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>} />
                    <StatCard label="Inactivos" value={counts.inactivo} colorClass="bg-gray-100 text-gray-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                            <input
                                type="text"
                                placeholder="Nombre, licencia, DNI…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKey}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
                        </select>

                        {(search || statusFilter) && (
                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Limpiar</button>
                        )}
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Nuevo conductor
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Conductor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Licencia</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Vencimiento</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Contacto</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Modalidad</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Vehículo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {drivers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <p className="text-base font-medium text-gray-500">No hay conductores registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                drivers.data.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
                                                    {d.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{d.name}</p>
                                                    {d.dni && <p className="text-xs text-gray-500">DNI: {d.dni}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-sm text-gray-900">{d.license_number}</p>
                                            <span className="text-xs text-gray-500">Tipo {d.license_type}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <LicenseExpiry date={d.license_expiry} />
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <p className="text-gray-900">{d.phone}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="capitalize text-gray-900">{d.contract_type}</span>
                                            {d.contract_type === 'alquiler' && d.rental_fee && (
                                                <p className="text-xs text-amber-600 font-medium">Cuota: S/ {d.rental_fee}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {d.vehicle ? (
                                                <span className="inline-block font-mono text-xs border border-gray-300 rounded px-2 py-0.5 text-gray-700">
                                                    {d.vehicle.plate}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={d.status}
                                                onChange={e => changeStatus(d, e.target.value)}
                                                className={`text-xs font-medium border rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 ${STATUS_SELECT[d.status] ?? ''}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                                </button>
                                                <button onClick={() => setDelete(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
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
                                    className={`min-w-[32px] h-8 px-2 text-sm rounded-lg border transition-colors ${link.active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <DriverModal
                isOpen={modalOpen}
                driver={editDriver}
                availableVehicles={availableVehicles}
                licenseTypes={licenseTypes}
                statuses={statuses}
                contractTypes={contractTypes}
                onClose={closeModal}
            />

            <DeleteConfirmModal
                driver={deleteTarget}
                onClose={() => setDelete(null)}
            />
        </AuthenticatedLayout>
    );
}