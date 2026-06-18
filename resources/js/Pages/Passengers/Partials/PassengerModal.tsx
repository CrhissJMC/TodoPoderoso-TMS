import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

interface Passenger {
    id: number;
    full_name: string;
    dni: string;
    phone: string | null;
    // Eliminado: email: string | null;
}

interface Props {
    isOpen: boolean;
    passenger: Passenger | null;
    onClose: () => void;
}

function Field({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
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
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'
    }`;

export default function PassengerModal({ isOpen, passenger, onClose }: Props) {
    const isEditing = !!passenger;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        full_name: '',
        dni: '',
        phone: '',
        // Eliminado: email: ''
    });

    useEffect(() => {
        if (isOpen && passenger) {
            setData({
                full_name: passenger.full_name,
                dni: passenger.dni,
                phone: passenger.phone ?? '',
                // Eliminado: email: passenger.email ?? ''
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, passenger]);

    function handleClose() { reset(); clearErrors(); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('passengers.update', passenger!.id), { onSuccess: handleClose });
        } else {
            post(route('passengers.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar pasajero' : 'Nuevo pasajero'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing
                                ? 'Actualiza los datos del pasajero.'
                                : 'El DNI es el identificador único del pasajero.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                    <Field label="Nombre completo" required error={errors.full_name}>
                        <input
                            value={data.full_name}
                            onChange={e => setData('full_name', e.target.value)}
                            placeholder="Ej. María Elena Torres"
                            className={inputCls(errors.full_name)}
                            autoFocus
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="DNI" required error={errors.dni}>
                            <input
                                value={data.dni}
                                onChange={e => setData('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="12345678"
                                maxLength={8}
                                className={inputCls(errors.dni)}
                            />
                        </Field>

                        <Field label="Teléfono" error={errors.phone}>
                            <input
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="987 654 321"
                                className={inputCls(errors.phone)}
                            />
                        </Field>
                    </div>

                    {/* Info extra en modo crear */}
                    {!isEditing && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-blue-700">
                                Al vender un boleto puedes buscar al pasajero por su DNI para autocompletar sus datos sin necesidad de registrarlo nuevamente.
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button type="button" onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {processing
                                ? (isEditing ? 'Guardando…' : 'Registrando…')
                                : (isEditing ? 'Guardar cambios' : 'Registrar pasajero')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}