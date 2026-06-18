import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Route   { id: number; name: string; origin: string; destination: string; base_fare: string; }
interface Vehicle { id: number; plate: string; brand: string; model: string; sellable_seats: number; }
interface Driver  { id: number; name: string; license_number: string; }

interface Schedule {
    id: number;
    route_id: number;
    vehicle_id: number | null;
    driver_id: number | null;
    departure_time: string;
    days_of_week: string;
    active: boolean;
}

interface Props {
    isOpen: boolean;
    schedule: Schedule | null;
    routes: Route[];
    vehicles: Vehicle[];
    drivers: Driver[];
    onClose: () => void;
}

// ── Constantes ───────────────────────────────────────────────────────────────

const DAYS = [
    { value: 1, short: 'L',  label: 'Lunes'     },
    { value: 2, short: 'M',  label: 'Martes'    },
    { value: 3, short: 'X',  label: 'Miércoles' },
    { value: 4, short: 'J',  label: 'Jueves'    },
    { value: 5, short: 'V',  label: 'Viernes'   },
    { value: 6, short: 'S',  label: 'Sábado'    },
    { value: 7, short: 'D',  label: 'Domingo'   },
];

const PRESETS = [
    { label: 'L–V',    days: [1,2,3,4,5]   },
    { label: 'L–S',    days: [1,2,3,4,5,6] },
    { label: 'Diario', days: [1,2,3,4,5,6,7] },
    { label: 'Fin de semana', days: [6,7]  },
];

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
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
        error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'
    }`;

// ── Modal ────────────────────────────────────────────────────────────────────

export default function ScheduleModal({ isOpen, schedule, routes, vehicles, drivers, onClose }: Props) {
    const isEditing = !!schedule;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        route_id:       string;
        vehicle_id:     string;
        driver_id:      string;
        departure_time: string;
        days_of_week:   number[];
        active:         boolean;
    }>({
        route_id: '', vehicle_id: '', driver_id: '',
        departure_time: '', days_of_week: [1,2,3,4,5], active: true,
    });

    useEffect(() => {
        if (isOpen && schedule) {
            setData({
                route_id:       schedule.route_id?.toString()  ?? '',
                vehicle_id:     schedule.vehicle_id?.toString() ?? '',
                driver_id:      schedule.driver_id?.toString()  ?? '',
                departure_time: schedule.departure_time?.substring(0, 5) ?? '',
                days_of_week:   schedule.days_of_week.split(',').map(Number),
                active:         schedule.active,
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, schedule]);

    function handleClose() { reset(); clearErrors(); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('schedules.update', schedule!.id), { onSuccess: handleClose });
        } else {
            post(route('schedules.store'), { onSuccess: handleClose });
        }
    }

    function toggleDay(day: number) {
        const current = data.days_of_week;
        const next = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day].sort((a, b) => a - b);
        setData('days_of_week', next);
    }

    function applyPreset(days: number[]) {
        setData('days_of_week', days);
    }

    const selectedVehicle = vehicles.find(v => v.id.toString() === data.vehicle_id);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar horario' : 'Nuevo horario'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Asigna ruta, vehículo, conductor y días de operación.
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Form scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* Sección: Ruta y hora */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trayecto</p>

                        <Field label="Ruta" required error={errors.route_id}>
                            <select
                                value={data.route_id}
                                onChange={e => setData('route_id', e.target.value)}
                                className={inputCls(errors.route_id)}
                            >
                                <option value="">Selecciona una ruta…</option>
                                {routes.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} — S/ {parseFloat(r.base_fare).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Hora de salida" required error={errors.departure_time}>
                            <input
                                type="time"
                                value={data.departure_time}
                                onChange={e => setData('departure_time', e.target.value)}
                                className={inputCls(errors.departure_time)}
                            />
                        </Field>

                        {/* Sección: Asignación */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Asignación</p>
                        </div>

                        <Field label="Vehículo" error={errors.vehicle_id}>
                            <select
                                value={data.vehicle_id}
                                onChange={e => setData('vehicle_id', e.target.value)}
                                className={inputCls(errors.vehicle_id)}
                            >
                                <option value="">Sin asignar</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.plate} — {v.brand} {v.model} ({v.sellable_seats} asientos)
                                    </option>
                                ))}
                            </select>
                            {selectedVehicle && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                                    </svg>
                                    Capacidad vendible: {selectedVehicle.sellable_seats} pasajeros
                                </p>
                            )}
                        </Field>

                        <Field label="Conductor" error={errors.driver_id}>
                            <select
                                value={data.driver_id}
                                onChange={e => setData('driver_id', e.target.value)}
                                className={inputCls(errors.driver_id)}
                            >
                                <option value="">Sin asignar</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} — Lic. {d.license_number}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Sección: Días */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                Días de operación<span className="text-red-500 ml-0.5">*</span>
                            </p>
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map(p => {
                                const active = JSON.stringify(p.days) === JSON.stringify(data.days_of_week);
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p.days)}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                                            active
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selector de días */}
                        <div>
                            <div className="flex gap-1.5">
                                {DAYS.map(d => {
                                    const selected = data.days_of_week.includes(d.value);
                                    const isWeekend = d.value >= 6;
                                    return (
                                        <button
                                            key={d.value}
                                            type="button"
                                            title={d.label}
                                            onClick={() => toggleDay(d.value)}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                                selected
                                                    ? isWeekend
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {d.short}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.days_of_week && (
                                <p className="text-xs text-red-500 mt-1">{errors.days_of_week}</p>
                            )}
                            {data.days_of_week.length > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Opera los: {data.days_of_week.map(d => DAYS.find(x => x.value === d)?.label).join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Estado */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Horario activo</p>
                                <p className="text-xs text-gray-500">Los horarios inactivos no generan viajes</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('active', !data.active)}
                                className={`relative rounded-full transition-colors focus:outline-none ${data.active ? 'bg-green-500' : 'bg-gray-300'}`}
                                style={{ width: '40px', height: '22px' }}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform ${data.active ? 'translate-x-[18px]' : 'translate-x-0'}`}
                                    style={{ width: '18px', height: '18px' }}
                                />
                            </button>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-white rounded-b-2xl flex-shrink-0">
                        <button type="button" onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing
                                ? (isEditing ? 'Guardando…' : 'Creando…')
                                : (isEditing ? 'Guardar cambios' : 'Crear horario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
