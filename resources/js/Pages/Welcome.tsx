import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

interface Props {
    canLogin: boolean;
}

interface TrackData {
    found: boolean;
    package?: {
        tracking_code: string;
        sender_name: string;
        receiver_name: string;
        origin: string;
        destination: string;
        package_type: string;
        status: string;
        trip: {
            route: string;
            date: string;
            status: string;
            vehicle: string;
            driver: string;
        } | null;
    };
}

const STATUS_STAGES = ['recibido', 'en_ruta', 'listo_para_recojo', 'entregado'];

const STATUS_LABELS: Record<string, string> = {
    recibido: 'En Almacén Origen',
    en_ruta: 'En Ruta',
    listo_para_recojo: 'Listo para Recojo',
    entregado: 'Entregado',
};

const ICONS: Record<string, JSX.Element> = {
    recibido: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    en_ruta: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12.5M8 7v14m0-14V4m0 3H4m4 0h4m-4 0v14M16.5 7v14M16.5 7H20" /></svg>, // Simplified truck-like icon
    listo_para_recojo: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    entregado: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function Welcome({ canLogin }: Props) {
    const { company } = usePage().props as any;

    const themeStyles = company ? {
        '--color-primary': company.primary_color,
        '--color-bg': company.bg_color,
        '--color-accent': company.accent_color,
    } as React.CSSProperties : {};

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TrackData | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.get(`/api/track?code=${code}`);
            if (response.data.found) {
                setResult(response.data);
            } else {
                setError('No se encontró ninguna encomienda con este código.');
            }
        } catch (err) {
            setError('Ocurrió un error al buscar la encomienda. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Rastrea tu Encomienda - TodoPoderoso TMS" />
            
            <div className="min-h-screen flex flex-col font-sans bg-theme-bg" style={themeStyles}>
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl bg-theme-primary">
                                {company?.name ? company.name.charAt(0) : 'T'}
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">{company?.name || 'TodoPoderoso TMS'}</span>
                        </div>
                        {canLogin && (
                            <Link href={route('login')} className="text-sm font-semibold text-gray-700 hover:text-theme-primary transition-colors px-4 py-2 hover:bg-gray-50 rounded-lg">
                                Iniciar Sesión / Trabajadores
                            </Link>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col">
                    <div className="w-full relative overflow-hidden bg-theme-primary">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full opacity-50 blur-3xl bg-theme-accent"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full opacity-30 blur-3xl bg-black"></div>
                        
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center relative z-10">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                                Rastrea tu encomienda en <span className="text-white/80">tiempo real</span>
                            </h1>
                            <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
                                Ingresa el código de rastreo que te proporcionamos al realizar tu envío y conoce exactamente dónde se encuentra tu paquete.
                            </p>

                            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-6 h-6 text-gray-400 group-focus-within:text-theme-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </div>
                                <input 
                                    type="text" 
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="Ejemplo: PKG-00001" 
                                    className="w-full pl-12 pr-32 py-5 rounded-2xl border-0 ring-4 ring-theme-primary/30 bg-white text-gray-900 font-bold text-lg focus:ring-4 focus:ring-theme-primary/50 focus:outline-none transition-all shadow-xl uppercase"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="absolute inset-y-2 right-2 bg-theme-primary hover:opacity-90 text-white font-bold px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-6 inline-block bg-red-500/20 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-red-400/50">
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && result.package && (
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
                            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden transform -mt-24 relative z-20">
                                <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <p className="text-sm font-bold text-theme-primary uppercase tracking-widest mb-1">Resultado de Búsqueda</p>
                                        <h2 className="text-3xl font-extrabold text-gray-900">{result.package.tracking_code}</h2>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 text-center">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Origen</p>
                                            <p className="font-bold text-gray-900 text-lg">{result.package.origin}</p>
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl border border-theme-primary/20 text-center bg-theme-primary/5">
                                            <p className="text-xs font-semibold text-theme-primary uppercase">Destino</p>
                                            <p className="font-bold text-theme-primary text-lg">{result.package.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Progress */}
                                <div className="p-8 md:p-10 bg-gray-50/50">
                                    <div className="relative">
                                        {/* Background Line */}
                                        <div className="absolute left-[1.3rem] md:left-0 top-0 bottom-0 md:top-[1.3rem] md:bottom-auto md:w-full w-1 md:h-1 bg-gray-200 rounded-full" aria-hidden="true"></div>
                                        
                                        <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                                            {STATUS_STAGES.map((stage, idx) => {
                                                const currentStageIdx = STATUS_STAGES.indexOf(result.package!.status);
                                                const isCompleted = idx <= currentStageIdx;
                                                const isCurrent = idx === currentStageIdx;
                                                
                                                return (
                                                    <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 md:w-1/4">
                                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ${
                                                            isCompleted 
                                                                ? 'bg-theme-primary border-white text-white shadow-md ring-4 ring-theme-primary/20' 
                                                                : 'bg-white border-gray-200 text-gray-400'
                                                        }`}>
                                                            {ICONS[stage]}
                                                        </div>
                                                        <div className="md:text-center">
                                                            <p className={`font-bold ${isCurrent ? 'text-theme-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {STATUS_LABELS[stage]}
                                                            </p>
                                                            {isCurrent && stage === 'en_ruta' && result.package?.trip && (
                                                                <p className="text-xs text-gray-500 mt-1 font-medium bg-white px-2 py-1 rounded border border-gray-200 shadow-sm inline-block">
                                                                    Placa: {result.package.trip.vehicle}
                                                                </p>
                                                            )}
                                                            {isCurrent && stage === 'listo_para_recojo' && (
                                                                <p className="text-xs text-orange-600 mt-1 font-semibold bg-orange-50 px-2 py-1 rounded border border-orange-200 shadow-sm inline-block">
                                                                    ¡Te esperamos!
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Información del Paquete</h4>
                                        <dl className="space-y-3">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500 font-medium text-sm">Remitente:</dt>
                                                <dd className="font-bold text-gray-900 text-sm text-right">{result.package.sender_name}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500 font-medium text-sm">Destinatario:</dt>
                                                <dd className="font-bold text-gray-900 text-sm text-right">{result.package.receiver_name}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500 font-medium text-sm">Tipo de Paquete:</dt>
                                                <dd className="font-bold text-gray-900 text-sm text-right capitalize">{result.package.package_type.replace('_', ' ')}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    {result.package.trip && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Información del Viaje</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-500 font-medium text-sm">Ruta Asignada:</dt>
                                                    <dd className="font-bold text-gray-900 text-sm text-right">{result.package.trip.route}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-500 font-medium text-sm">Fecha de Viaje:</dt>
                                                    <dd className="font-bold text-gray-900 text-sm text-right">{result.package.trip.date}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-500 font-medium text-sm">Estado del Viaje:</dt>
                                                    <dd className="font-bold text-gray-900 text-sm text-right capitalize">{result.package.trip.status.replace('_', ' ')}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                
                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                        <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} TodoPoderoso Transport Management System. Todos los derechos reservados.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
