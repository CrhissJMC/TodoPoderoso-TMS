import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface RecentTrip {
    id: number;
    route_name: string;
    vehicle_plate: string | null;
    driver_name: string | null;
    status: string;
    occupied_seats: number;
    sellable_seats: number | null;
}

interface Props {
    tripsInProgress: number;
    passengersToday: number;
    fleet: { available: number; total: number };
    recentTrips: RecentTrip[];
    statusConfig: Record<string, { label: string; color: string }>;
}

const STATUS_BADGE: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Dashboard({ tripsInProgress, passengersToday, fleet, recentTrips, statusConfig }: Props) {
    const fleetPercent = fleet.total > 0 ? Math.round((fleet.available / fleet.total) * 100) : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Panel de Control - Transporte" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Mensaje principal del Proyecto */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 border-l-4 border-indigo-500">
                        <div className="p-6 flex items-center justify-between text-gray-900 dark:text-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Resumen Operativo</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sistema de Gestión de Transporte de Pasajeros</p>
                            </div>
                            <div className="hidden sm:block">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Operación Normal
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas con datos reales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Tarjeta 1 - Viajes en curso */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Viajes en Curso</h3>
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">{tripsInProgress}</p>
                            <p className="text-sm text-gray-500 mt-2">Abordando o en ruta ahora</p>
                        </div>

                        {/* Tarjeta 2 - Pasajeros Transportados */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Pasajeros (Hoy)</h3>
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">{passengersToday.toLocaleString('es-PE')}</p>
                            <p className="text-sm text-gray-500 mt-2">Boletos emitidos o abordados hoy</p>
                        </div>

                        {/* Tarjeta 3 - Vehículos Disponibles */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Flota Disponible</h3>
                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">{fleet.available} <span className="text-lg text-gray-400">/ {fleet.total}</span></p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 dark:bg-gray-700">
                                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${fleetPercent}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{fleetPercent}% de disponibilidad actual</p>
                        </div>

                    </div>

                    {/* Tabla de Viajes Activos Recientes */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Viajes Activos Recientes</h3>
                        </div>
                        {recentTrips.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-10">No hay viajes en curso o programados en este momento.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ruta / Vehículo</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Conductor</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ocupación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {recentTrips.map(trip => (
                                            <tr key={trip.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{trip.route_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{trip.vehicle_plate ?? 'Sin vehículo asignado'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {trip.driver_name ?? '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_BADGE[statusConfig[trip.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                        {statusConfig[trip.status]?.label ?? trip.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {trip.occupied_seats} / {trip.sellable_seats ?? '?'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
