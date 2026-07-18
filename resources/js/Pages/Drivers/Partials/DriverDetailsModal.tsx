import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

declare var route: any;

interface LicenseRenewal {
    id: number;
    license_number: string;
    expiry_date: string;
    renewed_at: string;
    notes?: string;
}

interface Driver {
    id: number;
    name: string;
    license_number: string;
    license_type: string;
    license_expiry: string | null;
    phone: string;
    email: string | null;
    dni: string | null;
    status: string;
    contract_type: string;
    rental_fee: string | null;
    observations: string | null;
    photo_path: string | null;
    licenseRenewals: LicenseRenewal[];
    vehicle?: {
        plate: string;
        brand: string;
        model: string;
    };
}

interface Props {
    driver: Driver | null;
    onClose: () => void;
}

export default function DriverDetailsModal({ driver, onClose }: Props) {
    if (!driver) return null;

    const [showRenewForm, setShowRenewForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        license_number: driver.license_number || '',
        expiry_date: '',
        renewed_at: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const submitRenewal = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('drivers.addLicenseRenewal', driver.id), {
            onSuccess: () => {
                setShowRenewForm(false);
                reset();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Ficha del Conductor (CV)</h2>
                        <p className="text-xs text-gray-500">Historial completo y datos personales</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 space-y-8">
                    {/* CV Profile & Info */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Passport Photo */}
                        <div className="w-40 h-52 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {driver.photo_path ? (
                                <img src={`/storage/${driver.photo_path}`} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <span className="text-4xl text-gray-400">👤</span>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Foto Tipo Carnet</p>
                                </div>
                            )}
                        </div>

                        {/* General details */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{driver.name}</h3>
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">{driver.contract_type === 'empleado' ? 'Planilla / Empleado' : driver.contract_type === 'propietario' ? 'Propietario' : 'Alquiler'}</p>
                            </div>
                            <div className="sm:text-right">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    driver.status === 'activo' ? 'bg-green-100 text-green-700' :
                                    driver.status === 'en_viaje' ? 'bg-blue-100 text-blue-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {driver.status}
                                </span>
                            </div>

                            <hr className="col-span-full border-gray-100 my-1" />

                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">DNI</p>
                                <p className="text-sm font-semibold text-gray-800">{driver.dni || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Teléfono</p>
                                <p className="text-sm font-semibold text-gray-800">{driver.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                                <p className="text-sm font-semibold text-gray-800">{driver.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Vehículo Asignado</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {driver.vehicle ? `${driver.vehicle.brand} ${driver.vehicle.model} (${driver.vehicle.plate})` : 'Ninguno'}
                                </p>
                            </div>
                            {driver.contract_type === 'alquiler' && (
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Tarifa de Alquiler</p>
                                    <p className="text-sm font-semibold text-amber-600">S/ {parseFloat(driver.rental_fee || '0').toFixed(2)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Licencia Actual</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {driver.license_number} ({driver.license_type})
                                </p>
                                {driver.license_expiry && (
                                    <p className="text-xs text-gray-500">Vence: {driver.license_expiry}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    {driver.observations && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Observaciones</p>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{driver.observations}</p>
                        </div>
                    )}

                    {/* License renewal history */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Historial de Licencias / Renovaciones</h4>
                            <button onClick={() => setShowRenewForm(!showRenewForm)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                {showRenewForm ? '✕ Cancelar' : '+ Registrar Renovación'}
                            </button>
                        </div>

                        {showRenewForm && (
                            <form onSubmit={submitRenewal} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="col-span-full text-xs font-bold text-indigo-900 mb-1">Registrar nueva actualización de licencia</div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nro Licencia</label>
                                    <input type="text" value={data.license_number} onChange={e => setData('license_number', e.target.value)} required
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    {errors.license_number && <p className="text-red-500 text-[10px] mt-1">{errors.license_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nueva Fecha Vencimiento</label>
                                    <input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} required
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    {errors.expiry_date && <p className="text-red-500 text-[10px] mt-1">{errors.expiry_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fecha Registro</label>
                                    <input type="date" value={data.renewed_at} onChange={e => setData('renewed_at', e.target.value)} required
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Notas / Observaciones de renovación</label>
                                    <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Ej: Renovación aprobada por MTC..."
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" disabled={processing}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
                                        {processing ? 'Guardando...' : 'Guardar Historial'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="relative border-l border-gray-200 pl-6 space-y-6">
                            {driver.licenseRenewals && driver.licenseRenewals.length > 0 ? (
                                driver.licenseRenewals.map((r, idx) => (
                                    <div key={r.id} className="relative">
                                        {/* Dot */}
                                        <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                                        
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Licencia: {r.license_number}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Registrado el {r.renewed_at} — Expiración: {r.expiry_date}</p>
                                            {r.notes && <p className="text-xs text-gray-600 mt-1 italic">"{r.notes}"</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No hay renovaciones anteriores registradas.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        Cerrar Ficha
                    </button>
                </div>
            </div>
        </div>
    );
}
