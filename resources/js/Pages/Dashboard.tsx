import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
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

interface TopSeller {
    id: number;
    name: string;
    email: string;
    tickets_sold_count?: number;
    packages_received_count?: number;
}

interface Props {
    tripsInProgress?: number;
    passengersToday?: number;
    revenueToday?: number;
    occupancyRate?: number;
    revenueChart?: { date: string; boletos: number; encomiendas: number }[];
    packagesCountChart?: { date: string; recibidas: number; enviadas: number; devueltas: number }[];
    topRoutes?: { name: string; tickets_count: number }[];
    recentTrips?: RecentTrip[];
    pendingPackages?: Package[];
    topTicketSellers?: TopSeller[];
    topPackageSellers?: TopSeller[];
    driverTrips?: any[];
    driverTotalTrips?: number;
    driverFrequentRoutes?: { name: string; trips_count: number }[];
    driverUpcomingPackages?: { id: number; tracking_code: string; destination: string; package_type: string }[];
    driverRanking?: number;
    operatorTotalPackages?: number;
    operatorPendingPackages?: number;
    operatorRecentPackages?: any[];
    operatorRanking?: number;
    sellerTotalTickets?: number;
    sellerTodayTickets?: number;
    sellerRecentTickets?: any[];
    sellerRanking?: number;
    allRoutes?: { id: number; name: string; origin: string; destination: string }[];
    filters?: { route_id?: string };
    agentTotalTickets?: number;
    agentTodayTickets?: number;
    agentRecentTickets?: any[];
    agentTotalPackages?: number;
    agentPendingPackages?: number;
    agentRecentPackages?: any[];
    agentRevenueToday?: number;
    clientError?: string;
    clientKpis?: { programados: number; en_curso: number; completados: number; cancelados: number };
    clientActiveTrips?: any[];
    clientUpcomingPackages?: any[];
    clientRecentActivity?: any[];
    clientTripHistory?: any[];
    clientOtd?: number;
    clientTotalDelivered?: number;
    clientOnTimeDelivered?: number;
    clientRouteSummary?: { name: string; trips_count: number }[];
    statusConfig: Record<string, { label: string; color: string }>;
    complianceAlerts?: { plate: string; days_left: number; expiration_date: string }[];
}

const STATUS_BADGE: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard({ allRoutes = [], filters = {}, tripsInProgress = 0, passengersToday = 0, revenueToday = 0, occupancyRate = 0, revenueChart = [], packagesCountChart = [], topRoutes = [], recentTrips = [], pendingPackages = [], topTicketSellers = [], topPackageSellers = [], driverTrips = [], driverTotalTrips = 0, driverFrequentRoutes = [], driverUpcomingPackages = [], driverRanking = 0, operatorTotalPackages = 0, operatorPendingPackages = 0, operatorRecentPackages = [], operatorRanking = 0, sellerTotalTickets = 0, sellerTodayTickets = 0, sellerRecentTickets = [], sellerRanking = 0, agentTotalTickets = 0, agentTodayTickets = 0, agentRecentTickets = [], agentTotalPackages = 0, agentPendingPackages = 0, agentRecentPackages = [], agentRevenueToday = 0, clientError, clientKpis, clientActiveTrips = [], clientUpcomingPackages = [], clientRecentActivity = [], clientTripHistory = [], clientOtd = 0, clientTotalDelivered = 0, clientOnTimeDelivered = 0, clientRouteSummary = [], statusConfig, complianceAlerts = [] }: Props) {
    const { auth } = usePage().props as any;
    const [clientTab, setClientTab] = useState<'resumen' | 'historial' | 'notificaciones'>('resumen');
    const isAdmin = auth.role === 'administrador' || auth.user.role_id === 1;
    const isChofer = auth.role === 'chofer' || auth.user.role_id === 2;

    if (isChofer) {
        const upcomingTrips = driverTrips?.filter(t => t.status !== 'completado' && t.status !== 'cancelado') || [];

        return (
            <AuthenticatedLayout>
                <Head title="Panel de Conductor - TMS" />
                <div className="py-6 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Resumen Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Bienvenido, {auth.user.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Este es tu panel principal de conductor.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Ranking</p>
                                    <div className="inline-flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-blue-600">#{driverRanking}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Viajes Completados</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{driverTotalTrips}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Contenido Secundario */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Próximos Viajes */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-base font-bold text-gray-900">Mis Próximos Viajes</h3>
                                </div>
                                <div className="divide-y divide-gray-100 flex-1">
                                    {upcomingTrips.length === 0 ? (
                                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No tienes viajes programados próximamente.</p>
                                    ) : upcomingTrips.map(trip => (
                                        <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold">{new Date(trip.trip_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                                                <span className="text-sm font-bold">{trip.time || '--:--'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{trip.route_name}</p>
                                                <p className="text-xs text-gray-500 truncate">Vehículo: {trip.vehicle_plate ?? 'Sin vehículo'}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[trip.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[trip.status]?.label ?? trip.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Rutas Frecuentes */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-bold text-gray-900">Rutas Frecuentes</h3>
                                    </div>
                                    <div className="p-6">
                                        {driverFrequentRoutes.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center">Aún no hay datos de rutas frecuentes.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {driverFrequentRoutes.map((route, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">{route.name}</span>
                                                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{route.trips_count} viajes</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Encomiendas Asignadas */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-bold text-gray-900">Encomiendas que llevarás</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {driverUpcomingPackages.length === 0 ? (
                                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay encomiendas asignadas a tus próximos viajes.</p>
                                        ) : driverUpcomingPackages.map(pkg => (
                                            <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">Destino: {pkg.destination}</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{pkg.tracking_code}</p>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-md">
                                                    {pkg.package_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isPackageOperator = auth.role === 'operador_encomiendas' || auth.user.role_id === 4;

    if (isPackageOperator) {
        return (
            <AuthenticatedLayout>
                <Head title="Panel de Operador - TMS" />
                <div className="py-6 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Resumen Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Bienvenido, {auth.user.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Este es tu panel de recepción de encomiendas.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Ranking</p>
                                    <div className="inline-flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-indigo-600">#{operatorRanking}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-sm font-medium text-gray-500">Total Registradas</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{operatorTotalPackages}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 bg-orange-50/30">
                                    <p className="text-sm font-medium text-orange-600">Pendientes de Envío</p>
                                    <p className="text-3xl font-bold text-orange-700 mt-1">{operatorPendingPackages}</p>
                                </div>
                            </div>
                        </div>

                        {/* Últimos Envíos Registrados */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-900">Tus Últimos Registros</h3>
                                <Link href={route('packages.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    Ver todos →
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {!operatorRecentPackages || operatorRecentPackages.length === 0 ? (
                                    <p className="px-6 py-8 text-sm text-gray-400 text-center">Aún no has registrado ninguna encomienda.</p>
                                ) : operatorRecentPackages.map((pkg, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 truncate">Código: {pkg.tracking_code}</p>
                                                <p className="text-xs text-gray-500 truncate">Destino: {pkg.destination}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-700 truncate">De: {pkg.sender_name}</p>
                                                <p className="text-xs font-medium text-gray-700 truncate">Para: {pkg.receiver_name}</p>
                                            </div>
                                            <div className="flex flex-col items-start md:items-end gap-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[pkg.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[pkg.status]?.label ?? pkg.status}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(pkg.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isTicketOperator = auth.role === 'operador_ventas' || auth.user.role_id === 3;

    if (isTicketOperator) {
        return (
            <AuthenticatedLayout>
                <Head title="Panel de Ventas - TMS" />
                <div className="py-6 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Resumen Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Bienvenido, {auth.user.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Este es tu panel de ventas de pasajes.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Ranking</p>
                                    <div className="inline-flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-emerald-600">#{sellerRanking}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-sm font-medium text-gray-500">Total Vendidos</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{sellerTotalTickets}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 bg-emerald-50/30">
                                    <p className="text-sm font-medium text-emerald-600">Vendidos Hoy</p>
                                    <p className="text-3xl font-bold text-emerald-700 mt-1">{sellerTodayTickets}</p>
                                </div>
                            </div>
                        </div>

                        {/* Últimas Ventas */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-900">Tus Últimas Ventas</h3>
                                <Link href={route('tickets.index')} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
                                    Ver todos →
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {!sellerRecentTickets || sellerRecentTickets.length === 0 ? (
                                    <p className="px-6 py-8 text-sm text-gray-400 text-center">Aún no has vendido ningún boleto.</p>
                                ) : sellerRecentTickets.map((ticket, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold">Asiento</span>
                                            <span className="text-lg font-bold">{ticket.seat_number}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 truncate">Boleto: {ticket.ticket_code}</p>
                                                <p className="text-xs text-gray-500 truncate">Ruta: {ticket.trip_route}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 truncate">{ticket.client_name}</p>
                                                <p className="text-xs text-gray-500 truncate">Doc: {ticket.client_document}</p>
                                            </div>
                                            <div className="flex flex-col items-start md:items-end gap-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[ticket.ticket_status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[ticket.ticket_status]?.label ?? ticket.ticket_status}
                                                </span>
                                                <span className="text-xs font-bold text-gray-900">S/ {Number(ticket.fare).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isAgent = auth.role === 'agente' || auth.user.role_id === 5;

    if (isAgent) {
        return (
            <AuthenticatedLayout>
                <Head title="Panel de Agente - TMS" />
                <div className="py-6 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                        {/* Resumen Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Ingresos Hoy */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ingresos Generados Hoy</p>
                                    <p className="text-2xl font-bold text-gray-900">S/ {(agentRevenueToday || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            {/* Boletos Hoy */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5m-7.5-6.75h10.5M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Boletos Hoy</p>
                                    <p className="text-2xl font-bold text-gray-900">{agentTodayTickets}</p>
                                </div>
                            </div>

                            {/* Total Boletos */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Boletos</p>
                                    <p className="text-2xl font-bold text-gray-900">{agentTotalTickets}</p>
                                </div>
                            </div>

                            {/* Encomiendas Pendientes */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Enc. Pendientes</p>
                                    <p className="text-2xl font-bold text-gray-900">{agentPendingPackages} <span className="text-sm font-normal text-gray-400">/ {agentTotalPackages} total</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Tablas: Últimos Boletos y Encomiendas */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Últimos Boletos Vendidos */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="text-base font-bold text-gray-900">Últimos Boletos Vendidos</h3>
                                    <Link href={route('tickets.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                        Ver todos →
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-100 flex-1">
                                    {!agentRecentTickets || agentRecentTickets.length === 0 ? (
                                        <p className="px-6 py-8 text-sm text-gray-400 text-center">Aún no has vendido ningún boleto.</p>
                                    ) : agentRecentTickets.map((ticket: any, idx: number) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold">Asiento</span>
                                                <span className="text-lg font-bold">{ticket.seat_number}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{ticket.ticket_code}</p>
                                                <p className="text-xs text-gray-500 truncate">{ticket.trip_route}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[ticket.ticket_status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[ticket.ticket_status]?.label ?? ticket.ticket_status}
                                                </span>
                                                <span className="text-xs font-bold text-gray-900">S/ {Number(ticket.fare).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Últimas Encomiendas */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="text-base font-bold text-gray-900">Últimas Encomiendas Recibidas</h3>
                                    <Link href={route('packages.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                        Ver todas →
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-100 flex-1">
                                    {!agentRecentPackages || agentRecentPackages.length === 0 ? (
                                        <p className="px-6 py-8 text-sm text-gray-400 text-center">Aún no has recibido ninguna encomienda.</p>
                                    ) : agentRecentPackages.map((pkg: any, idx: number) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex flex-col items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{pkg.tracking_code}</p>
                                                <p className="text-xs text-gray-500 truncate">{pkg.trip_route} → {pkg.destination}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[pkg.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[pkg.status]?.label ?? pkg.status}
                                                </span>
                                                <span className="text-xs text-gray-500">{pkg.package_type}</span>
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

    const isClient = auth.role === 'cliente' || auth.user.role_id === 6;

    if (isClient) {
        if (clientError) {
            return (
                <AuthenticatedLayout>
                    <Head title="Panel de Cliente - TMS" />
                    <div className="py-10 bg-gray-50 min-h-screen">
                        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Cuenta no vinculada</h3>
                                <p className="text-gray-500">{clientError}</p>
                            </div>
                        </div>
                    </div>
                </AuthenticatedLayout>
            );
        }

        const kpis = clientKpis || { programados: 0, en_curso: 0, completados: 0, cancelados: 0 };

        return (
            <AuthenticatedLayout>
                <Head title="Mi Panel - TMS" />
                <div className="py-6 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                        {/* Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex gap-1">
                            {(['resumen', 'historial', 'notificaciones'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setClientTab(tab)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                                        clientTab === tab
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab === 'resumen' ? '📊 Resumen y Seguimiento' : tab === 'historial' ? '📋 Historial y Rendimiento' : '🔔 Notificaciones'}
                                </button>
                            ))}
                        </div>

                        {/* TAB 1: RESUMEN Y SEGUIMIENTO */}
                        {clientTab === 'resumen' && (
                            <>
                                {/* KPIs */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                            <p className="text-2xl font-bold text-gray-900">{kpis.programados}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">En Curso</p>
                                            <p className="text-2xl font-bold text-amber-600">{kpis.en_curso}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Completados</p>
                                            <p className="text-2xl font-bold text-green-600">{kpis.completados}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Cancelados</p>
                                            <p className="text-2xl font-bold text-red-600">{kpis.cancelados}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Seguimiento en Vivo */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-base font-bold text-gray-900">🛣️ Seguimiento en Vivo</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {clientActiveTrips.length === 0 ? (
                                                <p className="px-6 py-8 text-sm text-gray-400 text-center">No tienes viajes activos en este momento.</p>
                                            ) : clientActiveTrips.map((trip: any) => (
                                                <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-bold text-gray-900">{trip.route_name}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[trip.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                            {statusConfig[trip.status]?.label ?? trip.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{trip.origin}</span>
                                                        <span className="text-indigo-500">→</span>
                                                        <span>{trip.destination}</span>
                                                        <span className="ml-auto">🚌 {trip.vehicle_plate} · 👤 {trip.driver_name}</span>
                                                    </div>
                                                    {trip.estimated_minutes && (
                                                        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                                            <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse" style={{ width: trip.status === 'en_ruta' ? '60%' : '30%' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Próximas Entregas */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-base font-bold text-gray-900">📦 Próximas Entregas</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {clientUpcomingPackages.length === 0 ? (
                                                <p className="px-6 py-8 text-sm text-gray-400 text-center">No tienes entregas pendientes.</p>
                                            ) : clientUpcomingPackages.map((pkg: any) => (
                                                <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm font-bold text-gray-900">{pkg.tracking_code}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[pkg.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                            {statusConfig[pkg.status]?.label ?? pkg.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{pkg.origin} → {pkg.destination} · {pkg.package_type}</p>
                                                    {pkg.trip_date && <p className="text-xs text-indigo-600 mt-1">📅 {new Date(pkg.trip_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-PE')} {pkg.departure_time ? `a las ${pkg.departure_time}` : ''}</p>}
                                                    <span className="text-xs text-gray-400">{pkg.is_sender ? 'Enviado por ti' : 'Dirigido a ti'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actividad Reciente */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-bold text-gray-900">⚡ Actividad Reciente</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {clientRecentActivity.length === 0 ? (
                                            <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay actividad reciente.</p>
                                        ) : clientRecentActivity.map((item: any, idx: number) => (
                                            <div key={idx} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                                    item.type === 'viaje' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {item.type === 'viaje' ? '🚌' : '📦'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">{item.message}</p>
                                                    <p className="text-xs text-gray-400">{item.date ? new Date(item.date).toLocaleString('es-PE') : ''}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[item.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[item.status]?.label ?? item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TAB 2: HISTORIAL Y RENDIMIENTO */}
                        {clientTab === 'historial' && (
                            <>
                                {/* OTD + Resumen */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Entregas a Tiempo (OTD)</p>
                                        <p className="text-4xl font-bold text-indigo-600">{clientOtd}%</p>
                                        <p className="text-xs text-gray-400 mt-1">{clientOnTimeDelivered} de {clientTotalDelivered} entregadas en ≤24h</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Encomiendas</p>
                                        <p className="text-4xl font-bold text-gray-900">{clientTotalDelivered}</p>
                                        <p className="text-xs text-gray-400 mt-1">Encomiendas entregadas</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Rutas Utilizadas</p>
                                        <p className="text-4xl font-bold text-gray-900">{clientRouteSummary.length}</p>
                                        <p className="text-xs text-gray-400 mt-1">Rutas distintas</p>
                                    </div>
                                </div>

                                {/* Resumen por Ruta */}
                                {clientRouteSummary.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-base font-bold text-gray-900">🗺️ Resumen por Ruta</h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-3">
                                                {clientRouteSummary.map((r: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <span className="text-sm font-medium text-gray-900 w-48 truncate">{r.name}</span>
                                                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                                                            <div
                                                                className="bg-indigo-500 h-3 rounded-full transition-all"
                                                                style={{ width: `${Math.min((r.trips_count / (clientRouteSummary[0]?.trips_count || 1)) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700 w-16 text-right">{r.trips_count} viajes</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Historial de Viajes */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-bold text-gray-900">📋 Historial de Viajes</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {clientTripHistory.length === 0 ? (
                                                    <tr><td colSpan={6} className="px-6 py-8 text-sm text-gray-400 text-center">No tienes historial de viajes.</td></tr>
                                                ) : clientTripHistory.map((trip: any) => (
                                                    <tr key={trip.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 text-sm text-gray-900">{new Date(trip.trip_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-PE')}</td>
                                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{trip.route_name}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">{trip.origin}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">{trip.destination}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">{trip.time || '--:--'}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${STATUS_BADGE[statusConfig[trip.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                                {statusConfig[trip.status]?.label ?? trip.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TAB 3: NOTIFICACIONES */}
                        {clientTab === 'notificaciones' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-base font-bold text-gray-900">🔔 Centro de Notificaciones</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {clientRecentActivity.length === 0 ? (
                                        <p className="px-6 py-12 text-sm text-gray-400 text-center">No tienes notificaciones.</p>
                                    ) : clientRecentActivity.map((item: any, idx: number) => {
                                        const isException = item.status === 'cancelado' || item.status === 'devuelto';
                                        return (
                                            <div key={idx} className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${isException ? 'bg-red-50/50 border-l-4 border-red-400' : ''}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-0.5 ${
                                                    isException ? 'bg-red-100 text-red-600' :
                                                    item.status === 'completado' || item.status === 'entregado' ? 'bg-green-100 text-green-600' :
                                                    item.type === 'viaje' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {isException ? '⚠️' : item.type === 'viaje' ? '🚌' : '📦'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isException ? 'text-red-800' : 'text-gray-900'}`}>
                                                        {isException ? '¡Alerta! ' : ''}{item.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.date ? new Date(item.date).toLocaleString('es-PE') : ''}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-md flex-shrink-0 ${STATUS_BADGE[statusConfig[item.status]?.color] ?? STATUS_BADGE.gray}`}>
                                                    {statusConfig[item.status]?.label ?? item.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!isAdmin && !isChofer && !isPackageOperator && !isTicketOperator && !isAgent && !isClient) {
        return (
            <AuthenticatedLayout>
                <Head title="Panel de Control - TMS" />
                <div className="py-10 bg-gray-50 min-h-screen">
                    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Hola, {auth.user.name}!</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Has ingresado al sistema. Usa el menú lateral para acceder a las opciones de tu área de trabajo (Ventas, Encomiendas, etc).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Panel de Control - TMS" />

            <div className="py-6 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Filtros */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Métricas Generales</h2>
                            <p className="text-sm text-gray-500">Vista general del desempeño de la agencia</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label htmlFor="route_filter" className="text-sm font-medium text-gray-700">Filtrar por Ruta:</label>
                            <select
                                id="route_filter"
                                value={filters?.route_id || ''}
                                onChange={(e) => {
                                    router.get(route('dashboard'), { route_id: e.target.value }, { preserveState: true, preserveScroll: true });
                                }}
                                className="block w-64 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">Todas las Rutas</option>
                                {allRoutes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Alertas de Compliance */}
                    {complianceAlerts && complianceAlerts.length > 0 && (
                        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-red-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                </span>
                                <h3 className="text-base font-bold text-red-900">Alertas de Vencimiento de SOAT (Próximos 30 días)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {complianceAlerts.map((alert, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{alert.plate}</p>
                                            <p className="text-xs text-gray-500">Vence: {alert.expiration_date}</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${alert.days_left <= 7 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {alert.days_left < 0 ? 'Vencido' : alert.days_left === 0 ? 'Vence hoy' : `En ${alert.days_left} días`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resumen Superior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Ingresos Hoy */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ingresos del Día</p>
                                <p className="text-2xl font-bold text-gray-900">S/ {(revenueToday || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
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
                                            formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, '']}
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
                                                formatter={(value: any) => [`${value} boletos`, 'Ventas']}
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

                    {/* Gráficos de Encomiendas */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Estado de Encomiendas (Últimos 7 días)</h3>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={packagesCountChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRecibidas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorEnviadas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorDevueltas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" name="Recibidas" dataKey="recibidas" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorRecibidas)" />
                                        <Area type="monotone" name="Enviadas/Entregadas" dataKey="enviadas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEnviadas)" />
                                        <Area type="monotone" name="Devueltas" dataKey="devueltas" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDevueltas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
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

                    {/* Top Operadores (Solo Administrador) */}
                    {isAdmin && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                            {/* Top Vendedores */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-base font-bold text-gray-900">Top Operadores de Ventas</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {(!topTicketSellers || topTicketSellers.length === 0) ? (
                                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay datos de ventas registrados aún.</p>
                                    ) : topTicketSellers.map((seller, idx) => (
                                        <div key={seller.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{seller.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {seller.tickets_sold_count} <span className="text-xs font-normal text-gray-500">boletos</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Encomiendas */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-base font-bold text-gray-900">Top Operadores de Encomiendas</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {(!topPackageSellers || topPackageSellers.length === 0) ? (
                                        <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay encomiendas registradas aún.</p>
                                    ) : topPackageSellers.map((seller, idx) => (
                                        <div key={seller.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{seller.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {seller.packages_received_count} <span className="text-xs font-normal text-gray-500">envíos</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
