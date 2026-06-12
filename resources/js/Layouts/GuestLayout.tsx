import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const isLogin = url.startsWith('/login');

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-8">
            <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">

                {/* Panel Izquierdo (Verde Oscuro) - Oculto en móviles */}
                <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#136c40] p-12 text-center lg:flex overflow-hidden">
                    {/* Formas circulares decorativas */}
                    <div className="absolute -top-32 -left-32 h-[35rem] w-[35rem] rounded-full bg-[#187f4c] opacity-50"></div>
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#0d4f2f] opacity-50"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Logo Fuego */}
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                            <svg className="h-10 w-10 text-[#136c40]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.64,5.93h0l1.4,2.05a1.85,1.85,0,0,0,3,.14L17.84,6a.54.54,0,0,1,.87.48C18.4,11.23,15.26,17,12,17s-6.3-5.67-6.66-10.42a.54.54,0,0,1,.85-.51l1.6,1.44a1.86,1.86,0,0,0,2.89-.35Z" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-4xl font-bold text-white tracking-wide">
                            {isLogin ? '¡Bienvenido de nuevo!' : '¡Únete a nosotros!'}
                        </h2>
                        <p className="mb-10 text-sm text-[#9ed3b5] font-light tracking-wider">
                            Para mantenerte conectado con nosotros<br />por favor {isLogin ? 'inicia sesión con' : 'ingresa'} tus datos
                        </p>

                        {/* Botón alternante (Solo Escritorio) */}
                        <Link
                            href={isLogin ? route('register') : route('login')}
                            className="rounded-full border border-white px-14 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#136c40]"
                        >
                            {isLogin ? 'REGÍSTRATE' : 'INICIAR SESIÓN'}
                        </Link>
                    </div>
                </div>

                {/* Panel Derecho (Blanco - Contenido del Formulario) */}
                <div className="flex w-full flex-col justify-center bg-white p-8 sm:p-16 lg:w-1/2">

                    {/* Logo Fuego para móviles (Solo se ve si la pantalla es pequeña) */}
                    <div className="mb-6 flex justify-center lg:hidden">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#136c40] shadow-md">
                            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.64,5.93h0l1.4,2.05a1.85,1.85,0,0,0,3,.14L17.84,6a.54.54,0,0,1,.87.48C18.4,11.23,15.26,17,12,17s-6.3-5.67-6.66-10.42a.54.54,0,0,1,.85-.51l1.6,1.44a1.86,1.86,0,0,0,2.89-.35Z" />
                            </svg>
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
                            className="text-sm font-bold text-[#136c40] hover:underline transition-colors"
                        >
                            {isLogin ? 'REGÍSTRATE AQUÍ' : 'INICIA SESIÓN AQUÍ'}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}