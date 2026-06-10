import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-[#136c40]">bienvenido</h1>
                <p className="mt-2 text-sm text-gray-500">Inicia sesión en tu cuenta para continuar</p>
            </div>

            <form onSubmit={submit} className="flex flex-col items-center space-y-5 w-full max-w-sm mx-auto">
                <div className="w-full">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Correo electrónico"
                        className="block w-full rounded-full border-none bg-[#d0efe0] px-6 py-3.5 text-center text-[#136c40] font-medium placeholder-[#7abfa1] focus:ring-2 focus:ring-[#136c40]"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2 text-center" />
                </div>

                <div className="w-full">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="Contraseña"
                        className="block w-full rounded-full border-none bg-[#d0efe0] px-6 py-3.5 text-center text-[#136c40] font-medium placeholder-[#7abfa1] focus:ring-2 focus:ring-[#136c40]"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2 text-center" />
                </div>

                {canResetPassword && (
                    <Link
                        href={route('password.request')}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-4 w-3/4 rounded-full bg-[#136c40] px-4 py-3 font-bold tracking-widest text-white transition hover:bg-[#0d4f2f] focus:outline-none focus:ring-2 focus:ring-[#136c40] focus:ring-offset-2 disabled:opacity-50 uppercase text-sm"
                >
                    Iniciar Sesión
                </button>

                <div className="mt-4 text-sm text-gray-500">
                    ¿No tienes una cuenta?{' '}
                    <Link href={route('register')} className="font-bold text-[#136c40] hover:underline">
                        regístrate
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}