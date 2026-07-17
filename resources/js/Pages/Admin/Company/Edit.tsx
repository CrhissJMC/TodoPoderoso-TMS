import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Props {
    companySettings: {
        name: string;
        primary_color: string;
        bg_color: string;
        accent_color: string;
    };
}

export default function CompanyEdit({ companySettings }: Props) {
    const { flash } = usePage().props as any;
    
    const { data, setData, put, processing, errors } = useForm({
        name: companySettings?.name || 'TodoPoderoso TMS',
        primary_color: companySettings?.primary_color || '#4F46E5',
        bg_color: companySettings?.bg_color || '#F9FAFB',
        accent_color: companySettings?.accent_color || '#8B5CF6',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.company.update'));
    };

    // Estilos de vista previa en tiempo real
    const previewStyle = {
        '--preview-primary': data.primary_color,
        '--preview-bg': data.bg_color,
        '--preview-accent': data.accent_color,
    } as React.CSSProperties;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Configuración de la Empresa</h2>}>
            <Head title="Configuración de Empresa" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8 space-y-8">
                
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Paleta de Colores</h3>
                            <form onSubmit={submit} className="space-y-6">
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Empresa</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 focus:ring-theme-primary focus:border-theme-primary transition-colors text-sm"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color Principal (Botones, Header)</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={data.primary_color} 
                                                onChange={e => setData('primary_color', e.target.value)}
                                                className="h-10 w-16 p-1 border border-gray-200 rounded-lg cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={data.primary_color}
                                                onChange={e => setData('primary_color', e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 font-mono text-sm uppercase"
                                            />
                                        </div>
                                        {errors.primary_color && <p className="text-red-500 text-xs mt-1">{errors.primary_color}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color Acento (Gradientes, Hover)</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={data.accent_color} 
                                                onChange={e => setData('accent_color', e.target.value)}
                                                className="h-10 w-16 p-1 border border-gray-200 rounded-lg cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={data.accent_color}
                                                onChange={e => setData('accent_color', e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 font-mono text-sm uppercase"
                                            />
                                        </div>
                                        {errors.accent_color && <p className="text-red-500 text-xs mt-1">{errors.accent_color}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color de Fondo</label>
                                        <p className="text-xs text-gray-400 mb-2">Por defecto recomendamos #FFFFFF o un gris claro como #F9FAFB.</p>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={data.bg_color} 
                                                onChange={e => setData('bg_color', e.target.value)}
                                                className="h-10 w-16 p-1 border border-gray-200 rounded-lg cursor-pointer bg-white"
                                            />
                                            <input 
                                                type="text" 
                                                value={data.bg_color}
                                                onChange={e => setData('bg_color', e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 font-mono text-sm uppercase"
                                            />
                                        </div>
                                        {errors.bg_color && <p className="text-red-500 text-xs mt-1">{errors.bg_color}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: data.primary_color }}
                                    >
                                        {processing ? 'Guardando...' : 'Guardar y Aplicar Tema'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Vista Previa */}
                    <div className="lg:col-span-2">
                        <div 
                            className="p-8 rounded-3xl border border-gray-200 shadow-inner transition-colors duration-500 overflow-hidden relative"
                            style={{ backgroundColor: data.bg_color, ...previewStyle }}
                        >
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, var(--preview-primary), var(--preview-accent))` }}></div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                    <h2 className="text-xl font-extrabold" style={{ color: data.primary_color }}>
                                        {data.name}
                                    </h2>
                                    <div className="flex gap-2">
                                        <span className="w-8 h-8 rounded-full" style={{ backgroundColor: data.accent_color }}></span>
                                        <span className="w-8 h-8 rounded-full bg-gray-100"></span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: data.primary_color }}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Estadísticas</h4>
                                            <p className="text-sm text-gray-500">Ejemplo de tarjeta interactiva con ícono principal.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                                        <h4 className="font-bold text-gray-900 mb-2">Botones y Acciones</h4>
                                        <div className="space-y-3">
                                            <button className="w-full py-2 rounded-xl text-white font-medium shadow-md transition-transform hover:-translate-y-0.5" style={{ backgroundColor: data.primary_color }}>
                                                Acción Principal
                                            </button>
                                            <button className="w-full py-2 rounded-xl text-white font-medium shadow-md transition-transform hover:-translate-y-0.5" style={{ background: `linear-gradient(to right, var(--preview-primary), var(--preview-accent))` }}>
                                                Acción con Acento
                                            </button>
                                            <button className="w-full py-2 rounded-xl font-medium border-2 bg-white" style={{ borderColor: data.primary_color, color: data.primary_color }}>
                                                Acción Secundaria
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
