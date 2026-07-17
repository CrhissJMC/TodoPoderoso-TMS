import Dropdown from '@/Components/Dropdown';
import SidebarNavLink from '@/Components/SidebarNavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

import ErrorBoundary from '@/Components/ErrorBoundary';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, role, permissions = [] } = (usePage().props as any).auth;
    const { company } = usePage().props as any;

    const themeStyles = company ? {
        '--color-primary': company.primary_color,
        '--color-bg': company.bg_color,
        '--color-accent': company.accent_color,
    } as React.CSSProperties : {};

    const hasAccess = (module: string) => {
        return permissions.includes(`${module}.ver`) || permissions.includes(`${module}.admin`);
    };
    const [showingMobileDrawer, setShowingMobileDrawer] = useState(false);

    const isDriverInRenewal = user?.driver?.status === 'en_renovacion';

    // Si el conductor está en renovación, devolvemos un layout bloqueado
    if (isDriverInRenewal) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4" style={themeStyles}>
                <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 text-center space-y-6 border border-red-500/30">
                    <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wider mb-2">Renovar su Licencia</h2>
                        <p className="text-gray-300 text-sm">
                            Su licencia de conducir está a punto de vencer o ha vencido. Por motivos de seguridad y políticas internas, no puede acceder al sistema hasta que regularice su situación.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                        <Link href={route('logout')} method="post" as="button" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors w-full">
                            Cerrar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-theme-bg" style={themeStyles}>
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-shrink-0 bg-gray-900 md:flex md:flex-col">
                {/* Logo Area */}
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-800 px-6 gap-2">
                    <span className="text-xl font-bold tracking-wider text-white uppercase">
                        {company?.name ? company.name.split(' ')[0] : 'TodoPoderoso'} <span className="text-theme-primary">TMS</span>
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Panel de Control
                    </SidebarNavLink>
                    {hasAccess('vehiculos') && (
                        <SidebarNavLink href={route('vehicles.index')} active={route().current('vehicles.index')}>
                            Vehículos
                        </SidebarNavLink>
                    )}
                    {hasAccess('conductores') && (
                        <SidebarNavLink href={route('drivers.index')} active={route().current('drivers.index')}>
                            Conductores
                        </SidebarNavLink>
                    )}
                    {hasAccess('rutas') && (
                        <SidebarNavLink href={route('routes.index')} active={route().current('routes.index')}>
                            Rutas
                        </SidebarNavLink>
                    )}
                    {hasAccess('horarios') && (
                        <SidebarNavLink href={route('schedules.index')} active={route().current('schedules.index')}>
                            Horarios
                        </SidebarNavLink>
                    )}
                    {hasAccess('clientes') && (
                        <SidebarNavLink href={route('clients.index')} active={route().current('clients.index')}>
                            Clientes
                        </SidebarNavLink>
                    )}
                    {hasAccess('viajes') && (
                        <SidebarNavLink href={route('trips.index')} active={route().current('trips.index')}>
                            Viajes
                        </SidebarNavLink>
                    )}
                    {hasAccess('boletos') && (
                        <SidebarNavLink href={route('tickets.index')} active={route().current('tickets.index')}>
                            Boletos
                        </SidebarNavLink>
                    )}
                    {hasAccess('encomiendas') && (
                        <SidebarNavLink href={route('packages.index')} active={route().current('packages.index')}>
                            Encomiendas
                        </SidebarNavLink>
                    )}
                    {role === 'administrador' && (
                        <div className="pt-4 mt-4 border-t border-gray-800">
                            <SidebarNavLink href={route('admin.company.edit')} active={route().current('admin.company.edit')}>
                                Empresa
                            </SidebarNavLink>
                            <SidebarNavLink href={route('users.index')} active={route().current('users.index')}>
                                Usuarios
                            </SidebarNavLink>
                            <SidebarNavLink href={route('roles.index')} active={route().current('roles.index')}>
                                Roles y Permisos
                            </SidebarNavLink>
                        </div>
                    )}

                </div>
            </aside>

            {/* Mobile Drawer (Menu) */}
            <div className={(showingMobileDrawer ? 'fixed' : 'hidden') + ' fixed inset-0 z-50 bg-black/60 md:hidden'} onClick={() => setShowingMobileDrawer(false)}></div>

            <div className={(showingMobileDrawer ? 'translate-x-0' : '-translate-x-full') + ' fixed inset-y-0 left-0 z-50 w-72 transform bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden flex flex-col'}>
                {/* Cabecera del cajón */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-6">
                    <span className="text-xl font-bold tracking-wider text-white uppercase">
                        {company?.name ? company.name.split(' ')[0] : 'TodoPoderoso'} <span className="text-theme-primary">TMS</span>
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
                    {hasAccess('vehiculos') && (
                        <ResponsiveNavLink href={route('vehicles.index')} active={route().current('vehicles.index')}>
                            Vehículos
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('conductores') && (
                        <ResponsiveNavLink href={route('drivers.index')} active={route().current('drivers.index')}>
                            Conductores
                        </ResponsiveNavLink>
                    )}
                    {/* ENLACES MÓVILES AGREGADOS AQUÍ */}
                    {hasAccess('rutas') && (
                        <ResponsiveNavLink href={route('routes.index')} active={route().current('routes.index')}>
                            Rutas
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('horarios') && (
                        <ResponsiveNavLink href={route('schedules.index')} active={route().current('schedules.index')}>
                            Horarios
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('clientes') && (
                        <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.index')}>
                            Clientes
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('viajes') && (
                        <ResponsiveNavLink href={route('trips.index')} active={route().current('trips.index')}>
                            Viajes
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('boletos') && (
                        <ResponsiveNavLink href={route('tickets.index')} active={route().current('tickets.index')}>
                            Boletos
                        </ResponsiveNavLink>
                    )}
                    {hasAccess('encomiendas') && (
                        <ResponsiveNavLink href={route('packages.index')} active={route().current('packages.index')}>
                            Encomiendas
                        </ResponsiveNavLink>
                    )}
                    {role === 'administrador' && (
                        <div className="pt-2 mt-2 border-t border-gray-800">
                            <ResponsiveNavLink href={route('admin.company.edit')} active={route().current('admin.company.edit')}>
                                Empresa
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('users.index')} active={route().current('users.index')}>
                                Usuarios
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('roles.index')} active={route().current('roles.index')}>
                                Roles y Permisos
                            </ResponsiveNavLink>
                        </div>
                    )}

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
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}