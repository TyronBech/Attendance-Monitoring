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
        <div className="flex min-h-screen flex-col justify-between bg-secondary-500 font-sans dark:bg-gray-900">
            {/* Header Navbar */}
            <header className="sticky top-0 z-50">
                <nav className="border-gray-200 bg-primary-700 dark:bg-primary-800">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between p-4">
                        <Link
                            href={home().url}
                            className="flex items-center space-x-3 rtl:space-x-reverse"
                        >
                            {ui?.org_logo ? (
                                <img
                                    className="h-12 w-12 rounded-full object-cover md:h-14 md:w-14"
                                    src={ui.org_logo}
                                    alt="School Logo"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 md:h-14 md:w-14">
                                    Logo
                                </div>
                            )}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-start text-xs font-semibold text-white md:text-sm lg:text-base">
                                    {ui?.org_name || 'School Name'}
                                </h1>
                                <hr className="my-0.5 h-px border-0 bg-gray-200/50" />
                                <h2 className="text-start text-[10px] font-medium text-white/90 md:text-xs">
                                    Attendance Monitoring System
                                </h2>
                            </div>
                        </Link>

                        <div className="hidden w-full lg:block lg:w-auto">
                            <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 p-4 font-medium lg:mt-0 lg:flex-row lg:space-x-8 lg:border-0 lg:bg-primary-700 lg:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-primary-700 lg:dark:bg-primary-800">
                                <li>
                                    <Link
                                        href={home().url}
                                        className="block rounded bg-primary-700 px-3 py-3 text-white lg:border-0 lg:p-0 lg:hover:text-tertiary-500 dark:bg-primary-800 dark:text-white dark:hover:text-white lg:dark:hover:text-tertiary-500"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/#services"
                                        className="block rounded bg-primary-700 px-3 py-3 text-white lg:border-0 lg:p-0 lg:hover:text-tertiary-500 dark:bg-primary-800 dark:text-white dark:hover:text-white lg:dark:hover:text-tertiary-500"
                                    >
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/#about"
                                        className="block rounded bg-primary-700 px-3 py-3 text-white lg:border-0 lg:p-0 lg:hover:text-tertiary-500 dark:bg-primary-800 dark:text-white dark:hover:text-white lg:dark:hover:text-tertiary-500"
                                    >
                                        About
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="my-8 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
                <div className="flex w-full max-w-md flex-col items-center gap-6">
                    {/* Branding Hero Block */}
                    <div className="flex flex-col items-center text-center">
                        {ui?.org_logo ? (
                            <img
                                className="mb-3 h-24 w-24 rounded-full object-cover shadow-md transition-transform duration-300 ease-in-out hover:scale-105 sm:h-28 sm:w-28"
                                src={ui.org_logo}
                                alt="Organization Logo"
                            />
                        ) : (
                            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 p-2 shadow-md dark:bg-gray-800">
                                <AppLogoIcon className="size-12 fill-current text-primary-500 dark:text-white" />
                            </div>
                        )}
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {ui?.org_name || 'School Name'}
                        </h1>
                        <hr className="my-2 h-px w-48 border-0 bg-gray-400 dark:bg-gray-600" />
                        <h2 className="text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-300">
                            Attendance Monitoring System
                        </h2>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Developed by{' '}
                            <strong className="font-semibold text-gray-700 dark:text-gray-200">
                                OwlQuery
                            </strong>
                        </span>
                    </div>

                    {/* Login Card */}
                    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-6 space-y-1 text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200/50 bg-white/60 py-4 backdrop-blur-xs dark:border-gray-800 dark:bg-gray-900/60">
                <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()}{' '}
                    {ui?.org_name || 'OwlQuery Group'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
