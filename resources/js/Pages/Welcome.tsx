import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

interface RouteItem {
    id: number;
    name: string;
    base_fare: number;
}

interface Props {
    canLogin: boolean;
    activeRoutes: RouteItem[];
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
    en_ruta: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12.5M8 7v14m0-14V4m0 3H4m4 0h4m-4 0v14M16.5 7v14M16.5 7H20" /></svg>,
    listo_para_recojo: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    entregado: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function Welcome({ canLogin, activeRoutes }: Props) {
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

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.get(`/api/track?code=${code.trim()}`);
            setResult(response.data);
            if (!response.data.found) {
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
            <Head title={`Inicio - ${company?.name || 'TodoPoderoso TMS'}`} />

            <div className="min-h-screen flex flex-col font-sans bg-theme-bg" style={themeStyles}>
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-theme-primary shadow-lg shadow-theme-primary/30">
                                {company?.name ? company.name.charAt(0) : 'T'}
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">{company?.name || 'TodoPoderoso TMS'}</span>
                        </div>
                        
                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollTo('rastreo')} className="text-sm font-bold text-gray-600 hover:text-theme-primary transition-colors">Seguimiento de envíos</button>
                            <button onClick={() => scrollTo('zona-clientes')} className="text-sm font-bold text-gray-600 hover:text-theme-primary transition-colors">Zona Clientes</button>
                            <button onClick={() => scrollTo('cotizacion')} className="text-sm font-bold text-gray-600 hover:text-theme-primary transition-colors">Cotización</button>
                            <button onClick={() => scrollTo('ubicanos')} className="text-sm font-bold text-gray-600 hover:text-theme-primary transition-colors">Ubícanos</button>
                            
                            {canLogin && (
                                <Link href={route('login')} className="text-sm font-bold text-white bg-theme-primary hover:bg-theme-primary/90 transition-all px-6 py-2.5 rounded-full shadow-lg shadow-theme-primary/30">
                                    Iniciar Sesión
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1 flex flex-col">
                    {/* Hero Section & Tracking */}
                    <div id="rastreo" className="w-full relative overflow-hidden bg-theme-primary py-20 lg:py-32">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full opacity-50 blur-3xl bg-white/20"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full opacity-30 blur-3xl bg-black"></div>
                        
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
                                Rastrea tu envío en <span className="text-yellow-300">tiempo real</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
                                Confianza y rapidez en cada paquete. Ingresa tu número de remito (Tracking) y descubre exactamente dónde se encuentra.
                            </p>

                            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <svg className="w-8 h-8 text-gray-400 group-focus-within:text-theme-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </div>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="EJEMPLO: PKG-00001"
                                    className="w-full pl-16 pr-40 py-6 rounded-3xl border-0 ring-4 ring-white/20 bg-white text-gray-900 font-black text-xl md:text-2xl focus:ring-8 focus:ring-yellow-300/50 focus:outline-none transition-all shadow-2xl uppercase placeholder:text-gray-300 placeholder:font-bold"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute inset-y-3 right-3 bg-gray-900 hover:bg-black text-white font-bold px-8 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg text-lg flex items-center gap-2"
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>
                            
                            {error && (
                                <div className="max-w-2xl mx-auto mt-6 bg-red-500/20 text-white font-bold px-6 py-4 rounded-xl border border-red-500/50 backdrop-blur-sm animate-pulse">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resultados del Rastreo */}
                    {result?.found && result.package && (
                        <div className="max-w-4xl mx-auto px-4 w-full -mt-10 relative z-20 pb-20">
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Estado de Envío</h3>
                                        <p className="text-sm text-theme-primary font-bold">{result.package.tracking_code}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                        Activo
                                    </span>
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Remitente</p>
                                            <p className="text-gray-900 font-medium">{result.package.sender_name}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Destinatario</p>
                                            <p className="text-gray-900 font-medium">{result.package.receiver_name}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-[1.3rem] md:left-0 top-0 bottom-0 md:top-[1.3rem] md:bottom-auto md:w-full w-1 md:h-1 bg-gray-200 rounded-full" aria-hidden="true"></div>
                                        <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                                            {STATUS_STAGES.map((stage, idx) => {
                                                const currentStageIdx = STATUS_STAGES.indexOf(result.package!.status);
                                                const isCompleted = idx <= currentStageIdx;
                                                const isCurrent = idx === currentStageIdx;
                                                return (
                                                    <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 md:w-1/4">
                                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ${isCompleted
                                                                ? 'bg-theme-primary border-white text-white shadow-md ring-4 ring-theme-primary/20'
                                                                : 'bg-white border-gray-200 text-gray-400'
                                                            }`}>
                                                            {ICONS[stage]}
                                                        </div>
                                                        <div className="md:text-center">
                                                            <p className={`font-bold text-sm ${isCurrent ? 'text-theme-primary' : (isCompleted ? 'text-gray-900' : 'text-gray-400')}`}>
                                                                {STATUS_LABELS[stage]}
                                                            </p>
                                                            {stage === 'recibido' && <p className="text-xs text-gray-500 mt-1">{result.package.origin}</p>}
                                                            {stage === 'listo_para_recojo' && <p className="text-xs text-gray-500 mt-1">{result.package.destination}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {result.package.trip && (
                                        <div className="mt-10 pt-6 border-t border-gray-100">
                                            <div className="bg-blue-50 text-blue-800 rounded-xl p-4 text-sm flex gap-3 items-start">
                                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <div>
                                                    <p className="font-bold mb-1">Información de Transporte</p>
                                                    <p>Tu paquete ha sido asignado a un viaje y está programado para el <strong>{result.package.trip.date}</strong>.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Zona Clientes */}
                    <div id="zona-clientes" className="py-24 bg-white relative">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">¿Cómo rastrear tu envío?</h2>
                                <p className="text-lg text-gray-500 font-medium">Es súper sencillo. Sigue estos tres rápidos pasos para conocer el estado exacto de tu encomienda en cualquier momento.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                                {/* Paso 1 */}
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-sm border border-blue-100">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Realiza tu envío</h3>
                                    <p className="text-gray-500">Acércate a cualquiera de nuestras oficinas a nivel nacional y despacha tu encomienda.</p>
                                </div>
                                {/* Paso 2 */}
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center text-theme-primary mb-6 shadow-sm border border-theme-primary/20 relative">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        
                                        {/* Tooltip mockup visual */}
                                        <div className="absolute -right-8 -top-8 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl animate-bounce">
                                            PKG-00001
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Revisa tu Voucher</h3>
                                    <p className="text-gray-500">Busca el <strong>CÓDIGO DE RASTREO</strong> impreso en letras grandes en tu comprobante (Ej: PKG-XXXXX).</p>
                                </div>
                                {/* Paso 3 */}
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm border border-green-100">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">3. Ingresa el código</h3>
                                    <p className="text-gray-500">Escribe el código en el buscador superior de esta misma página y entérate de todo.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cotización */}
                    <div id="cotizacion" className="py-24 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Cotiza tu próximo viaje o envío</h2>
                                <p className="text-lg text-gray-500 font-medium">Precios transparentes y al alcance de tu bolsillo. Descubre nuestras tarifas referenciales por ruta.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {/* Pasajes */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">Tarifas de Pasajes</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {activeRoutes && activeRoutes.length > 0 ? activeRoutes.map(route => (
                                            <div key={route.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-theme-primary/30 transition-colors">
                                                <span className="font-bold text-gray-700">{route.name}</span>
                                                <span className="text-lg font-black text-theme-primary">S/ {Number(route.base_fare).toFixed(2)}</span>
                                            </div>
                                        )) : (
                                            <p className="text-gray-500 text-center py-4">No hay rutas disponibles.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Encomiendas */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">Fletes y Encomiendas</h3>
                                    </div>
                                    <p className="text-gray-500 mb-6 font-medium">Los envíos se tasan según el peso, tamaño y destino. Aquí tienes unos precios referenciales base (sobres):</p>
                                    <div className="space-y-4">
                                        {activeRoutes && activeRoutes.length > 0 ? activeRoutes.map(route => (
                                            <div key={route.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-500/30 transition-colors">
                                                <span className="font-bold text-gray-700">{route.name}</span>
                                                <span className="text-lg font-black text-green-600">desde S/ {(Number(route.base_fare) * 0.5).toFixed(2)}</span>
                                            </div>
                                        )) : (
                                            <p className="text-gray-500 text-center py-4">No hay tarifas disponibles.</p>
                                        )}
                                    </div>
                                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-yellow-800 text-sm font-medium border border-yellow-200">
                                        💡 Para objetos grandes o mercancía pesada, acércate a nuestras oficinas para una cotización exacta.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ubícanos */}
                    <div id="ubicanos" className="py-24 bg-white relative">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">Conectando el país, <span className="text-theme-primary">una ruta a la vez.</span></h2>
                                    <p className="text-lg text-gray-500 font-medium mb-8">
                                        En <strong>{company?.name || 'TodoPoderoso TMS'}</strong> nos dedicamos a ofrecer un servicio de transporte de pasajeros y encomiendas seguro, rápido y confiable. 
                                    </p>
                                    
                                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            Nuestra Oficina Principal
                                        </h3>
                                        <p className="text-gray-700 font-medium text-lg">Av Héroes del Cenepa 01721</p>
                                        <p className="text-gray-500 mb-4">Bagua, Amazonas</p>
                                        
                                        <div className="inline-flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-lg text-sm font-bold text-gray-700 font-mono">
                                            9F4F+QHF
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100">
                                    {/* Google Maps Embed using Bagua coordinates */}
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.32454659354!2d-78.5342795!3d-5.6329241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMzcnNTguNSJTIDc4wrAzMiczLjQiVw!5e0!3m2!1sen!2spe!4v1680000000000!5m2!1sen!2spe" 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación TodoPoderoso"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Footer Minimalista */}
                <footer className="bg-gray-900 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-gray-400 font-medium">
                            &copy; 2026 {company?.name || 'TodoPoderoso TMS'}. Todos los derechos reservados.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
