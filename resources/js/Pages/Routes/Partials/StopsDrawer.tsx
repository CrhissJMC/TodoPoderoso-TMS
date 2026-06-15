interface RouteStop {
    id: number;
    stop_name: string;
    stop_order: number;
    minutes_from_origin: number | null;
    fare_from_origin: string | null;
}

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    estimated_minutes: number | null;
    base_fare: string;
    stops: RouteStop[];
}

interface Props {
    route: Route | null;
    onClose: () => void;
}

function formatMinutes(mins: number | null): string {
    if (!mins) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

export default function StopsDrawer({ route, onClose }: Props) {
    if (!route) return null;

    const allPoints = [
        { label: route.origin, type: 'origin', minutes: null, fare: null },
        ...route.stops.map(s => ({
            label: s.stop_name,
            type: 'stop',
            minutes: s.minutes_from_origin,
            fare: s.fare_from_origin,
        })),
        { label: route.destination, type: 'destination', minutes: route.estimated_minutes, fare: route.base_fare },
    ];

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Paradas de ruta</p>
                        <h3 className="text-base font-semibold text-gray-900">{route.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {allPoints.length - 2 === 0
                                ? 'Sin paradas intermedias'
                                : `${allPoints.length - 2} parada${allPoints.length - 2 !== 1 ? 's' : ''} intermedia${allPoints.length - 2 !== 1 ? 's' : ''}`}
                            {route.estimated_minutes
                                ? ` · ${formatMinutes(route.estimated_minutes)} estimado`
                                : ''}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="relative">
                        {allPoints.map((point, i) => {
                            const isFirst = i === 0;
                            const isLast  = i === allPoints.length - 1;
                            const isStop  = point.type === 'stop';

                            return (
                                <div key={i} className="flex gap-4">
                                    {/* Línea + punto */}
                                    <div className="flex flex-col items-center w-5 flex-shrink-0">
                                        {!isFirst && (
                                            <div className={`w-px flex-none ${isStop ? 'bg-gray-200' : 'bg-gray-300'}`} style={{ height: '16px' }} />
                                        )}
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                                            isFirst ? 'bg-green-500 border-green-500'
                                            : isLast ? 'bg-red-500 border-red-500'
                                            : 'bg-white border-gray-400'
                                        }`} />
                                        {!isLast && (
                                            <div className={`w-px flex-1 ${isStop ? 'bg-gray-200' : 'bg-gray-300'}`} style={{ minHeight: '32px' }} />
                                        )}
                                    </div>

                                    {/* Contenido */}
                                    <div className={`pb-4 flex-1 ${isLast ? 'pb-0' : ''}`}>
                                        <p className={`text-sm font-medium ${isFirst ? 'text-green-700' : isLast ? 'text-red-700' : 'text-gray-800'}`}>
                                            {point.label}
                                        </p>

                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            {point.minutes !== null && (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
                                                    </svg>
                                                    {formatMinutes(point.minutes)}
                                                </span>
                                            )}
                                            {point.fare !== null && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    S/ {parseFloat(point.fare as string).toFixed(2)}
                                                </span>
                                            )}
                                            {isFirst && (
                                                <span className="text-xs text-gray-400">Punto de partida</span>
                                            )}
                                            {isLast && (
                                                <span className="text-xs text-gray-400">Destino final</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumen */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Resumen</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tarifa completa</span>
                            <span className="font-semibold text-gray-900">S/ {parseFloat(route.base_fare).toFixed(2)}</span>
                        </div>
                        {route.estimated_minutes && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Duración estimada</span>
                                <span className="font-medium text-gray-700">{formatMinutes(route.estimated_minutes)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Paradas intermedias</span>
                            <span className="font-medium text-gray-700">{route.stops.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
