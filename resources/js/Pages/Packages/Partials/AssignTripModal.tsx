import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { router } from '@inertiajs/react';

interface Props {
    pkg: any | null;
    activeTrips: any[];
    onClose: () => void;
}

export default function AssignTripModal({ pkg, activeTrips, onClose }: Props) {
    const [processing, setProcessing] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState('');

    useEffect(() => {
        if (pkg) {
            setSelectedTrip('');
        }
    }, [pkg]);

    if (!pkg) return null;

    // Filtrar viajes que coincidan con el origen y destino del paquete
    const compatibleTrips = activeTrips.filter(t => 
        // El viaje tiene un route_name (ej: "Lima - Arequipa") y la encomienda tiene origin "Lima" y destination "Arequipa"
        // Como no tenemos el origin/destination exactos del viaje aquí, podemos buscar que el route_name contenga ambos.
        t.route_name.toLowerCase().includes(pkg.origin.toLowerCase()) && 
        t.route_name.toLowerCase().includes(pkg.destination.toLowerCase()) &&
        t.status !== 'completado' && t.status !== 'cancelado'
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrip) return;

        setProcessing(true);
        router.patch(route('packages.assignTrip', pkg.id), { trip_id: selectedTrip }, {
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    };

    return (
        <Transition appear show={!!pkg} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                
                                <div className="flex items-center justify-between mb-5">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                                        </div>
                                        Asignar a Viaje
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{pkg.tracking_code}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <span className="font-medium">{pkg.origin}</span>
                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                        <span className="font-medium">{pkg.destination}</span>
                                    </div>
                                </div>

                                <form onSubmit={submit}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccione el Viaje</label>
                                        
                                        {compatibleTrips.length === 0 ? (
                                            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                                No hay viajes activos programados que coincidan con la ruta ({pkg.origin} - {pkg.destination}).
                                            </div>
                                        ) : (
                                            <select 
                                                className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                value={selectedTrip}
                                                onChange={e => setSelectedTrip(e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccione un viaje...</option>
                                                {compatibleTrips.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.label} ({t.status})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button type="button" onClick={onClose} disabled={processing}
                                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={processing || !selectedTrip}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            {processing ? 'Asignando...' : 'Asignar Viaje'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
