import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PassengerModal from './Partials/PassengerModal';
import DeleteConfirmModal from './Partials/DeleteConfirmModal';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Passenger {
    id: number;
    full_name: string;
    dni: string;
    phone: string | null;
    // Eliminado: email: string | null;
    tickets_count: number;
    completed_trips_count: number;
    initials: string;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    from: number; to: number; total: number; last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    passengers: Paginated<Passenger>;
    counts: { total: number; with_tickets: number };
    filters: { search?: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
];

function avatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function PassengersIndex({ passengers, counts, filters }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editPassenger, setEdit] = useState<Passenger | null>(null);
    const [deleteTarget, setDelete] = useState<Passenger | null>(null);

    function applySearch(value: string) {
        router.get(route('passengers.index'), { search: value }, { preserveState: true, replace: true });
    }

    function openEdit(p: Passenger) { setEdit(p); setModalOpen(true); }
    function closeModal() { setModalOpen(false); setEdit(null); }

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold text-gray-800">Pasajeros</h2>
        }>
            <Head title="Pasajeros" />

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
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 leading-none">{counts.total}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Total registrados</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 leading-none">{counts.with_tickets}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Con viajes registrados</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o teléfono…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applySearch(e.currentTarget.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>

                    {search && (
                        <button
                            onClick={() => { setSearch(''); applySearch(''); }}
                            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Limpiar
                        </button>
                    )}

                    <div className="sm:ml-auto">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Nuevo pasajero
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pasajero</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">DNI</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contacto</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Viajes</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {passengers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-500">
                                                {search ? 'No se encontraron resultados' : 'No hay pasajeros registrados'}
                                            </p>
                                            <p className="text-sm">
                                                {search ? `Ningún pasajero coincide con "${search}"` : 'Agrega el primero con el botón "Nuevo pasajero"'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : passengers.data.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">

                                    {/* Pasajero */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${avatarColor(p.id)}`}>
                                                {p.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{p.full_name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 md:hidden">DNI: {p.dni}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* DNI */}
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                            {p.dni}
                                        </span>
                                    </td>

                                    {/* Contacto */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {p.phone ? (
                                            <div>
                                                <p className="text-gray-700 text-sm">{p.phone}</p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>

                                    {/* Viajes */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {p.tickets_count > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {p.completed_trips_count} completado{p.completed_trips_count !== 1 ? 's' : ''}
                                                    </span>
                                                    {p.tickets_count !== p.completed_trips_count && (
                                                        <span className="text-xs text-gray-400">
                                                            {p.tickets_count} boleto{p.tickets_count !== 1 ? 's' : ''} en total
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Sin viajes</span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEdit(p)}
                                                title="Editar"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDelete(p)}
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
                {passengers.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {passengers.from}–{passengers.to} de {passengers.total} pasajeros
                        </p>
                        <div className="flex items-center gap-1">
                            {passengers.links.map((link, i) => (
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

            <PassengerModal isOpen={modalOpen} passenger={editPassenger} onClose={closeModal} />
            <DeleteConfirmModal passenger={deleteTarget} onClose={() => setDelete(null)} />
        </AuthenticatedLayout>
    );
}