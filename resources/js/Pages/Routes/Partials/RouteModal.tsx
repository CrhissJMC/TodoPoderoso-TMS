import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Stop {
    stop_name: string;
    minutes_from_origin: string;
    fare_from_origin: string;
}

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
    active: boolean;
    stops: RouteStop[];
}

interface Props {
    isOpen: boolean;
    routeData: Route | null; // CORRECCIÓN: Cambiado de 'route' a 'routeData'
    onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputCls = (error?: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'
    }`;

const emptyStop = (): Stop => ({ stop_name: '', minutes_from_origin: '', fare_from_origin: '' });

// ── Modal ────────────────────────────────────────────────────────────────────

export default function RouteModal({ isOpen, routeData, onClose }: Props) {
    const isEditing = !!routeData;

    // CORRECCIÓN: Agregamos 'transform'
    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<{
        name: string;
        origin: string;
        destination: string;
        estimated_minutes: string;
        base_fare: string;
        active: boolean;
        stops: Stop[];
    }>({
        name: '', origin: '', destination: '',
        estimated_minutes: '', base_fare: '',
        active: true, stops: [],
    });

    useEffect(() => {
        if (isOpen && routeData) {
            setData({
                name: routeData.name,
                origin: routeData.origin,
                destination: routeData.destination,
                estimated_minutes: routeData.estimated_minutes?.toString() ?? '',
                base_fare: routeData.base_fare,
                active: routeData.active,
                stops: routeData.stops.map(s => ({
                    stop_name: s.stop_name,
                    minutes_from_origin: s.minutes_from_origin?.toString() ?? '',
                    fare_from_origin: s.fare_from_origin ?? '',
                })),
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, routeData]); // CORRECCIÓN: Dependencia actualizada

    function handleClose() { reset(); clearErrors(); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // CORRECCIÓN: Forma correcta de filtrar datos con Inertia antes de enviar
        transform((currentData) => ({
            ...currentData,
            stops: currentData.stops.filter(s => s.stop_name.trim())
        }));

        if (isEditing) {
            // AHORA SÍ funcionará 'route()' porque no hay choque de variables
            put(route('routes.update', routeData!.id), { onSuccess: handleClose });
        } else {
            post(route('routes.store'), { onSuccess: handleClose });
        }
    }

    // ── Gestión de paradas ──────────────────────────────────────────────────

    function addStop() {
        setData('stops', [...data.stops, emptyStop()]);
    }

    function removeStop(index: number) {
        setData('stops', data.stops.filter((_, i) => i !== index));
    }

    function updateStop(index: number, field: keyof Stop, value: string) {
        const updated = data.stops.map((s, i) => i === index ? { ...s, [field]: value } : s);
        setData('stops', updated);
    }

    function moveStop(index: number, direction: 'up' | 'down') {
        const arr = [...data.stops];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= arr.length) return;
        [arr[index], arr[target]] = [arr[target], arr[index]];
        setData('stops', arr);
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar ruta' : 'Nueva ruta'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing ? 'Modifica los datos y las paradas.' : 'Define el trayecto, tarifa y paradas intermedias.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* Nombre */}
                        <Field label="Nombre de la ruta" required error={errors.name}>
                            <input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Ej. Chachapoyas - Bagua Grande"
                                className={inputCls(errors.name)}
                            />
                        </Field>

                        {/* Origen + Destino */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Origen" required error={errors.origin}>
                                <input
                                    value={data.origin}
                                    onChange={e => setData('origin', e.target.value)}
                                    placeholder="Chachapoyas"
                                    className={inputCls(errors.origin)}
                                />
                            </Field>
                            <Field label="Destino" required error={errors.destination}>
                                <input
                                    value={data.destination}
                                    onChange={e => setData('destination', e.target.value)}
                                    placeholder="Bagua Grande"
                                    className={inputCls(errors.destination)}
                                />
                            </Field>
                        </div>

                        {/* Duración + Tarifa */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Duración estimada (min)" error={errors.estimated_minutes}>
                                <input
                                    type="number"
                                    value={data.estimated_minutes}
                                    onChange={e => setData('estimated_minutes', e.target.value)}
                                    placeholder="90"
                                    min="1"
                                    className={inputCls(errors.estimated_minutes)}
                                />
                            </Field>
                            <Field label="Tarifa base (S/)" required error={errors.base_fare}>
                                <input
                                    type="number"
                                    value={data.base_fare}
                                    onChange={e => setData('base_fare', e.target.value)}
                                    placeholder="25.00"
                                    min="0"
                                    step="0.50"
                                    className={inputCls(errors.base_fare)}
                                />
                            </Field>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Ruta activa</p>
                                <p className="text-xs text-gray-500">Las rutas inactivas no aparecen en horarios ni ventas</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('active', !data.active)}
                                className={`relative w-10 h-5.5 rounded-full transition-colors focus:outline-none ${data.active ? 'bg-green-500' : 'bg-gray-300'}`}
                                style={{ height: '22px', width: '40px' }}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${data.active ? 'translate-x-[18px]' : 'translate-x-0'}`}
                                    style={{ width: '18px', height: '18px' }}
                                />
                            </button>
                        </div>

                        {/* ── Sección Paradas ── */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Paradas intermedias</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Opcional — define dónde pueden subir/bajar pasajeros</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addStop}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Agregar parada
                                </button>
                            </div>

                            {/* Timeline de paradas */}
                            <div className="space-y-0">
                                {/* Origen (fijo) */}
                                <TimelineNode label={data.origin || 'Origen'} type="origin" />

                                {/* Paradas dinámicas */}
                                {data.stops.map((stop, i) => (
                                    <TimelineStop
                                        key={i}
                                        index={i}
                                        stop={stop}
                                        total={data.stops.length}
                                        errors={errors}
                                        onChange={(field, val) => updateStop(i, field, val)}
                                        onRemove={() => removeStop(i)}
                                        onMove={(dir) => moveStop(i, dir)}
                                    />
                                ))}

                                {/* Destino (fijo) */}
                                <TimelineNode label={data.destination || 'Destino'} type="destination" />
                            </div>

                            {data.stops.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-3">
                                    Sin paradas — el viaje irá directo de origen a destino.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer fijo */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0 bg-white rounded-b-2xl">
                        <button type="button" onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing
                                ? (isEditing ? 'Guardando…' : 'Creando…')
                                : (isEditing ? 'Guardar cambios' : 'Crear ruta')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Sub-componentes del timeline ─────────────────────────────────────────────

function TimelineNode({ label, type }: { label: string; type: 'origin' | 'destination' }) {
    const isOrigin = type === 'origin';
    return (
        <div className="flex items-center gap-3 py-1.5">
            <div className="flex flex-col items-center w-6 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full border-2 ${isOrigin ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`} />
                {isOrigin && <div className="w-0.5 bg-gray-200 flex-1 mt-1" style={{ minHeight: '12px' }} />}
            </div>
            <span className={`text-sm font-medium ${label ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                {label || (isOrigin ? 'Origen' : 'Destino')}
            </span>
            <span className="text-xs text-gray-400 ml-auto">{isOrigin ? 'Salida' : 'Llegada'}</span>
        </div>
    );
}

function TimelineStop({ index, stop, total, errors, onChange, onRemove, onMove }: {
    index: number;
    stop: Stop;
    total: number;
    errors: Record<string, string>;
    onChange: (field: keyof Stop, value: string) => void;
    onRemove: () => void;
    onMove: (dir: 'up' | 'down') => void;
}) {
    return (
        <div className="flex gap-3">
            {/* Línea vertical + punto */}
            <div className="flex flex-col items-center w-6 flex-shrink-0">
                <div className="w-0.5 bg-gray-200" style={{ minHeight: '12px' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white ring-1 ring-gray-300 flex-shrink-0" />
                <div className="w-0.5 bg-gray-200 flex-1 mt-1" style={{ minHeight: '12px' }} />
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-2 pt-1">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">Parada {index + 1}</span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => onMove('up')} disabled={index === 0}
                                className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                            </button>
                            <button type="button" onClick={() => onMove('down')} disabled={index === total - 1}
                                className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            <button type="button" onClick={onRemove}
                                className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <input
                        value={stop.stop_name}
                        onChange={e => onChange('stop_name', e.target.value)}
                        placeholder="Nombre de la parada"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Minutos desde origen</label>
                            <input
                                type="number"
                                value={stop.minutes_from_origin}
                                onChange={e => onChange('minutes_from_origin', e.target.value)}
                                placeholder="45"
                                min="1"
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Tarifa hasta aquí (S/)</label>
                            <input
                                type="number"
                                value={stop.fare_from_origin}
                                onChange={e => onChange('fare_from_origin', e.target.value)}
                                placeholder="15.00"
                                min="0"
                                step="0.50"
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}