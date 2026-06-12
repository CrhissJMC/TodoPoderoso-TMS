import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Panel de Control" />

            {/* Reduje el padding de py-12 a py-6 para quitar ese espacio excesivo */}
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Mensaje principal del Proyecto */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-400 text-xl font-bold">
                            Bienvenido a Proyecto TSM
                        </div>
                    </div>

                    {/* Tarjetas de visualización de ejemplo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Tarjeta 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Total Clientes</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2 dark:text-white">1,250</p>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Usuarios Activos</h3>
                            <p className="text-3xl font-bold text-blue-500 mt-2">48</p>
                        </div>

                        {/* Tarjeta 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Ingresos Mensuales</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2 dark:text-white">$12,400</p>
                        </div>

                        {/* Tarjeta 4 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">Crecimiento</h3>
                            <p className="text-3xl font-bold text-green-500 mt-2">+15.3%</p>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}