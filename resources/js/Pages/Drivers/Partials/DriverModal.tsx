import { useEffect, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';

// ── Interfaces TypeScript ─────────────────────────────────────────────────────

interface DriverModalProps {
    isOpen: boolean;
    driver: any;
    availableVehicles: any[];
    licenseTypes: string[];
    statuses: string[];
    contractTypes: string[];
    onClose: () => void;
}

interface DriverFormData {
    name: string;
    license_number: string;
    license_type: string;
    license_expiry: string;
    phone: string;
    email: string;
    dni: string;
    status: string;
    vehicle_id: string | number;
    contract_type: string;
    rental_fee: string;
    observations: string;
}

const STATUS_LABELS: Record<string, string> = {
    activo: 'Activo',
    en_viaje: 'En viaje',
    inactivo: 'Inactivo',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${error
        ? 'border-red-300 focus:ring-red-200'
        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'
    }`;

// ── Modal ────────────────────────────────────────────────────────────────────

export default function DriverModal({ isOpen, driver, availableVehicles, licenseTypes, statuses, contractTypes, onClose }: DriverModalProps) {
    const isEditing = !!driver;

    // SOLUCIÓN 1: Aquí extraemos 'transform' para que TypeScript lo reconozca
    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<DriverFormData>({
        name: '',
        license_number: '',
        license_type: 'B',
        license_expiry: '',
        phone: '',
        email: '',
        dni: '',
        status: 'activo',
        vehicle_id: '',
        contract_type: 'empleado',
        rental_fee: '',
        observations: '',
    });

    useEffect(() => {
        if (isOpen && driver) {
            setData({
                name: driver.name ?? '',
                license_number: driver.license_number ?? '',
                license_type: driver.license_type ?? 'B',
                license_expiry: driver.license_expiry ? driver.license_expiry.substring(0, 10) : '',
                phone: driver.phone ?? '',
                email: driver.email ?? '',
                dni: driver.dni ?? '',
                status: driver.status ?? 'activo',
                vehicle_id: driver.vehicle_id ?? '',
                contract_type: driver.contract_type ?? 'empleado',
                rental_fee: driver.rental_fee ?? '',
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

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        // SOLUCIÓN 2: Le decimos a TypeScript que currentData es de tipo DriverFormData
        transform((currentData: DriverFormData) => ({
            ...currentData,
            rental_fee: currentData.contract_type === 'alquiler' ? currentData.rental_fee : ''
        }));

        if (isEditing) {
            put(route('drivers.update', driver.id), { onSuccess: handleClose });
        } else {
            post(route('drivers.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 pt-5 pb-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar conductor' : 'Nuevo conductor'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing ? 'Actualiza los datos del conductor.' : 'Completa los datos para registrar un conductor.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-b border-gray-100 mt-4" />

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Datos personales</p>

                    <Field label="Nombre completo" required error={errors.name}>
                        <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej. Juan Carlos Pérez" className={inputCls(errors.name)} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="DNI" error={errors.dni}>
                            <input value={data.dni} onChange={e => setData('dni', e.target.value)} placeholder="12345678" maxLength={20} className={inputCls(errors.dni)} />
                        </Field>
                        <Field label="Teléfono" required error={errors.phone}>
                            <input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="987 654 321" className={inputCls(errors.phone)} />
                        </Field>
                    </div>

                    <Field label="Correo electrónico" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="conductor@ejemplo.com" className={inputCls(errors.email)} />
                    </Field>

                    <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Licencia de conducir</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Número de licencia" required error={errors.license_number}>
                            <input value={data.license_number} onChange={e => setData('license_number', e.target.value.toUpperCase())} placeholder="Q01234567" className={inputCls(errors.license_number)} />
                        </Field>
                        <Field label="Categoría" required error={errors.license_type}>
                            <select value={data.license_type} onChange={e => setData('license_type', e.target.value)} className={inputCls(errors.license_type)}>
                                {licenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Fecha de vencimiento" error={errors.license_expiry}>
                        <input type="date" value={data.license_expiry} onChange={e => setData('license_expiry', e.target.value)} className={inputCls(errors.license_expiry)} />
                    </Field>

                    <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Modalidad y Asignación</p>
                    </div>

                    {/* Contrato y Tarifa */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo de Contrato" required error={errors.contract_type}>
                            <select value={data.contract_type} onChange={e => setData('contract_type', e.target.value)} className={inputCls(errors.contract_type)}>
                                {contractTypes?.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </Field>

                        {data.contract_type === 'alquiler' && (
                            <Field label="Tarifa de Alquiler (S/)" required error={errors.rental_fee}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.rental_fee}
                                    onChange={e => setData('rental_fee', e.target.value)}
                                    placeholder="Ej. 50.00"
                                    className={inputCls(errors.rental_fee)}
                                />
                            </Field>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Vehículo asignado" error={errors.vehicle_id}>
                            <select value={data.vehicle_id} onChange={e => setData('vehicle_id', e.target.value)} className={inputCls(errors.vehicle_id)}>
                                <option value="">Sin asignar</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.plate} — {v.brand}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Estado" required error={errors.status}>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputCls(errors.status)}>
                                {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Observaciones" error={errors.observations}>
                        <textarea value={data.observations} onChange={e => setData('observations', e.target.value)} rows={3} className={`${inputCls(errors.observations)} resize-none`} />
                    </Field>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing ? 'Guardando…' : 'Guardar conductor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}