import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage();
    const isLogin = url.startsWith('/login');
    const company = (props as any).company;

    const themeStyles = company ? {
        '--color-primary': company.primary_color,
        '--color-bg': company.bg_color,
        '--color-accent': company.accent_color,
    } as React.CSSProperties : {};

    return (
        <div className="flex min-h-screen items-center justify-center bg-theme-bg p-4 sm:p-8" style={themeStyles}>
            <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">

                {/* Panel Izquierdo - Oculto en móviles */}
                <div className="relative hidden w-1/2 flex-col items-center justify-center bg-theme-primary p-12 text-center lg:flex overflow-hidden">
                    {/* Formas circulares decorativas */}
                    <div className="absolute -top-32 -left-32 h-[35rem] w-[35rem] rounded-full bg-white opacity-10"></div>
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black opacity-10"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg text-theme-primary font-bold text-3xl">
                            {company?.name ? company.name.charAt(0) : 'T'}
                        </div>
                        <h2 className="mb-2 text-4xl font-bold text-white tracking-wide">
                            {isLogin ? '¡Bienvenido de nuevo!' : '¡Únete a nosotros!'}
                        </h2>
                        <p className="mb-10 text-sm text-white/80 font-light tracking-wider">
                            Para mantenerte conectado con nosotros<br />por favor {isLogin ? 'inicia sesión con' : 'ingresa'} tus datos
                        </p>

                        {/* Botón alternante (Solo Escritorio) */}
                        <Link
                            href={isLogin ? route('register') : route('login')}
                            className="rounded-full border border-white px-14 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-theme-primary"
                        >
                            {isLogin ? 'REGÍSTRATE' : 'INICIAR SESIÓN'}
                        </Link>
                    </div>
                </div>

                {/* Panel Derecho (Blanco - Contenido del Formulario) */}
                <div className="flex w-full flex-col justify-center bg-white p-8 sm:p-16 lg:w-1/2">

                    {/* Logo para móviles (Solo se ve si la pantalla es pequeña) */}
                    <div className="mb-6 flex justify-center lg:hidden">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary shadow-md text-white font-bold text-2xl">
                            {company?.name ? company.name.charAt(0) : 'T'}
                        </div>
                    </div>

                    {/* Formulario */}
                    {children}

                    {/* NUEVO: Enlace alternante para móviles (Oculto en escritorio) */}
                    <div className="mt-8 text-center lg:hidden">
                        <p className="text-sm text-gray-600 mb-2">
                            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                        </p>
                        <Link
                            href={isLogin ? route('register') : route('login')}
                            className="text-sm font-bold text-theme-primary hover:underline transition-colors"
                        >
                            {isLogin ? 'REGÍSTRATE AQUÍ' : 'INICIA SESIÓN AQUÍ'}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}