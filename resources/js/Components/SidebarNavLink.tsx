import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function SidebarNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'flex items-center w-full px-4 py-3 mt-1 text-sm font-medium transition-colors duration-200 transform rounded-md focus:outline-none ' +
                (active
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}