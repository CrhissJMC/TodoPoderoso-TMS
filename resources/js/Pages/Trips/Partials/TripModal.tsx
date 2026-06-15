import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

interface Route   { id: number; name: string; origin: string; destination: string; base_fare: string; }
interface Vehicle { id: number; plate: string; brand: string; model: string; sellable_seats: number; }
interface Driver  { id: number; name: string; license_number: string; }
interface Trip    { id: number; route_id: number; vehicle_id: number|null; driver_id: number|null; trip_date: string; observations: string|null; }

interface Props {
    isOpen: boolean;
    trip: Trip | null;
    routes: Route[];
    vehicles: Vehicle[];
    drivers: Driver[];
    onClose: () => void;
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
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
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'}`;

export default function TripModal({ isOpen, trip, routes, vehicles, drivers, onClose }: Props) {
    const isEditing = !!trip;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        route_id:     '',
        vehicle_id:   '',
        driver_id:    '',
        trip_date:    new Date().toISOString().split('T')[0],
        observations: '',
    });

    useEffect(() => {
        if (isOpen && trip) {
            setData({
                route_id:     trip.route_id?.toString() ?? '',
                vehicle_id:   trip.vehicle_id?.toString() ?? '',
                driver_id:    trip.driver_id?.toString() ?? '',
                trip_date:    trip.trip_date ?? '',
                observations: trip.observations ?? '',
            });
        } else if (isOpen) {
            reset();
            clearErrors();
            setData(d => ({ ...d, trip_date: new Date().toISOString().split('T')[0] }));
        }
    }, [isOpen, trip]);

    function handleClose() { reset(); clearErrors(); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('trips.update', trip!.id), { onSuccess: handleClose });
        } else {
            post(route('trips.store'), { onSuccess: handleClose });
        }
    }

    const selectedVehicle = vehicles.find(v => v.id.toString() === data.vehicle_id);
    const selectedRoute   = routes.find(r => r.id.toString() === data.route_id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">{isEditing ? 'Editar viaje' : 'Nuevo viaje'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing ? 'Modifica los datos del viaje.' : 'Programa un viaje manual o complementario.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trayecto</p>

                        <Field label="Ruta" required error={errors.route_id}>
                            <select value={data.route_id} onChange={e => setData('route_id', e.target.value)} className={inputCls(errors.route_id)}>
                                <option value="">Selecciona una ruta…</option>
                                {routes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} — S/ {parseFloat(r.base_fare).toFixed(2)}</option>
                                ))}
                            </select>
                        </Field>

                        {selectedRoute && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159-.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
                                <span>{selectedRoute.origin}</span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                <span>{selectedRoute.destination}</span>
                                <span className="ml-auto font-medium text-gray-900">S/ {parseFloat(selectedRoute.base_fare).toFixed(2)}</span>
                            </div>
                        )}

                        <Field label="Fecha del viaje" required error={errors.trip_date}>
                            <input type="date" value={data.trip_date} onChange={e => setData('trip_date', e.target.value)} className={inputCls(errors.trip_date)} />
                        </Field>

                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Asignación</p>
                        </div>

                        <Field label="Vehículo" error={errors.vehicle_id}>
                            <select value={data.vehicle_id} onChange={e => setData('vehicle_id', e.target.value)} className={inputCls(errors.vehicle_id)}>
                                <option value="">Sin asignar</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model} ({v.sellable_seats} asientos)</option>
                                ))}
                            </select>
                            {selectedVehicle && (
                                <p className="text-xs text-gray-500 mt-1">Capacidad vendible: <span className="font-medium">{selectedVehicle.sellable_seats} pasajeros</span></p>
                            )}
                        </Field>

                        <Field label="Conductor" error={errors.driver_id}>
                            <select value={data.driver_id} onChange={e => setData('driver_id', e.target.value)} className={inputCls(errors.driver_id)}>
                                <option value="">Sin asignar</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} — Lic. {d.license_number}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Observaciones" error={errors.observations}>
                            <textarea value={data.observations} onChange={e => setData('observations', e.target.value)}
                                placeholder="Notas adicionales…" rows={3}
                                className={`${inputCls(errors.observations)} resize-none`} />
                        </Field>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-white rounded-b-2xl flex-shrink-0">
                        <button type="button" onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing ? (isEditing ? 'Guardando…' : 'Creando…') : (isEditing ? 'Guardar cambios' : 'Crear viaje')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
