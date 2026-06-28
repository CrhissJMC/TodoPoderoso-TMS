import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import SeatMap from './SeatMap';

interface Stop { name: string; fare: string | null; }
interface AvailableTrip {
    id: number; label: string; status: string; route_name: string;
    origin: string; destination: string; base_fare: string;
    sellable_seats: number; stops: Stop[]; occupied_seats: number[];
}

interface Ticket {
    id: number; trip_id: number; client: { name: string; document_type: string; document_number: string; phone: string | null };
    seat_number: number; boarding_stop: string; dropoff_stop: string; fare: string;
    payment_method: string; payment_status: string;
}

interface Props {
    isOpen: boolean;
    ticket: Ticket | null;
    availableTrips: AvailableTrip[];
    paymentMethods: string[];
    paymentStatuses: string[];
    onClose: () => void;
}

const METHOD_LABELS: Record<string, string> = { efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta' };
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

export default function TicketModal({ isOpen, ticket, availableTrips, paymentMethods, paymentStatuses, onClose }: Props) {
    const isEditing = !!ticket;

    const [docLookup, setDocLookup] = useState<'idle' | 'searching' | 'found' | 'new'>('idle');
    const [step, setStep] = useState<1 | 2>(1); // 1: viaje+asiento, 2: pasajero+pago

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        trip_id: '',
        client_id: '',
        client_name: '',
        client_document_type: 'DNI',
        client_document_number: '',
        client_phone: '',
        seat_number: '' as string | number,
        boarding_stop: '',
        dropoff_stop: '',
        fare: '',
        payment_method: 'efectivo',
        payment_status: 'pagado',
    });

    const selectedTrip = availableTrips.find(t => t.id.toString() === data.trip_id);

    useEffect(() => {
        if (isOpen && ticket) {
            setData({
                trip_id: ticket.trip_id.toString(),
                client_id: '',
                client_name: ticket.client.name,
                client_document_type: ticket.client.document_type,
                client_document_number: ticket.client.document_number,
                client_phone: ticket.client.phone ?? '',
                seat_number: ticket.seat_number,
                boarding_stop: ticket.boarding_stop,
                dropoff_stop: ticket.dropoff_stop,
                fare: ticket.fare,
                payment_method: ticket.payment_method,
                payment_status: ticket.payment_status,
            });
            setStep(2);
            setDocLookup('found');
        } else if (isOpen) {
            reset();
            clearErrors();
            setStep(1);
            setDocLookup('idle');
        }
    }, [isOpen, ticket]);

    // Al elegir un viaje, preseleccionar paradas y tarifa base
    function handleTripChange(tripId: string) {
        const trip = availableTrips.find(t => t.id.toString() === tripId);
        setData(d => ({
            ...d,
            trip_id: tripId,
            seat_number: '',
            boarding_stop: trip?.origin ?? '',
            dropoff_stop: trip?.destination ?? '',
            fare: trip?.base_fare ?? '',
        }));
    }

    function handleDropoffChange(stopName: string) {
        const trip = selectedTrip;
        let fare = trip?.base_fare ?? '';

        if (trip && stopName !== trip.destination) {
            const stop = trip.stops.find(s => s.name === stopName);
            if (stop?.fare) fare = stop.fare;
        }

        setData(d => ({ ...d, dropoff_stop: stopName, fare }));
    }

    // Búsqueda por Documento
    async function handleDocBlur() {
        if (data.client_document_number.length < 5) return;
        setDocLookup('searching');
        try {
            const res = await fetch(route('clients.searchByDocument'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ document_number: data.client_document_number })
            });
            const json = await res.json();
            if (json.success && json.client) {
                setData(d => ({
                    ...d,
                    client_id: json.client.id,
                    client_name: json.client.name,
                    client_document_type: json.client.document_type,
                    client_phone: json.client.phone ?? '',
                }));
                setDocLookup('found');
            } else {
                setData(d => ({ ...d, client_id: '' }));
                setDocLookup('new');
            }
        } catch {
            setDocLookup('idle');
        }
    }

    function handleClose() {
        reset(); clearErrors(); setStep(1); setDocLookup('idle');
        onClose();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('tickets.update', ticket!.id), { onSuccess: handleClose });
        } else {
            post(route('tickets.store'), { onSuccess: handleClose });
        }
    }

    function goToStep2() {
        if (!data.trip_id || !data.seat_number) return;
        setStep(2);
    }

    if (!isOpen) return null;

    // Lista de destinos posibles (paradas + destino final)
    const dropoffOptions = selectedTrip
        ? [...selectedTrip.stops.map(s => s.name), selectedTrip.destination]
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar boleto' : 'Vender boleto'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {!isEditing && (step === 1 ? 'Paso 1 de 2 — Elige el viaje y el asiento' : 'Paso 2 de 2 — Datos del pasajero y pago')}
                            {isEditing && 'Modifica los datos del boleto.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-4">

                        {/* ── PASO 1: Viaje + Asiento ── */}
                        {(step === 1 || isEditing) && (
                            <>
                                <Field label="Viaje" required error={errors.trip_id}>
                                    <select value={data.trip_id} disabled={isEditing}
                                        onChange={e => handleTripChange(e.target.value)}
                                        className={`${inputCls(errors.trip_id)} ${isEditing ? 'bg-gray-50 text-gray-500' : ''}`}>
                                        <option value="">Selecciona un viaje…</option>
                                        {availableTrips.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                {selectedTrip && (
                                    <>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
                                            <span>{selectedTrip.origin}</span>
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                            <span>{selectedTrip.destination}</span>
                                            <span className="ml-auto text-xs">{selectedTrip.occupied_seats.length}/{selectedTrip.sellable_seats} ocupados</span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                                Selecciona el asiento<span className="text-red-500 ml-0.5">*</span>
                                            </p>
                                            <SeatMap
                                                sellableSeats={selectedTrip.sellable_seats}
                                                occupiedSeats={isEditing ? selectedTrip.occupied_seats.filter(s => s !== ticket?.seat_number) : selectedTrip.occupied_seats}
                                                selectedSeat={data.seat_number ? Number(data.seat_number) : null}
                                                onSelect={seat => setData('seat_number', seat)}
                                            />
                                            {errors.seat_number && <p className="text-xs text-red-500 mt-1">{errors.seat_number}</p>}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ── PASO 2: Pasajero + Tramo + Pago ── */}
                        {(step === 2 || isEditing) && selectedTrip && (
                            <>
                                {/* Resumen del paso 1 (solo en creación) */}
                                {!isEditing && (
                                    <button type="button" onClick={() => setStep(1)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm hover:bg-gray-100 transition-colors">
                                        <span className="text-gray-600">{selectedTrip.route_name} · Asiento <strong>{data.seat_number}</strong></span>
                                        <span className="text-xs text-gray-400">Cambiar</span>
                                    </button>
                                )}

                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pasajero</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Field label="Tipo Doc." required error={errors.client_document_type}>
                                        <select value={data.client_document_type} onChange={e => setData('client_document_type', e.target.value)} className={inputCls(errors.client_document_type)}>
                                            <option value="DNI">DNI</option>
                                            <option value="RUC">RUC</option>
                                            <option value="CE">CE</option>
                                            <option value="PASAPORTE">PASAPORTE</option>
                                        </select>
                                    </Field>

                                    <div className="col-span-2">
                                        <Field label="Número de Doc." required error={errors.client_document_number}>
                                            <div className="relative">
                                                <input value={data.client_document_number}
                                                    onChange={e => setData('client_document_number', e.target.value.replace(/\D/g, '').slice(0, 20))}
                                                    onBlur={handleDocBlur}
                                                    placeholder="12345678"
                                                    className={inputCls(errors.client_document_number)} />
                                                {docLookup === 'searching' && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Buscando…</span>
                                                )}
                                                {docLookup === 'found' && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                        Registrado
                                                    </span>
                                                )}
                                                {docLookup === 'new' && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500">Nuevo</span>
                                                )}
                                            </div>
                                        </Field>
                                    </div>
                                </div>

                                <Field label="Nombre completo" required error={errors.client_name}>
                                    <input value={data.client_name} onChange={e => setData('client_name', e.target.value)}
                                        placeholder="Nombre del pasajero"
                                        disabled={docLookup === 'found'}
                                        className={`${inputCls(errors.client_name)} ${docLookup === 'found' ? 'bg-gray-50 text-gray-500' : ''}`} />
                                </Field>

                                <Field label="Teléfono" error={errors.client_phone}>
                                    <input value={data.client_phone} onChange={e => setData('client_phone', e.target.value)}
                                        placeholder="987 654 321" className={inputCls(errors.client_phone)} />
                                </Field>

                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Tramo y tarifa</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Sube en" required error={errors.boarding_stop}>
                                        <select value={data.boarding_stop} onChange={e => setData('boarding_stop', e.target.value)} className={inputCls(errors.boarding_stop)}>
                                            <option value={selectedTrip.origin}>{selectedTrip.origin} (origen)</option>
                                            {selectedTrip.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Baja en" required error={errors.dropoff_stop}>
                                        <select value={data.dropoff_stop} onChange={e => handleDropoffChange(e.target.value)} className={inputCls(errors.dropoff_stop)}>
                                            {dropoffOptions.map(name => (
                                                <option key={name} value={name}>{name}{name === selectedTrip.destination ? ' (destino)' : ''}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                <Field label="Tarifa (S/)" required error={errors.fare}>
                                    <input type="number" value={data.fare} onChange={e => setData('fare', e.target.value)}
                                        min="0" step="0.50" className={inputCls(errors.fare)} />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Método de pago" required error={errors.payment_method}>
                                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className={inputCls(errors.payment_method)}>
                                            {paymentMethods.map(m => <option key={m} value={m}>{METHOD_LABELS[m] ?? m}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Estado de pago" required error={errors.payment_status}>
                                        <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className={inputCls(errors.payment_status)}>
                                            {paymentStatuses.map(s => <option key={s} value={s}>{PSTATUS_LABELS[s] ?? s}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-white rounded-b-2xl flex-shrink-0">
                        <button type="button" onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>

                        {!isEditing && step === 1 ? (
                            <button type="button" onClick={goToStep2} disabled={!data.trip_id || !data.seat_number}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Continuar
                            </button>
                        ) : (
                            <button type="submit" disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {processing ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Emitir boleto')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
