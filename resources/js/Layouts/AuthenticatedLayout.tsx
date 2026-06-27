import Dropdown from '@/Components/Dropdown';
import SidebarNavLink from '@/Components/SidebarNavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingMobileDrawer, setShowingMobileDrawer] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-shrink-0 bg-gray-900 md:flex md:flex-col">
                {/* Logo Area */}
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-800 px-6">
                    <span className="text-xl font-bold tracking-wider text-white uppercase">
                        <span className="text-blue-500">TMS</span>
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Panel de Control
                    </SidebarNavLink>
                    <SidebarNavLink href={route('vehicles.index')} active={route().current('vehicles.index')}>
                        Vehículos
                    </SidebarNavLink>
                    <SidebarNavLink href={route('drivers.index')} active={route().current('drivers.index')}>
                        Conductores
                    </SidebarNavLink>
                    <SidebarNavLink href={route('routes.index')} active={route().current('routes.index')}>
                        Rutas
                    </SidebarNavLink>
                    <SidebarNavLink href={route('schedules.index')} active={route().current('schedules.index')}>
                        Horarios
                    </SidebarNavLink>
                    <SidebarNavLink href={route('clients.index')} active={route().current('clients.index')}>
                        Clientes
                    </SidebarNavLink>
                    <SidebarNavLink href={route('trips.index')} active={route().current('trips.index')}>
                        Viajes
                    </SidebarNavLink>
                    <SidebarNavLink href={route('tickets.index')} active={route().current('tickets.index')}>
                        Boletos
                    </SidebarNavLink>
                    <SidebarNavLink href={route('packages.index')} active={route().current('packages.index')}>
                        Encomiendas
                    </SidebarNavLink>

                </div>
            </aside>

            {/* Mobile Drawer (Menu) */}
            <div className={(showingMobileDrawer ? 'fixed' : 'hidden') + ' fixed inset-0 z-50 bg-black/60 md:hidden'} onClick={() => setShowingMobileDrawer(false)}></div>

            <div className={(showingMobileDrawer ? 'translate-x-0' : '-translate-x-full') + ' fixed inset-y-0 left-0 z-50 w-72 transform bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden flex flex-col'}>
                {/* Cabecera del cajón */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-6">
                    <span className="text-xl font-bold tracking-wider text-white uppercase">
                        <span className="text-blue-500">TMS</span>
                    </span>
                    <button onClick={() => setShowingMobileDrawer(false)} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido de navegación del cajón (AHORA SINCRONIZADO) */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Panel de Control
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('vehicles.index')} active={route().current('vehicles.index')}>
                        Vehículos
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('drivers.index')} active={route().current('drivers.index')}>
                        Conductores
                    </ResponsiveNavLink>
                    {/* ENLACES MÓVILES AGREGADOS AQUÍ */}
                    <ResponsiveNavLink href={route('routes.index')} active={route().current('routes.index')}>
                        Rutas
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('schedules.index')} active={route().current('schedules.index')}>
                        Horarios
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.index')}>
                        Clientes
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('trips.index')} active={route().current('trips.index')}>
                        Viajes
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('tickets.index')} active={route().current('tickets.index')}>
                        Boletos
                    </ResponsiveNavLink>
                    <SidebarNavLink href={route('packages.index')} active={route().current('packages.index')}>
                        Encomiendas
                    </SidebarNavLink>

                </div>

                {/* Sección de usuario del cajón (abajo) */}
                <div className="border-t border-gray-800 pb-4 pt-4 px-6 bg-gray-950">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                        <div className="ms-3">
                            <div className="text-base font-medium text-white">{user.name}</div>
                            <div className="text-sm font-medium text-gray-400">{user.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                        <ResponsiveNavLink method="post" href={route('logout')} as="button">
                            Cerrar Sesión
                        </ResponsiveNavLink>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="flex h-16 shrink-0 items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8 dark:bg-gray-800 md:justify-end">

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setShowingMobileDrawer(!showingMobileDrawer)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingMobileDrawer ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingMobileDrawer ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Settings Dropdown (Desktop) */}
                    <div className="hidden md:flex md:items-center">
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-600 transition duration-150 ease-in-out hover:text-gray-800 focus:outline-none dark:bg-gray-800 dark:text-gray-300"
                                        >
                                            {user.name}
                                            <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Cerrar Sesión
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}