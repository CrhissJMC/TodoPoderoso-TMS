import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

const inputClass = (error?: string) =>
    `w-full px-4 py-2 text-sm border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 outline-none transition-shadow ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-gray-400'
    }`;

function Field({ label, error, children }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
            {children}
            {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
        </div>
    );
}

export default function DriverModal({ isOpen, driver, statuses, licenseTypes, contractTypes, availableVehicles, onClose, onOpenNewVehicle }: any) {
    const isEditing = !!driver;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        dni: '',
        phone: '',
        email: '',
        license_number: '',
        license_type: licenseTypes[0] || 'A-I',
        license_expiry: '',
        contract_type: contractTypes[0] || 'Tercero',
        rental_fee: '',
        vehicle_id: '',
        status: 'activo',
        observations: '',
    });

    useEffect(() => {
        if (isOpen && driver) {
            setData({
                name: driver.name ?? '',
                dni: driver.dni ?? '',
                phone: driver.phone ?? '',
                email: driver.email ?? '',
                license_number: driver.license_number ?? '',
                license_type: driver.license_type ?? licenseTypes[0],
                license_expiry: driver.license_expiry ?? '',
                contract_type: driver.contract_type ?? contractTypes[0],
                rental_fee: driver.rental_fee ?? '',
                vehicle_id: driver.vehicle_id ?? '',
                status: driver.status ?? 'activo',
                observations: driver.observations ?? '',
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, driver]);

    function handleClose() {
        reset();
        clearErrors();
        onClose();
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        if (isEditing) {
            put(route('drivers.update', driver.id), { onSuccess: handleClose });
        } else {
            post(route('drivers.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900">
                        {isEditing ? 'Editar conductor' : 'Nuevo conductor'}
                    </h3>
                    <button type="button" onClick={handleClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                    {/* Datos Personales */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 border-b pb-1">DATOS PERSONALES</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nombre completo *" error={errors.name}>
                                <input value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass(errors.name)} />
                            </Field>
                            <Field label="DNI *" error={errors.dni}>
                                <input
                                    value={data.dni}
                                    onChange={e => {
                                        // MAGIA RECUPERADA: Solo acepta números, máx 8, y lo copia a la licencia si no se está editando
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                        setData(prev => ({
                                            ...prev,
                                            dni: val,
                                            // Solo autocompleta la licencia si es un registro nuevo o si están vacíos
                                            license_number: !isEditing ? val : prev.license_number
                                        }));
                                    }}
                                    maxLength={8}
                                    className={inputClass(errors.dni)}
                                />
                            </Field>
                            <Field label="Teléfono *" error={errors.phone}>
                                <input value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputClass(errors.phone)} />
                            </Field>
                            <Field label="Correo (Opcional)" error={errors.email}>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClass(errors.email)} />
                            </Field>
                        </div>
                    </div>

                    {/* Licencia */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 border-b pb-1">LICENCIA DE CONDUCIR</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="N° Licencia *" error={errors.license_number}>
                                <input value={data.license_number} onChange={e => setData('license_number', e.target.value.toUpperCase())} className={inputClass(errors.license_number)} />
                            </Field>
                            <Field label="Categoría *" error={errors.license_type}>
                                <select value={data.license_type} onChange={e => setData('license_type', e.target.value)} className={inputClass(errors.license_type)}>
                                    {licenseTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Vencimiento" error={errors.license_expiry}>
                                <input type="date" value={data.license_expiry} onChange={e => setData('license_expiry', e.target.value)} className={inputClass(errors.license_expiry)} />
                            </Field>
                        </div>
                    </div>

                    {/* Contrato y Asignación SIEMPRE VISIBLE */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 border-b pb-1">CONTRATO Y ASIGNACIÓN</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Tipo de Contrato *" error={errors.contract_type}>
                                <select value={data.contract_type} onChange={e => setData('contract_type', e.target.value)} className={inputClass(errors.contract_type)}>
                                    {contractTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Estado *" error={errors.status}>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass(errors.status)}>
                                    {statuses.map((s: string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Selector de vehículos restaurado para todos */}
                        <div className="mt-4 flex gap-2 items-end">
                            <div className="flex-1">
                                <Field label="Vehículo Asignado" error={errors.vehicle_id}>
                                    <select
                                        value={data.vehicle_id}
                                        onChange={e => setData('vehicle_id', e.target.value)}
                                        className={inputClass(errors.vehicle_id)}
                                    >
                                        <option value="">Sin vehículo asignado...</option>
                                        {availableVehicles.map((v: any) => (
                                            <option key={v.id} value={v.id}>
                                                {v.plate} - {v.brand} {v.model}
                                            </option>
                                        ))}
                                        {/* Conserva el actual si se está editando */}
                                        {isEditing && driver.vehicle && !availableVehicles.find((v: any) => v.id === driver.vehicle_id) && (
                                            <option value={driver.vehicle.id}>
                                                {driver.vehicle.plate} - {driver.vehicle.brand} (Actual)
                                            </option>
                                        )}
                                    </select>
                                </Field>
                            </div>
                            <button
                                type="button"
                                onClick={onOpenNewVehicle}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm h-[38px]"
                            >
                                + Nuevo vehículo
                            </button>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-4">
                        <Field label="Observaciones (Opcional)" error={errors.observations}>
                            <textarea
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                className={inputClass(errors.observations)}
                                rows={2}
                            />
                        </Field>
                    </div>

                    {/* Footer / Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm">
                            {processing ? (isEditing ? 'Guardando…' : 'Registrando…') : (isEditing ? 'Guardar cambios' : 'Registrar conductor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}