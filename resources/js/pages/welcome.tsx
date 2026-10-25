import { Head, Link, usePage } from '@inertiajs/react';
import { home, login } from '@/routes';

export default function Welcome() {
    const { ui } = usePage().props as any;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <Head
                title={
                    ui?.org_initial
                        ? `${ui.org_initial} Attendance Monitoring`
                        : 'Attendance Monitoring'
                }
            />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-primary-500/30 bg-primary-700 shadow-lg dark:bg-primary-800">
                <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between p-4">
                    <Link
                        href={home().url}
                        className="flex items-center space-x-3 rtl:space-x-reverse"
                    >
                        {ui?.org_logo_base64 ? (
                            <img
                                className="h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
                                src={ui.org_logo_base64}
                                alt="School Logo"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white md:h-16 md:w-16">
                                Logo
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-start text-xs font-bold text-white md:text-base lg:text-lg">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="my-0.5 h-px border-0 bg-white/20" />
                            <h2 className="text-start text-[10px] font-medium text-white/80 md:text-xs">
                                Attendance Monitoring System
                            </h2>
                        </div>
                    </Link>

                    <div className="hidden w-full lg:block lg:w-auto">
                        <ul className="mt-4 flex flex-col p-4 font-medium lg:mt-0 lg:flex-row lg:space-x-8 lg:p-0 rtl:space-x-reverse">
                            <li>
                                <a
                                    href="#services"
                                    className="block px-3 py-2 font-medium text-white/90 hover:text-white"
                                >
                                    Services
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className="block px-3 py-2 font-medium text-white/90 hover:text-white"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <Link
                                    href={login().url}
                                    className="block px-3 py-2 font-medium text-white/90 hover:text-white"
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            <main className="relative container mx-auto flex flex-col px-4">
                {/* Hero Section */}
                <div
                    id="main-welcome"
                    className="mx-auto my-16 flex max-w-7xl items-center justify-center px-4 sm:px-6 md:my-24 md:px-10 lg:my-36"
                >
                    <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:gap-10 lg:gap-12">
                        {ui?.org_logo_base64 ? (
                            <img
                                className="order-1 h-32 w-32 rounded-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 sm:h-40 sm:w-40 md:h-56 md:w-56 lg:h-72 lg:w-72"
                                src={ui.org_logo_base64}
                                alt="Organization Logo"
                            />
                        ) : (
                            <div className="order-1 flex h-32 w-32 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600 shadow-xl sm:h-40 sm:w-40 md:h-56 md:w-56 lg:h-72 lg:w-72" />
                        )}

                        <div className="order-2 flex flex-col items-center text-center">
                            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl md:text-3xl dark:text-white">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="my-3 h-0.5 w-full max-w-xs border-0 bg-slate-300 dark:bg-slate-700" />
                            <h2 className="text-lg font-bold text-slate-700 sm:text-xl md:text-2xl dark:text-slate-200">
                                Attendance Monitoring System
                            </h2>
                            <h4 className="my-3 text-sm font-semibold tracking-wider text-slate-500 uppercase sm:text-base dark:text-slate-400">
                                Developed by
                            </h4>
                            <h3 className="text-2xl font-black text-primary-600 sm:text-3xl dark:text-primary-400">
                                OwlQuery
                            </h3>
                        </div>

                        <div className="order-3 shrink-0">
                            <img
                                className="block h-auto w-40 transition-transform duration-300 ease-in-out hover:scale-105 sm:w-48 md:w-56 lg:w-60 dark:hidden"
                                src="/img/OwlQuery.png"
                                alt="OwlQuery"
                            />
                            <img
                                className="hidden h-auto w-40 transition-transform duration-300 ease-in-out hover:scale-105 sm:w-48 md:w-56 lg:w-60 dark:block"
                                src="/img/OwlQuery Dark.png"
                                alt="OwlQuery Dark"
                            />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div
                    id="about"
                    className="flex min-h-[70vh] items-center justify-center py-16 sm:py-24"
                >
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row md:gap-12 lg:gap-16 lg:px-8">
                        <div className="flex shrink-0 justify-center md:w-1/3">
                            <img
                                className="h-48 w-48 object-contain sm:h-56 sm:w-56 md:h-auto md:w-full"
                                src="/gif/OwlQuery.gif"
                                alt="OwlQuery Animated Logo"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                                About the System
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
                                A streamlined solution for monitoring
                                attendance. It offers efficient tracking and
                                reporting processes, enhancing user experience
                                and administrative operations.
                            </p>
                            <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
                                With features like real-time logging, user
                                management, and detailed analytics, it
                                simplifies attendance administration and
                                improves data accuracy.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div
                    id="services"
                    className="flex min-h-screen flex-col justify-center py-16 sm:py-24"
                >
                    <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                        Our Services
                    </h2>
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-3 lg:px-8">
                        <ServiceCard
                            title="Attendance Tracking"
                            description="Efficiently monitor and manage attendance with real-time logging and automated record-keeping."
                        />
                        <ServiceCard
                            title="User Management"
                            description="Create and manage user accounts for students and staff, allowing them to track their attendance seamlessly."
                        />
                        <ServiceCard
                            title="Reporting and Analytics"
                            description="Gain valuable insights into attendance patterns and performance with detailed reports and analytics tools."
                        />
                        <ServiceCard
                            title="Resource Management"
                            description="Keep track of library and laboratory resources, ensuring availability for all users."
                        />
                        <ServiceCard
                            title="Real-time Notifications"
                            description="Stay informed with instant updates and notifications regarding attendance status and system activities."
                        />
                        <ServiceCard
                            title="Security and Authentication"
                            description="Implement robust security measures to protect sensitive attendance data and user information."
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-10 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
                    <div className="md:flex md:justify-between md:gap-6 lg:gap-8">
                        <div className="mb-6 md:mb-0 md:max-w-xs lg:max-w-md">
                            <a
                                href={ui?.social_links?.website || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                {ui?.org_logo_base64 && (
                                    <img
                                        src={ui.org_logo_base64}
                                        className="me-3 h-12 w-12 shrink-0 rounded-full object-cover md:h-16 md:w-16"
                                        alt="Logo"
                                    />
                                )}
                                <div className="min-w-0">
                                    <span className="self-center text-sm font-semibold wrap-break-word md:text-lg dark:text-white">
                                        {ui?.org_name || 'Organization Name'}
                                    </span>
                                    <p className="mt-1 text-xs wrap-break-word text-gray-500 dark:text-gray-400">
                                        {ui?.org_address || 'Address not set'}
                                    </p>
                                </div>
                            </a>
                            <p className="mt-4 text-xs text-gray-500 md:text-sm dark:text-gray-400">
                                Attendance Monitoring System for managing school
                                attendance and resources.
                            </p>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-6">
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                                    Official Links
                                </h2>
                                <ul className="font-medium text-gray-500 dark:text-gray-400">
                                    <li className="mb-4">
                                        <a
                                            href={
                                                ui?.social_links?.website || '#'
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            Official Website
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                                    Follow us
                                </h2>
                                <ul className="font-medium text-gray-500 dark:text-gray-400">
                                    {ui?.social_links?.facebook && (
                                        <li className="mb-4">
                                            <a
                                                href={ui.social_links.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                Facebook
                                            </a>
                                        </li>
                                    )}
                                    {ui?.social_links?.twitter && (
                                        <li className="mb-4">
                                            <a
                                                href={ui.social_links.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                Twitter
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                                    Contact Us
                                </h2>
                                <ul className="font-medium text-gray-500 dark:text-gray-400">
                                    {ui?.contact_number && (
                                        <li className="mb-4">
                                            <a
                                                href={`tel:${ui.contact_number}`}
                                                className="hover:underline"
                                            >
                                                {ui.contact_number}
                                            </a>
                                        </li>
                                    )}
                                    {ui?.email && (
                                        <li className="mb-4">
                                            <a
                                                href={`mailto:${ui.email}`}
                                                className="hover:underline"
                                            >
                                                {ui.email}
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700" />
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                            &copy; {new Date().getFullYear()} OwlQuery Group.
                            All Rights Reserved.
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ServiceCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-lg border border-transparent bg-white p-6 shadow-md transition duration-300 hover:border-tertiary-500 hover:shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    );
}
