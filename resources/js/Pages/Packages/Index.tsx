import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PackageModal from './Partials/PackageModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';
import AssignTripModal from './Partials/AssignTripModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface ActiveTrip {
    id: number;
    label: string;
    status: string;
    trip_date: string;
    route_name: string;
    locations: string[];
}

interface PackageItem {
    id: number;
    sender: { name: string; document_number: string; document_type: string; phone: string | null };
    receiver: { name: string; document_number: string; document_type: string; phone: string | null };
    origin: string;
    destination: string;
    package_type: string;
    weight: string | null;
    dimensions: string | null;
    price: string;
    payment_method: string;
    payment_status: string;
    status: string;
    tracking_code: string;
    observations: string | null;
    trip_id: number | null;
    trip: { route: { name: string }; trip_date: string } | null;
    received_by: { name: string };
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    packages: Paginated<PackageItem>;
    counts: Record<string, number>;
    activeTrips: ActiveTrip[];
    routePrices: any[];
    filters: { search?: string; status?: string; package_type?: string };
    packageTypes: string[];
    paymentMethods: string[];
    paymentStatuses: string[];
    statuses: string[];
    locations: string[];
}

// ── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
    recibido:  { label: 'Recibido',  badge: 'bg-gray-100 text-gray-600 ring-gray-200',   dot: 'bg-gray-400'  },
    en_ruta:   { label: 'En ruta',   badge: 'bg-amber-100 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
    entregado: { label: 'Entregado', badge: 'bg-green-100 text-green-700 ring-green-200', dot: 'bg-green-500' },
};

const STATUS_SELECT: Record<string, string> = {
    recibido:  'bg-gray-50 text-gray-600 border-gray-300',
    en_ruta:   'bg-amber-50 text-amber-700 border-amber-300',
    entregado: 'bg-green-50 text-green-700 border-green-300',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta',
};

const TYPE_LABELS: Record<string, string> = {
    sobre_manila: 'Sobre manila',
    caja_pequena: 'Caja pequeña',
    caja_mediana: 'Caja mediana',
    caja_grande:  'Caja grande',
};

const PAYMENT_STATUS: Record<string, string> = {
    pagado:   'bg-green-50 text-green-700',
    pendiente:'bg-yellow-50 text-yellow-700',
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function PackagesIndex({
    packages, counts, activeTrips, routePrices, filters,
    packageTypes, paymentMethods, paymentStatuses, statuses, locations,
}: Props) {
    const { flash, auth } = usePage().props as any;
    const permissions = auth.permissions || [];
    const hasAdmin = permissions.includes('encomiendas.admin');

    const [search, setSearch]         = useState(filters.search ?? '');
    const [statusFilter, setStatus]   = useState(filters.status ?? '');
    const [typeFilter, setType]       = useState(filters.package_type ?? '');
    const [modalOpen, setModalOpen]   = useState(false);
    const [editPkg, setEdit]          = useState<PackageItem | null>(null);
    const [deleteTarget, setDelete]   = useState<PackageItem | null>(null);
    const [assignTarget, setAssign]   = useState<PackageItem | null>(null);

    function applyFilters(overrides: Record<string, string> = {}) {
        router.get(route('packages.index'),
            { search, status: statusFilter, package_type: typeFilter, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch(''); setStatus(''); setType('');
        router.get(route('packages.index'), {}, { replace: true });
    }

    function changeStatus(pkg: PackageItem, newStatus: string) {
        router.patch(route('packages.updateStatus', pkg.id),
            { status: newStatus },
            { preserveScroll: true },
        );
    }

    function openEdit(p: PackageItem) { setEdit(p); setModalOpen(true); }
    function closeModal() { setModalOpen(false); setEdit(null); }

    const hasFilters = search || statusFilter || typeFilter;

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Encomiendas</h2>
        }>
            <Head title="Encomiendas" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/></svg>
                        {flash.error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { key: 'total',     label: 'Total',     color: 'bg-gray-100 text-gray-600'   },
                        { key: 'recibido',  label: 'Recibidas', color: 'bg-gray-100 text-gray-500'   },
                        { key: 'en_ruta',   label: 'En ruta',   color: 'bg-amber-100 text-amber-600' },
                        { key: 'entregado', label: 'Entregadas',color: 'bg-green-100 text-green-600' },
                    ].map(s => (
                        <button key={s.key}
                            onClick={() => s.key !== 'total' && (setStatus(s.key), applyFilters({ status: s.key }))}
                            className={`bg-white rounded-xl border px-4 py-3 text-left transition-colors hover:border-gray-300 ${statusFilter === s.key ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200'}`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                                </svg>
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
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                            <input type="text" placeholder="Remitente, destinatario, código…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>
                        <select value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">Todos los estados</option>
                            {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
                        </select>
                        <select value={typeFilter}
                            onChange={e => { setType(e.target.value); applyFilters({ package_type: e.target.value }); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">Todos los tipos</option>
                            {packageTypes.map(t => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
                        </select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Limpiar</button>
                        )}
                    </div>
                    {hasAdmin && (
                        <button onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                            Nueva encomienda
                        </button>
                    )}
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Remitente → Destinatario</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Ruta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tipo / Detalle</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Pago</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {packages.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
                                            <p className="text-base font-medium text-gray-500">
                                                {hasFilters ? 'No hay encomiendas con esos filtros' : 'No hay encomiendas registradas'}
                                            </p>
                                            <p className="text-sm">Agrega la primera con "Nueva encomienda"</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : packages.data.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">

                                    {/* Código */}
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                            {p.tracking_code}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(p.created_at)}</p>
                                    </td>

                                    {/* Remitente → Destinatario */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{p.sender?.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                            <span>{p.receiver?.name}</span>
                                        </div>
                                    </td>

                                    {/* Ruta */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <p className="text-gray-700 text-sm">{p.origin}</p>
                                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                            <span>{p.destination}</span>
                                        </div>
                                        {p.trip && (
                                            <p className="text-xs text-blue-600 mt-0.5">{p.trip.route.name}</p>
                                        )}
                                    </td>

                                    {/* Tipo / Detalle */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                            {TYPE_LABELS[p.package_type] ?? p.package_type}
                                        </span>
                                        {p.weight && (
                                            <p className="text-xs text-gray-400 mt-1">{p.weight} kg</p>
                                        )}
                                        {p.dimensions && (
                                            <p className="text-xs text-gray-400">{p.dimensions}</p>
                                        )}
                                    </td>

                                    {/* Pago */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <p className="font-semibold text-gray-900">S/ {parseFloat(p.price).toFixed(2)}</p>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <span className="text-xs text-gray-500">{PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PAYMENT_STATUS[p.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {p.payment_status}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        {p.status === 'entregado' || !hasAdmin ? (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_CONFIG[p.status].badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.status].dot}`} />
                                                {STATUS_CONFIG[p.status].label}
                                            </span>
                                        ) : (
                                            <select value={p.status}
                                                onChange={e => changeStatus(p, e.target.value)}
                                                className={`text-xs font-medium border rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 ${STATUS_SELECT[p.status] ?? ''}`}>
                                                {['recibido', 'en_ruta', 'entregado'].map(s => (
                                                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <a href={route('receipts.package.voucher', p.id)} target="_blank" title="Imprimir Voucher"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0v2.625c0 .621.504 1.125 1.125 1.125h8.25c.621 0 1.125-.504 1.125-1.125V7.057z" /></svg>
                                            </a>
                                            {p.sender?.document_type === 'DNI' && (
                                                <a href={route('receipts.package.boleta', p.id)} target="_blank" title="Imprimir Boleta"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-bold text-[10px]">
                                                    BOL
                                                </a>
                                            )}
                                            {p.sender?.document_type === 'RUC' && (
                                                <a href={route('receipts.package.factura', p.id)} target="_blank" title="Imprimir Factura"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-bold text-[10px]">
                                                    FAC
                                                </a>
                                            )}
                                            {p.status === 'recibido' && (
                                                <button onClick={() => setAssign(p)} title="Asignar a viaje"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
                                                </button>
                                            )}
                                            <button onClick={() => openEdit(p)} title={p.status === 'entregado' ? "Ver detalles" : "Editar"}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                {p.status === 'entregado' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
                                                )}
                                            </button>
                                            {p.status !== 'en_ruta' && (
                                                <button onClick={() => setDelete(p)} title="Eliminar"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
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
                {packages.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">Mostrando {packages.from}–{packages.to} de {packages.total} encomiendas</p>
                        <div className="flex items-center gap-1">
                            {packages.links.map((link, i) => (
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

            <PackageModal
                isOpen={modalOpen}
                pkg={editPkg}
                activeTrips={activeTrips}
                routePrices={routePrices}
                packageTypes={packageTypes}
                paymentMethods={paymentMethods}
                paymentStatuses={paymentStatuses}
                locations={locations}
                onClose={closeModal}
            />
            
            <DeleteConfirmModal pkg={deleteTarget} onClose={() => setDelete(null)} />
            <AssignTripModal pkg={assignTarget} activeTrips={activeTrips} onClose={() => setAssign(null)} />
        </AuthenticatedLayout>
    );
}
