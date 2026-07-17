import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

interface ActiveTrip { id: number; label: string; status: string; route_name: string; locations: string[]; }
interface PackageItem {
    id: number;
    sender: { name: string; document_number: string; document_type: string; phone: string | null };
    receiver: { name: string; document_number: string; document_type: string; phone: string | null };
    origin: string; destination: string;
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
    locations: string[];
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

export default function PackageModal({ isOpen, pkg, activeTrips, packageTypes, paymentMethods, paymentStatuses, locations, onClose }: Props) {
    const isEditing = !!pkg;
    const [senderLookup, setSenderLookup] = useState<'idle' | 'searching' | 'found' | 'new'>('idle');
    const [receiverLookup, setReceiverLookup] = useState<'idle' | 'searching' | 'found' | 'new'>('idle');
    const [showDimensions, setShowDimensions] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        sender_id:              '',
        sender_document_type:   'DNI',
        sender_document_number: '',
        sender_name:            '',
        sender_phone:           '',

        receiver_id:              '',
        receiver_document_type:   'DNI',
        receiver_document_number: '',
        receiver_name:            '',
        receiver_phone:           '',

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
                sender_id:              '',
                sender_document_type:   pkg.sender.document_type,
                sender_document_number: pkg.sender.document_number,
                sender_name:            pkg.sender.name,
                sender_phone:           pkg.sender.phone ?? '',

                receiver_id:              '',
                receiver_document_type:   pkg.receiver.document_type,
                receiver_document_number: pkg.receiver.document_number,
                receiver_name:            pkg.receiver.name,
                receiver_phone:           pkg.receiver.phone ?? '',

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
            setSenderLookup('found');
            setReceiverLookup('found');
        } else if (isOpen) {
            reset();
            clearErrors();
            setShowBoxFields(false);
            setSenderLookup('idle');
            setReceiverLookup('idle');
        }
    }, [isOpen, pkg]);

    useEffect(() => {
        if (!hasAdmin && !pkg) { // Solo autocalcular si no es admin y es nueva encomienda (no edición)
            let base = 0;
            switch (data.package_type) {
                case 'sobre_manila': base = 5; break;
                case 'caja_pequena': base = 10; break;
                case 'caja_mediana': base = 15; break;
                case 'caja_grande': base = 20; break;
            }
            if (data.weight && data.package_type !== 'sobre_manila') {
                 const w = parseFloat(data.weight);
                 if (w > 0) base += w * 0.50; // Ejemplo: 0.50 soles por kg adicional
            }
            if (base > 0) {
                setData('price', base.toFixed(2));
            }
        }
    }, [data.package_type, data.weight, hasAdmin, pkg]);

    function handleTypeChange(type: string) {
        setData('package_type', type);
        setShowDimensions(type.includes('caja'));
        if (type === 'sobre_manila') {
            setData(d => ({ ...d, package_type: type, dimensions: '' }));
        } else {
            setData('package_type', type);
        }
    }

    async function handleDocBlur(type: 'sender' | 'receiver') {
        const docNumber = type === 'sender' ? data.sender_document_number : data.receiver_document_number;
        const setLookup = type === 'sender' ? setSenderLookup : setReceiverLookup;

        if (docNumber.length < 5) return;
        setLookup('searching');
        try {
            const res = await fetch(route('clients.searchByDocument'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ document_number: docNumber })
            });
            const json = await res.json();
            if (json.success && json.client) {
                if (type === 'sender') {
                    setData(d => ({
                        ...d,
                        sender_id: json.client.id,
                        sender_name: json.client.name,
                        sender_document_type: json.client.document_type,
                        sender_phone: json.client.phone ?? '',
                    }));
                } else {
                    setData(d => ({
                        ...d,
                        receiver_id: json.client.id,
                        receiver_name: json.client.name,
                        receiver_document_type: json.client.document_type,
                        receiver_phone: json.client.phone ?? '',
                    }));
                }
                setLookup('found');
            } else {
                if (type === 'sender') setData(d => ({ ...d, sender_id: '' }));
                else setData(d => ({ ...d, receiver_id: '' }));
                setLookup('new');
            }
        } catch {
            setLookup('idle');
        }
    }

    function handleClose() {
        reset(); clearErrors(); setShowBoxFields(false);
        setSenderLookup('idle'); setReceiverLookup('idle');
        onClose();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('packages.update', pkg!.id), { onSuccess: handleClose });
        } else {
            post(route('packages.store'), { onSuccess: handleClose });
        }
    }

    const availableTrips = activeTrips.filter(t => {
        if (!data.origin || !data.destination) return true;
        const oIdx = t.locations.indexOf(data.origin);
        const dIdx = t.locations.indexOf(data.destination);
        return oIdx !== -1 && dIdx !== -1 && oIdx < dIdx;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

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
                    <button type="button" onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* Remitente / Destinatario */}
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* REMITENTE */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Remitente</p>

                                <div className="grid grid-cols-3 gap-2">
                                    <Field label="Doc." required error={errors.sender_document_type}>
                                        <select value={data.sender_document_type} onChange={e => setData('sender_document_type', e.target.value)} className={inputCls(errors.sender_document_type)}>
                                            <option value="DNI">DNI</option>
                                            <option value="RUC">RUC</option>
                                            <option value="CE">CE</option>
                                            <option value="PASAPORTE">PASAPORTE</option>
                                        </select>
                                    </Field>
                                    <div className="col-span-2">
                                        <Field label="Número" required error={errors.sender_document_number}>
                                            <div className="relative">
                                                <input value={data.sender_document_number}
                                                    onChange={e => setData('sender_document_number', e.target.value.replace(/\D/g, '').slice(0, 20))}
                                                    onBlur={() => handleDocBlur('sender')}
                                                    placeholder="12345678"
                                                    className={inputCls(errors.sender_document_number)} />
                                                {senderLookup === 'searching' && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
                                                )}
                                                {senderLookup === 'found' && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                    </span>
                                                )}
                                            </div>
                                        </Field>
                                    </div>
                                </div>
                                <Field label="Nombre" required error={errors.sender_name}>
                                    <input value={data.sender_name} onChange={e => setData('sender_name', e.target.value)}
                                        disabled={senderLookup === 'found'}
                                        placeholder="Nombre remitente"
                                        className={`${inputCls(errors.sender_name)} ${senderLookup === 'found' ? 'bg-gray-100 text-gray-500' : ''}`} />
                                </Field>
                                <Field label="Teléfono" error={errors.sender_phone}>
                                    <input value={data.sender_phone} onChange={e => setData('sender_phone', e.target.value)}
                                        placeholder="987 654 321" className={inputCls(errors.sender_phone)} />
                                </Field>
                            </div>

                            {/* DESTINATARIO */}
                            <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest border-b border-blue-200/50 pb-2">Destinatario</p>

                                <div className="grid grid-cols-3 gap-2">
                                    <Field label="Doc." required error={errors.receiver_document_type}>
                                        <select value={data.receiver_document_type} onChange={e => setData('receiver_document_type', e.target.value)} className={inputCls(errors.receiver_document_type)}>
                                            <option value="DNI">DNI</option>
                                            <option value="RUC">RUC</option>
                                            <option value="CE">CE</option>
                                            <option value="PASAPORTE">PASAPORTE</option>
                                        </select>
                                    </Field>
                                    <div className="col-span-2">
                                        <Field label="Número" required error={errors.receiver_document_number}>
                                            <div className="relative">
                                                <input value={data.receiver_document_number}
                                                    onChange={e => setData('receiver_document_number', e.target.value.replace(/\D/g, '').slice(0, 20))}
                                                    onBlur={() => handleDocBlur('receiver')}
                                                    placeholder="12345678"
                                                    className={inputCls(errors.receiver_document_number)} />
                                                {receiverLookup === 'searching' && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
                                                )}
                                                {receiverLookup === 'found' && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                    </span>
                                                )}
                                            </div>
                                        </Field>
                                    </div>
                                </div>
                                <Field label="Nombre" required error={errors.receiver_name}>
                                    <input value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)}
                                        disabled={receiverLookup === 'found'}
                                        placeholder="Nombre destinatario"
                                        className={`${inputCls(errors.receiver_name)} ${receiverLookup === 'found' ? 'bg-gray-100 text-gray-500' : ''}`} />
                                </Field>
                                <Field label="Teléfono" error={errors.receiver_phone}>
                                    <input value={data.receiver_phone} onChange={e => setData('receiver_phone', e.target.value)}
                                        placeholder="987 654 321" className={inputCls(errors.receiver_phone)} />
                                </Field>
                            </div>
                        </div>

                        {/* Tipo de paquete */}
                        <div className="border-t border-gray-100 pt-4 mt-2">
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
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-3">
                            <Field label="Peso (kg)" error={errors.weight}>
                                <input type="number" value={data.weight} onChange={e => setData('weight', e.target.value)}
                                    placeholder="0.5" min="0.01" step="0.01" className={inputCls(errors.weight)} />
                            </Field>
                            {showDimensions && (
                                <Field label="Dimensiones" error={errors.dimensions}>
                                    <input value={data.dimensions} onChange={e => setData('dimensions', e.target.value)}
                                        placeholder="20x30x15 cm" className={inputCls(errors.dimensions)} />
                                </Field>
                            )}
                        </div>

                        {/* Ruta */}
                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ruta</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Origen" required error={errors.origin}>
                                <select value={data.origin} onChange={e => {
                                    setData(d => ({ ...d, origin: e.target.value, trip_id: '' }));
                                }} className={inputCls(errors.origin)}>
                                    <option value="">Seleccione origen</option>
                                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </Field>
                            <Field label="Destino" required error={errors.destination}>
                                <select value={data.destination} onChange={e => {
                                    setData(d => ({ ...d, destination: e.target.value, trip_id: '' }));
                                }} className={inputCls(errors.destination)}>
                                    <option value="">Seleccione destino</option>
                                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Asignar a viaje" error={errors.trip_id}>
                            <select value={data.trip_id} onChange={e => setData('trip_id', e.target.value)}
                                className={inputCls(errors.trip_id)}>
                                <option value="">Sin asignar (registrar como recibido)</option>
                                {availableTrips.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {availableTrips.length === 0 && data.origin && data.destination 
                                    ? 'No hay viajes activos para esta ruta.'
                                    : 'Solo viajes activos de hoy en adelante que cubren esta ruta.'}
                            </p>
                        </Field>

                        {/* Cobro */}
                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Cobro</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Precio (S/)" required error={errors.price}>
                                <input type="number" value={data.price} onChange={e => setData('price', e.target.value)}
                                    disabled={!hasAdmin}
                                    title={!hasAdmin ? "Solo el administrador puede editar el precio manualmente" : ""}
                                    placeholder="10.00" min="0" step="0.50" className={inputCls(errors.price) + (!hasAdmin ? " bg-gray-100 cursor-not-allowed" : "")} />
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
