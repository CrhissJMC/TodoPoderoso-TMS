import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface Props {
    currentCategory: string;
    licenseTypes: string[];
}

export default function LicenseRenew({ currentCategory, licenseTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        license_type: currentCategory,
        license_expiry: '',
        license_document: null as File | null,
        declaration: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('driver.license.renew'));
    };

    return (
        <GuestLayout>
            <Head title="Renovación de Licencia" />

            <div className="mb-6 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Licencia Vencida</h2>
                <p className="text-sm text-gray-600 mt-2">
                    Tu licencia de conducir ha vencido. Por razones de seguridad y cumplimiento legal, no puedes acceder al sistema de TMS hasta actualizar tu información.
                </p>
            </div>

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="license_type" value="Categoría de Licencia" />
                        <select
                            id="license_type"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.license_type}
                            onChange={(e) => setData('license_type', e.target.value)}
                            required
                        >
                            {licenseTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.license_type && <p className="mt-2 text-sm text-red-600">{errors.license_type}</p>}
                    </div>

                    <div>
                        <InputLabel htmlFor="license_expiry" value="Nueva Fecha de Vencimiento" />
                        <TextInput
                            id="license_expiry"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.license_expiry}
                            onChange={(e) => setData('license_expiry', e.target.value)}
                            required
                        />
                        {errors.license_expiry && <p className="mt-2 text-sm text-red-600">{errors.license_expiry}</p>}
                    </div>

                    <div>
                        <InputLabel htmlFor="license_document" value="Documento Escaneado (PDF o Imagen)" />
                        <input
                            id="license_document"
                            type="file"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setData('license_document', e.target.files ? e.target.files[0] : null)}
                            accept=".pdf,image/jpeg,image/png,image/jpg"
                            required
                        />
                        {errors.license_document && <p className="mt-2 text-sm text-red-600">{errors.license_document}</p>}
                    </div>

                    <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                        <div className="flex items-center h-5">
                            <input
                                id="declaration"
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                checked={data.declaration}
                                onChange={(e) => setData('declaration', e.target.checked)}
                                required
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="declaration" className="font-bold text-gray-900">Declaración Jurada</label>
                            <p className="text-gray-500 mt-1">Declaro bajo juramento que el documento adjunto y la información brindada son verídicos, y asumo total responsabilidad legal en caso de fraude.</p>
                        </div>
                    </div>
                    {errors.declaration && <p className="mt-1 text-sm text-red-600 font-bold">{errors.declaration}</p>}
                </div>

                <div className="flex items-center justify-between mt-8">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        Cerrar sesión
                    </Link>
                    <PrimaryButton className="ml-4 bg-indigo-600 hover:bg-indigo-700" disabled={processing || !data.declaration}>
                        {processing ? 'Actualizando...' : 'Actualizar Licencia'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
