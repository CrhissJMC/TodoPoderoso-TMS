import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

interface RouteStop {
    id: number;
    stop_name: string;
}

interface RoutePrice {
    id?: number;
    route_id: number;
    origin_name: string;
    destination_name: string;
    ticket_fare: number | null;
    pkg_fare_sobre_manila: number | null;
    pkg_fare_caja_pequena: number | null;
    pkg_fare_caja_mediana: number | null;
    pkg_fare_caja_grande: number | null;
}

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    base_fare: number;
    stops: RouteStop[];
    prices: RoutePrice[];
}

export default function PricesTab({ routes, primaryColor }: { routes: Route[], primaryColor: string }) {
    
    // Generar la matriz inicial de precios basada en todas las combinaciones de paradas
    const initialPrices = useMemo(() => {
        let pricesArr: RoutePrice[] = [];
        routes.forEach(route => {
            const locations = [route.origin, ...(route.stops || []).map(s => s.stop_name), route.destination];
            
            for (let i = 0; i < locations.length; i++) {
                for (let j = i + 1; j < locations.length; j++) {
                    const origin_name = locations[i];
                    const destination_name = locations[j];
                    
                    // Buscar si ya existe precio guardado
                    const existing = route.prices.find(p => p.origin_name === origin_name && p.destination_name === destination_name);
                    
                    // Si es la ruta completa, por defecto usar base_fare
                    const isFullRoute = i === 0 && j === locations.length - 1;

                    pricesArr.push({
                        route_id: route.id,
                        origin_name,
                        destination_name,
                        ticket_fare: existing?.ticket_fare ?? (isFullRoute ? route.base_fare : null),
                        pkg_fare_sobre_manila: existing?.pkg_fare_sobre_manila ?? null,
                        pkg_fare_caja_pequena: existing?.pkg_fare_caja_pequena ?? null,
                        pkg_fare_caja_mediana: existing?.pkg_fare_caja_mediana ?? null,
                        pkg_fare_caja_grande: existing?.pkg_fare_caja_grande ?? null,
                    });
                }
            }
        });
        return pricesArr;
    }, [routes]);

    const { data, setData, put, processing } = useForm({
        prices: initialPrices,
    });

    // Sincronizar si llegan nuevos props desde el servidor (ej. después de guardar)
    useEffect(() => {
        setData('prices', initialPrices);
    }, [initialPrices]);

    const [openRouteId, setOpenRouteId] = useState<number | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.company.prices.update'));
    };

    const updatePriceField = (routeId: number, origin: string, dest: string, field: keyof RoutePrice, value: any) => {
        const newPrices = [...data.prices];
        const idx = newPrices.findIndex(p => p.route_id === routeId && p.origin_name === origin && p.destination_name === dest);
        if (idx !== -1) {
            newPrices[idx] = { ...newPrices[idx], [field]: value === '' ? null : parseFloat(value) };
            setData('prices', newPrices);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Matriz de Tarifas</h3>
                        <p className="text-sm text-gray-500">Configura los precios para cada tramo (parada a parada).</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {processing ? 'Guardando...' : 'Guardar Matriz'}
                    </button>
                </div>

                <div className="space-y-4">
                    {routes.map((r) => {
                        const routePrices = data.prices.filter(p => p.route_id === r.id);
                        return (
                            <div key={r.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                                <button 
                                    type="button"
                                    onClick={() => setOpenRouteId(openRouteId === r.id ? null : r.id)}
                                    className="w-full bg-gray-50 px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                    <div className="text-left">
                                        <h4 className="font-bold text-gray-900">{r.name}</h4>
                                        <p className="text-xs text-gray-500">{r.origin} &rarr; {r.destination}</p>
                                    </div>
                                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openRouteId === r.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {openRouteId === r.id && (
                                    <div className="p-0 bg-white">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-600">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium whitespace-nowrap">Tramo (Origen &rarr; Destino)</th>
                                                        <th className="px-4 py-3 font-medium text-center border-l bg-blue-50">Pasaje (S/)</th>
                                                        <th className="px-4 py-3 font-medium border-l border-b bg-green-50" colSpan={4} title="Encomiendas">
                                                            <div className="text-center">Tarifas Encomiendas (S/)</div>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th className="px-4 py-2 border-b"></th>
                                                        <th className="px-4 py-2 border-l border-b bg-blue-50"></th>
                                                        <th className="px-2 py-2 border-l border-b bg-green-50 font-normal text-xs text-center">S. Manila</th>
                                                        <th className="px-2 py-2 border-l border-b bg-green-50 font-normal text-xs text-center">C. Pequeña</th>
                                                        <th className="px-2 py-2 border-l border-b bg-green-50 font-normal text-xs text-center">C. Mediana</th>
                                                        <th className="px-2 py-2 border-l border-b bg-green-50 font-normal text-xs text-center">C. Grande</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {routePrices.map((p, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-semibold text-gray-800 text-xs">
                                                                <span className="text-gray-500 font-normal">{p.origin_name}</span> 
                                                                <span className="mx-1 text-gray-300">&rarr;</span> 
                                                                {p.destination_name}
                                                            </td>
                                                            <td className="px-4 py-2 border-l bg-blue-50/30">
                                                                <input type="number" step="0.5" className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto block bg-white" 
                                                                    value={p.ticket_fare ?? ''} onChange={e => updatePriceField(r.id, p.origin_name, p.destination_name, 'ticket_fare', e.target.value)} />
                                                            </td>
                                                            <td className="px-2 py-2 border-l bg-green-50/30">
                                                                <input type="number" step="0.5" className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto block bg-white" 
                                                                    value={p.pkg_fare_sobre_manila ?? ''} onChange={e => updatePriceField(r.id, p.origin_name, p.destination_name, 'pkg_fare_sobre_manila', e.target.value)} />
                                                            </td>
                                                            <td className="px-2 py-2 border-l bg-green-50/30">
                                                                <input type="number" step="0.5" className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto block bg-white" 
                                                                    value={p.pkg_fare_caja_pequena ?? ''} onChange={e => updatePriceField(r.id, p.origin_name, p.destination_name, 'pkg_fare_caja_pequena', e.target.value)} />
                                                            </td>
                                                            <td className="px-2 py-2 border-l bg-green-50/30">
                                                                <input type="number" step="0.5" className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto block bg-white" 
                                                                    value={p.pkg_fare_caja_mediana ?? ''} onChange={e => updatePriceField(r.id, p.origin_name, p.destination_name, 'pkg_fare_caja_mediana', e.target.value)} />
                                                            </td>
                                                            <td className="px-2 py-2 border-l bg-green-50/30">
                                                                <input type="number" step="0.5" className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto block bg-white" 
                                                                    value={p.pkg_fare_caja_grande ?? ''} onChange={e => updatePriceField(r.id, p.origin_name, p.destination_name, 'pkg_fare_caja_grande', e.target.value)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </form>
    );
}
