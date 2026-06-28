import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

interface Client {
    id: number;
    name: string;
    document_type: string;
    document_number: string;
    phone: string | null;
    email: string | null;
    address: string | null;
}

interface Props {
    isOpen: boolean;
    client: Client | null;
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

export default function ClientModal({ isOpen, client, onClose }: Props) {
    const isEditing = !!client;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        document_type: 'DNI',
        document_number: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if (isOpen && client) {
            setData({
                name: client.name,
                document_type: client.document_type,
                document_number: client.document_number,
                phone: client.phone ?? '',
                email: client.email ?? '',
                address: client.address ?? ''
            });
        } else if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen, client]);

    function handleClose() { reset(); clearErrors(); onClose(); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('clients.update', client!.id), { onSuccess: handleClose });
        } else {
            post(route('clients.store'), { onSuccess: handleClose });
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={e => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing
                                ? 'Actualiza los datos del cliente.'
                                : 'Ingresa los datos para registrar un nuevo cliente.'}
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

                    <Field label="Nombre Completo / Razón Social" required error={errors.name}>
                        <input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Ej. Juan Pérez / Empresa SAC"
                            className={inputCls(errors.name)}
                            autoFocus
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo Doc." required error={errors.document_type}>
                            <select
                                value={data.document_type}
                                onChange={e => setData('document_type', e.target.value)}
                                className={inputCls(errors.document_type)}
                            >
                                <option value="DNI">DNI</option>
                                <option value="RUC">RUC</option>
                                <option value="CE">CE</option>
                                <option value="PASAPORTE">PASAPORTE</option>
                            </select>
                        </Field>

                        <Field label="Número de Doc." required error={errors.document_number}>
                            <input
                                value={data.document_number}
                                onChange={e => setData('document_number', e.target.value.replace(/\D/g, '').slice(0, 20))}
                                placeholder="12345678"
                                className={inputCls(errors.document_number)}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Teléfono" error={errors.phone}>
                            <input
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="987 654 321"
                                className={inputCls(errors.phone)}
                            />
                        </Field>

                        <Field label="Email" error={errors.email}>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className={inputCls(errors.email)}
                            />
                        </Field>
                    </div>

                    <Field label="Dirección" error={errors.address}>
                        <textarea
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            placeholder="Ej. Av. Principal 123"
                            rows={2}
                            className={inputCls(errors.address)}
                        />
                    </Field>

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
                                : (isEditing ? 'Guardar cambios' : 'Registrar cliente')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}