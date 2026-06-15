import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

interface ActiveTrip { id: number; label: string; status: string; route_name: string; }
interface PackageItem {
    id: number; sender_name: string; receiver_name: string; origin: string; destination: string;
    trip_id: number | null; package_type: string; weight: string | null; dimensions: string | null;
    price: string; payment_method: string; payment_status: string; observations: string | null;
}
interface Props {
    isOpen: boolean;
    pkg: PackageItem | null;
    activeTrips: ActiveTrip[];
    packageTypes: string[];
    paymentMethods: string[];
    paymentStatuses: string[];
    onClose: () => void;
}

const TYPE_LABELS: Record<string, string>    = { sobre_manila: 'Sobre manila', caja: 'Caja' };
const METHOD_LABELS: Record<string, string>  = { efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta' };
const PSTATUS_LABELS: Record<string, string> = { pagado: 'Pagado', pendiente: 'Pendiente' };

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

export default function PackageModal({ isOpen, pkg, activeTrips, packageTypes, paymentMethods, paymentStatuses, onClose }: Props) {
    const isEditing = !!pkg;
    const [showBoxFields, setShowBoxFields] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        sender_name:    '',
        receiver_name:  '',
        origin:         '',
        destination:    '',
        trip_id:        '',
        package_type:   'sobre_manila',
        weight:         '',
        dimensions:     '',
        price:          '',
        payment_method: 'efectivo',
        payment_status: 'pagado',
        observations:   '',
    });

    useEffect(() => {
        if (isOpen && pkg) {
            const d = {
                sender_name:    pkg.sender_name,
                receiver_name:  pkg.receiver_name,
                origin:         pkg.origin,
                destination:    pkg.destination,
                trip_id:        pkg.trip_id?.toString() ?? '',
                package_type:   pkg.package_type,
                weight:         pkg.weight ?? '',
                dimensions:     pkg.dimensions ?? '',
                price:          pkg.price,
                payment_method: pkg.payment_method,
                payment_status: pkg.payment_status,
                observations:   pkg.observations ?? '',
            };
            setData(d);
            setShowBoxFields(pkg.package_type === 'caja');
        } else if (isOpen) {
            reset();
            clearErrors();
            setShowBoxFields(false);
        }
    }, [isOpen, pkg]);

    function handleTypeChange(type: string) {
        setData('package_type', type);
        setShowBoxFields(type === 'caja');
        if (type === 'sobre_manila') {
            setData(d => ({ ...d, package_type: type, weight: '', dimensions: '' }));
        } else {
            setData('package_type', type);
        }
    }

    function handleClose() { reset(); clearErrors(); setShowBoxFields(false); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('packages.update', pkg!.id), { onSuccess: handleClose });
        } else {
            post(route('packages.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar encomienda' : 'Nueva encomienda'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing ? 'Modifica los datos del paquete.' : 'Registra un paquete y asígnalo a un viaje.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* Tipo de paquete */}
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tipo de paquete<span className="text-red-500 ml-0.5">*</span></p>
                            <div className="grid grid-cols-2 gap-3">
                                {packageTypes.map(t => (
                                    <button key={t} type="button" onClick={() => handleTypeChange(t)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${data.package_type === t ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${data.package_type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {t === 'sobre_manila' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"/></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-medium ${data.package_type === t ? 'text-gray-900' : 'text-gray-600'}`}>{TYPE_LABELS[t]}</p>
                                            <p className="text-xs text-gray-400">{t === 'sobre_manila' ? 'Documentos, cartas' : 'Peso y dimensiones'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campos extra si es caja */}
                        {showBoxFields && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Field label="Peso (kg)" error={errors.weight}>
                                    <input type="number" value={data.weight} onChange={e => setData('weight', e.target.value)}
                                        placeholder="2.5" min="0.01" step="0.01" className={inputCls(errors.weight)} />
                                </Field>
                                <Field label="Dimensiones" error={errors.dimensions}>
                                    <input value={data.dimensions} onChange={e => setData('dimensions', e.target.value)}
                                        placeholder="20x30x15 cm" className={inputCls(errors.dimensions)} />
                                </Field>
                            </div>
                        )}

                        {/* Remitente / Destinatario */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Personas</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Remitente" required error={errors.sender_name}>
                                <input value={data.sender_name} onChange={e => setData('sender_name', e.target.value)}
                                    placeholder="Quien envía" className={inputCls(errors.sender_name)} />
                            </Field>
                            <Field label="Destinatario" required error={errors.receiver_name}>
                                <input value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)}
                                    placeholder="Quien recibe" className={inputCls(errors.receiver_name)} />
                            </Field>
                        </div>

                        {/* Ruta */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ruta</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Origen" required error={errors.origin}>
                                <input value={data.origin} onChange={e => setData('origin', e.target.value)}
                                    placeholder="Chachapoyas" className={inputCls(errors.origin)} />
                            </Field>
                            <Field label="Destino" required error={errors.destination}>
                                <input value={data.destination} onChange={e => setData('destination', e.target.value)}
                                    placeholder="Bagua Grande" className={inputCls(errors.destination)} />
                            </Field>
                        </div>

                        <Field label="Asignar a viaje" error={errors.trip_id}>
                            <select value={data.trip_id} onChange={e => setData('trip_id', e.target.value)}
                                className={inputCls(errors.trip_id)}>
                                <option value="">Sin asignar (registrar como recibido)</option>
                                {activeTrips.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-0.5">Solo viajes activos de hoy en adelante</p>
                        </Field>

                        {/* Cobro */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Cobro</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Precio (S/)" required error={errors.price}>
                                <input type="number" value={data.price} onChange={e => setData('price', e.target.value)}
                                    placeholder="10.00" min="0" step="0.50" className={inputCls(errors.price)} />
                            </Field>
                            <Field label="Método de pago" required error={errors.payment_method}>
                                <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}
                                    className={inputCls(errors.payment_method)}>
                                    {paymentMethods.map(m => <option key={m} value={m}>{METHOD_LABELS[m] ?? m}</option>)}
                                </select>
                            </Field>
                            <Field label="Estado pago" required error={errors.payment_status}>
                                <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)}
                                    className={inputCls(errors.payment_status)}>
                                    {paymentStatuses.map(s => <option key={s} value={s}>{PSTATUS_LABELS[s] ?? s}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Observaciones" error={errors.observations}>
                            <textarea value={data.observations} onChange={e => setData('observations', e.target.value)}
                                placeholder="Descripción del contenido, instrucciones de entrega…"
                                rows={2} className={`${inputCls(errors.observations)} resize-none`} />
                        </Field>
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
                                ? (isEditing ? 'Guardando…' : 'Registrando…')
                                : (isEditing ? 'Guardar cambios' : 'Registrar encomienda')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
