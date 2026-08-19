import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { ui } = usePage().props as any;

    return (
        <div className="min-h-screen bg-secondary-500 font-sans dark:bg-gray-900 flex flex-col justify-between">
            {/* Header Navbar */}
            <header className="sticky top-0 z-50">
                <nav className="bg-primary-500 border-gray-200 dark:bg-primary-500">
                    <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
                        <Link href={home().url} className="flex items-center space-x-3 rtl:space-x-reverse">
                            {ui?.org_logo ? (
                                <img 
                                    className="rounded-full w-12 h-12 md:w-14 md:h-14 object-cover" 
                                    src={ui.org_logo} 
                                    alt="School Logo" 
                                />
                            ) : (
                                <div className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                    Logo
                                </div>
                            )}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-xs md:text-sm lg:text-base text-white font-semibold text-start">
                                    {ui?.org_name || 'School Name'}
                                </h1>
                                <hr className="h-px my-0.5 bg-gray-200/50 border-0" />
                                <h2 className="text-[10px] md:text-xs text-white/90 font-medium text-start">
                                    Attendance Monitoring System
                                </h2>
                            </div>
                        </Link>
                        
                        <div className="hidden w-full lg:block lg:w-auto">
                            <ul className="flex flex-col font-medium p-4 lg:p-0 mt-4 border border-gray-100 rounded-lg bg-primary-500 lg:flex-row lg:space-x-8 rtl:space-x-reverse lg:mt-0 lg:border-0 lg:bg-primary-500 dark:bg-primary-500 lg:dark:bg-primary-500 dark:border-gray-700">
                                <li>
                                    <Link href={home().url} className="block py-2 px-3 text-white rounded hover:bg-tertiary-500 lg:hover:bg-transparent lg:border-0 lg:hover:text-tertiary-500 lg:p-0 dark:text-white lg:dark:hover:text-tertiary-500 dark:hover:bg-tertiary-500 dark:hover:text-white lg:dark:hover:bg-transparent">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <a href="/#services" className="block py-2 px-3 text-white rounded hover:bg-tertiary-500 lg:hover:bg-transparent lg:border-0 lg:hover:text-tertiary-500 lg:p-0 dark:text-white lg:dark:hover:text-tertiary-500 dark:hover:bg-tertiary-500 dark:hover:text-white lg:dark:hover:bg-transparent">
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a href="/#about" className="block py-2 px-3 text-white rounded hover:bg-tertiary-500 lg:hover:bg-transparent lg:border-0 lg:hover:text-tertiary-500 lg:p-0 dark:text-white lg:dark:hover:text-tertiary-500 dark:hover:bg-tertiary-500 dark:hover:text-white lg:dark:hover:bg-transparent">
                                        About
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 my-8">
                <div className="w-full max-w-md flex flex-col items-center gap-6">
                    {/* Branding Hero Block */}
                    <div className="flex flex-col items-center text-center">
                        {ui?.org_logo ? (
                            <img
                                className="rounded-full w-24 h-24 sm:w-28 sm:h-28 object-cover shadow-md mb-3 transition-transform duration-300 ease-in-out hover:scale-105"
                                src={ui.org_logo}
                                alt="Organization Logo"
                            />
                        ) : (
                            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 p-2 shadow-md dark:bg-gray-800">
                                <AppLogoIcon className="size-12 fill-current text-primary-500 dark:text-white" />
                            </div>
                        )}
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {ui?.org_name || 'School Name'}
                        </h1>
                        <hr className="w-48 h-px bg-gray-400 dark:bg-gray-600 border-0 my-2" />
                        <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                            Attendance Monitoring System
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Developed by <strong className="font-semibold text-gray-700 dark:text-gray-200">OwlQuery</strong>
                        </span>
                    </div>

                    {/* Login Card */}
                    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                        <div className="mb-6 text-center space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                            {description && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs py-4 border-t border-gray-200/50 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} {ui?.org_name || 'OwlQuery Group'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}

