import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

const TYPE_LABELS: Record<string, string> = {
    Auto: 'Auto', Minivan: 'Minivan', Bus: 'Bus', Otro: 'Otro',
};

const STATUS_LABELS: Record<string, string> = {
    disponible: 'Disponible', en_ruta: 'En ruta', mantenimiento: 'Mantenimiento', inactivo: 'Inactivo'
};

export default function VehicleModal({ isOpen, vehicle, types, statuses, onClose }: any) {
    const isEditing = !!vehicle;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        plate: '',
        brand: '',
        model: '',
        year: '',
        capacity_seats: '',
        sellable_seats: '',
        type: 'Minivan',
        status: 'disponible',
        color: '',
        observations: '',
    });

    useEffect(() => {
        if (isOpen && vehicle) {
            setData({
                plate: vehicle.plate ?? '',
                brand: vehicle.brand ?? '',
                model: vehicle.model ?? '',
                year: vehicle.year ?? '',
                capacity_seats: vehicle.capacity_seats ?? '',
                sellable_seats: vehicle.sellable_seats ?? '',
                type: vehicle.type ?? 'Minivan',
                status: vehicle.status ?? 'disponible',
                color: vehicle.color ?? '',
                observations: vehicle.observations ?? '',
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, vehicle]);

    function handleClose() {
        reset();
        clearErrors();
        onClose();
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        if (isEditing) {
            put(route('vehicles.update', vehicle.id), { onSuccess: handleClose });
        } else {
            post(route('vehicles.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" role="dialog" aria-modal="true">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Editar vehículo' : 'Nuevo vehículo'}
                    </h3>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Cerrar">
                        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                    {/* Fila 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Placa *" error={errors.plate}>
                            <input
                                value={data.plate}
                                onChange={e => setData('plate', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} // Bloquea caracteres no peruanos
                                placeholder="ABC-123"
                                maxLength={8}
                                className={inputClass(errors.plate)}
                            />
                        </Field>
                        <Field label="Tipo de vehículo *" error={errors.type}>
                            <select value={data.type} onChange={e => setData('type', e.target.value)} className={inputClass(errors.type)}>
                                {types.map((t: string) => (
                                    <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Fila 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Marca *" error={errors.brand}>
                            <input value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Ej. Toyota" className={inputClass(errors.brand)} />
                        </Field>
                        <Field label="Modelo *" error={errors.model}>
                            <input value={data.model} onChange={e => setData('model', e.target.value)} placeholder="Ej. Hiace" className={inputClass(errors.model)} />
                        </Field>
                    </div>

                    {/* Fila 3: Asientos (Asegurados a solo números) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Asientos Físicos Totales *" error={errors.capacity_seats}>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                value={data.capacity_seats}
                                onChange={e => setData('capacity_seats', e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Ej. 15"
                                className={inputClass(errors.capacity_seats)}
                            />
                        </Field>
                        <Field label="Asientos Vendibles (Para pasajeros) *" error={errors.sellable_seats}>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                value={data.sellable_seats}
                                onChange={e => setData('sellable_seats', e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Ej. 14"
                                className={inputClass(errors.sellable_seats)}
                            />
                        </Field>
                    </div>

                    {/* Fila 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field label="Año" error={errors.year}>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={data.year}
                                onChange={e => setData('year', e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="2024"
                                className={inputClass(errors.year)}
                            />
                        </Field>
                        <Field label="Color" error={errors.color}>
                            <input value={data.color} onChange={e => setData('color', e.target.value)} placeholder="Blanco" className={inputClass(errors.color)} />
                        </Field>
                        <Field label="Estado *" error={errors.status}>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass(errors.status)}>
                                {statuses.map((s: string) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Observaciones */}
                    <Field label="Observaciones" error={errors.observations}>
                        <textarea
                            value={data.observations}
                            onChange={e => setData('observations', e.target.value)}
                            placeholder="Notas adicionales..."
                            rows={3}
                            className={inputClass(errors.observations)}
                        />
                    </Field>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                            {processing ? (isEditing ? 'Guardando…' : 'Registrando…') : (isEditing ? 'Guardar cambios' : 'Registrar vehículo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Componentes de apoyo ─────────────────────────────────────────────────────

function Field({ label, error, children }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            {children}
            {error && <span className="text-xs text-red-500 dark:text-red-400 font-medium mt-0.5">{error}</span>}
        </div>
    );
}

function inputClass(error: string | undefined) {
    return `w-full px-4 py-2.5 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 outline-none transition-shadow ${error
        ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
        }`;
}