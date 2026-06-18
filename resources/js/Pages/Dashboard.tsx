import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
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

                    {/* Tarjetas de visualización de ejemplo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Tarjeta 1 - Viajes Activos */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Viajes en Curso</h3>
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">42</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                                <span className="text-green-500 font-medium flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    12%
                                </span>
                                <span className="ml-2">vs ayer</span>
                            </p>
                        </div>

                        {/* Tarjeta 2 - Pasajeros Transportados */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Pasajeros (Hoy)</h3>
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">1,250</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                                <span className="text-green-500 font-medium flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    5.4%
                                </span>
                                <span className="ml-2">vs ayer</span>
                            </p>
                        </div>

                        {/* Tarjeta 3 - Vehículos Disponibles */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Flota Disponible</h3>
                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">18 <span className="text-lg text-gray-400">/ 60</span></p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 dark:bg-gray-700">
                                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">30% de disponibilidad actual</p>
                        </div>

                        {/* Tarjeta 4 - Puntualidad */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Índice de Puntualidad</h3>
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-4 dark:text-white">94%</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                                <span className="text-red-500 font-medium flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    1.2%
                                </span>
                                <span className="ml-2">vs semana pasada</span>
                            </p>
                        </div>

                    </div>
                    
                    {/* Tabla de Rutas Recientes */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rutas Activas Recientes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ruta / Vehículo</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Conductor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ocupación</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">ETA</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Centro - Norte</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Bus #402</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">CM</div>
                                                <div className="ml-3 text-sm text-gray-900 dark:text-white">Carlos Mendoza</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">En Ruta</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            38 / 40 (95%)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            14 mins
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Terminal - Sur</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Van #118</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">LP</div>
                                                <div className="ml-3 text-sm text-gray-900 dark:text-white">Laura Pérez</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Retraso Leve</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            12 / 15 (80%)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            22 mins
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Aeropuerto Express</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Bus #505</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">RG</div>
                                                <div className="ml-3 text-sm text-gray-900 dark:text-white">Roberto Gómez</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Abordando</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            45 / 50 (90%)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            --
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}