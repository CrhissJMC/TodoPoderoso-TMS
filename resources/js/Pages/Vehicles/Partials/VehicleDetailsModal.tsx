import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface SoatRenewal {
    id: number;
    expiration_date: string;
    renewed_at: string;
    cost?: string;
    notes?: string;
}

interface Maintenance {
    id: number;
    maintenance_date: string;
    type: string; // preventivo | correctivo
    description: string;
    cost: string;
    workshop?: string;
    notes?: string;
}

interface Vehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    mtc_category: string | null;
    year: number;
    capacity_seats: number;
    sellable_seats: number;
    soat_expiration_date: string | null;
    type: string;
    status: string;
    color: string;
    observations: string | null;
    soatRenewals: SoatRenewal[];
    maintenances: Maintenance[];
}

interface Props {
    vehicle: Vehicle | null;
    onClose: () => void;
}

export default function VehicleDetailsModal({ vehicle, onClose }: Props) {
    if (!vehicle) return null;

    const [activeTab, setActiveTab] = useState<'maintenances' | 'soat'>('maintenances');
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [showSoatForm, setShowSoatForm] = useState(false);

    // Form for maintenance
    const maintForm = useForm({
        maintenance_date: new Date().toISOString().split('T')[0],
        type: 'preventivo',
        description: '',
        cost: '',
        workshop: '',
        notes: '',
    });

    // Form for SOAT
    const soatForm = useForm({
        expiration_date: '',
        renewed_at: new Date().toISOString().split('T')[0],
        cost: '',
        notes: '',
    });

    const submitMaintenance = (e: React.FormEvent) => {
        e.preventDefault();
        maintForm.post(route('vehicles.addMaintenance', vehicle.id), {
            onSuccess: () => {
                setShowMaintenanceForm(false);
                maintForm.reset();
            },
        });
    };

    const submitSoat = (e: React.FormEvent) => {
        e.preventDefault();
        soatForm.post(route('vehicles.addSoatRenewal', vehicle.id), {
            onSuccess: () => {
                setShowSoatForm(false);
                soatForm.reset();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Historial Técnico de la Unidad</h2>
                        <p className="text-xs text-gray-500">Placa: {vehicle.plate} | {vehicle.brand} {vehicle.model}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-8">
                    <button
                        onClick={() => setActiveTab('maintenances')}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'maintenances' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        🛠️ Historial de Mantenimientos
                    </button>
                    <button
                        onClick={() => setActiveTab('soat')}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'soat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        📄 Renovaciones SOAT
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    {/* Tab: Maintenances */}
                    {activeTab === 'maintenances' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Registros de Taller / Reparaciones</h3>
                                <button onClick={() => setShowMaintenanceForm(!showMaintenanceForm)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                    {showMaintenanceForm ? '✕ Cancelar' : '+ Registrar Mantenimiento'}
                                </button>
                            </div>

                            {showMaintenanceForm && (
                                <form onSubmit={submitMaintenance} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="col-span-full text-xs font-bold text-indigo-900">Agregar nuevo registro de mantenimiento</div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fecha</label>
                                        <input type="date" value={maintForm.data.maintenance_date} onChange={e => maintForm.setData('maintenance_date', e.target.value)} required
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Tipo</label>
                                        <select value={maintForm.data.type} onChange={e => maintForm.setData('type', e.target.value)} required
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white">
                                            <option value="preventivo">Preventivo</option>
                                            <option value="correctivo">Correctivo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Costo (S/)</label>
                                        <input type="number" step="0.01" value={maintForm.data.cost} onChange={e => maintForm.setData('cost', e.target.value)} required
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Descripción / Trabajo Realizado</label>
                                        <input type="text" value={maintForm.data.description} onChange={e => maintForm.setData('description', e.target.value)} required placeholder="Ej: Cambio de aceite, pastillas de freno..."
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Taller / Concesionaria</label>
                                        <input type="text" value={maintForm.data.workshop} onChange={e => maintForm.setData('workshop', e.target.value)} placeholder="Ej: Taller Central..."
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Notas adicionales</label>
                                        <input type="text" value={maintForm.data.notes} onChange={e => maintForm.setData('notes', e.target.value)} placeholder="Observaciones extras..."
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" disabled={maintForm.processing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
                                            {maintForm.processing ? 'Guardando...' : 'Guardar Mantenimiento'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left">
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3">Taller</th>
                                            <th className="px-4 py-3 text-right">Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vehicle.maintenances && vehicle.maintenances.length > 0 ? (
                                            vehicle.maintenances.map(m => (
                                                <tr key={m.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{m.maintenance_date}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            m.type === 'preventivo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {m.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{m.description}</td>
                                                    <td className="px-4 py-3 text-gray-500">{m.workshop || '-'}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">S/ {parseFloat(m.cost).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay registros de mantenimientos preventivos o correctivos.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: SOAT */}
                    {activeTab === 'soat' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Historial de Renovaciones de SOAT</h3>
                                <button onClick={() => setShowSoatForm(!showSoatForm)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                    {showSoatForm ? '✕ Cancelar' : '+ Registrar Renovación'}
                                </button>
                            </div>

                            {showSoatForm && (
                                <form onSubmit={submitSoat} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="col-span-full text-xs font-bold text-indigo-900">Agregar nuevo registro de SOAT</div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nueva Fecha Vencimiento</label>
                                        <input type="date" value={soatForm.data.expiration_date} onChange={e => soatForm.setData('expiration_date', e.target.value)} required
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fecha de Renovación</label>
                                        <input type="date" value={soatForm.data.renewed_at} onChange={e => soatForm.setData('renewed_at', e.target.value)} required
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Costo (S/)</label>
                                        <input type="number" step="0.01" value={soatForm.data.cost} onChange={e => soatForm.setData('cost', e.target.value)}
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Notas / Observaciones de renovación</label>
                                        <input type="text" value={soatForm.data.notes} onChange={e => soatForm.setData('notes', e.target.value)} placeholder="Ej: Aseguradora Rímac, póliza #12345..."
                                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white" />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" disabled={soatForm.processing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
                                            {soatForm.processing ? 'Guardando...' : 'Guardar Renovación'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left">
                                            <th className="px-4 py-3">Fecha de Renovación</th>
                                            <th className="px-4 py-3">Nueva Fecha Expiración</th>
                                            <th className="px-4 py-3">Costo</th>
                                            <th className="px-4 py-3">Notas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vehicle.soatRenewals && vehicle.soatRenewals.length > 0 ? (
                                            vehicle.soatRenewals.map(s => (
                                                <tr key={s.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{s.renewed_at}</td>
                                                    <td className="px-4 py-3 text-red-600 font-semibold">{s.expiration_date}</td>
                                                    <td className="px-4 py-3 text-gray-900 font-bold">
                                                        {s.cost ? `S/ ${parseFloat(s.cost).toFixed(2)}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">{s.notes || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay registros de renovaciones de SOAT.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
