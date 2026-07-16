import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface RecentTrip {
    id: number;
    route_name: string;
    vehicle_plate: string | null;
    driver_name: string | null;
    status: string;
    trip_date: string;
    time: string;
    occupied_seats: number;
    sellable_seats: number | null;
}

interface Package {
    id: number;
    tracking_code: string;
    destination: string;
    package_type: string;
}

interface Props {
    tripsInProgress: number;
    passengersToday: number;
    revenueToday: number;
    occupancyRate: number;
    revenueChart: { date: string; boletos: number; encomiendas: number }[];
    topRoutes: { name: string; tickets_count: number }[];
    recentTrips: RecentTrip[];
    pendingPackages: Package[];
    statusConfig: Record<string, { label: string; color: string }>;
}

const STATUS_BADGE: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard({ tripsInProgress, passengersToday, revenueToday, occupancyRate, revenueChart, topRoutes, recentTrips, pendingPackages, statusConfig }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Panel de Control - TMS" />

            <div className="py-6 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Resumen Superior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Ingresos Hoy */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ingresos del Día</p>
                                <p className="text-2xl font-bold text-gray-900">S/ {revenueToday.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* Viajes Activos */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Viajes en Ruta</p>
                                <p className="text-2xl font-bold text-gray-900">{tripsInProgress}</p>
                            </div>
                        </div>

                        {/* Boletos Hoy */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Boletos Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{passengersToday}</p>
                            </div>
                        </div>

                        {/* Ocupación */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ocupación</p>
                                <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Gráfico de Líneas: Ingresos de los últimos 7 días */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Ingresos (Últimos 7 días)</h3>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBoletos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorEncomiendas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `S/${val}`} />
                                        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                        <Tooltip 
                                            formatter={(value: number) => [`S/ ${value.toFixed(2)}`, '']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" name="Boletos" dataKey="boletos" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorBoletos)" />
                                        <Area type="monotone" name="Encomiendas" dataKey="encomiendas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEncomiendas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico Circular: Rutas Populares */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Rutas más populares</h3>
                            <p className="text-xs text-gray-500 mb-4">Basado en pasajes vendidos</p>
                            <div className="flex-1 w-full min-h-[250px]">
                                {topRoutes.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={topRoutes}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="tickets_count"
                                                nameKey="name"
                                                stroke="none"
                                            >
                                                {topRoutes.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => [`${value} boletos`, 'Ventas']}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend 
                                                layout="vertical" 
                                                verticalAlign="bottom" 
                                                align="center"
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                        No hay datos de rutas
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tablas Inferiores */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                        
                        {/* Próximos Viajes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Próximos Viajes</h3>
                                <Link href={route('trips.index')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todos</Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentTrips.length === 0 ? (
                                    <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay viajes programados próximamente.</p>
                                ) : recentTrips.map(trip => (
                                    <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-gray-500">{new Date(trip.trip_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                                            <span className="text-sm font-bold text-gray-900">{trip.time || '--:--'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{trip.route_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{trip.vehicle_plate ?? 'Sin vehículo'} · {trip.driver_name ?? 'Sin conductor'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[trip.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                {statusConfig[trip.status]?.label ?? trip.status}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500">{trip.occupied_seats} / {trip.sellable_seats ?? '?'} asientos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Encomiendas Pendientes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Encomiendas Pendientes</h3>
                                <Link href={route('packages.index')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todas</Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {pendingPackages.length === 0 ? (
                                    <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay encomiendas esperando despacho.</p>
                                ) : pendingPackages.map(pkg => (
                                    <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">Destino: {pkg.destination}</p>
                                            <p className="text-xs text-gray-500 truncate capitalize">{pkg.package_type.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                {pkg.tracking_code}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
