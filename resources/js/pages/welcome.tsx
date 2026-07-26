import { Head, Link, usePage } from '@inertiajs/react';
import { home, login } from '@/routes';

export default function Welcome() {
    const { ui } = usePage().props as any;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Head title={ui?.org_initial ? `${ui.org_initial} Attendance Monitoring` : 'Attendance Monitoring'} />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-primary-600 dark:bg-slate-900 shadow-lg border-b border-primary-500/30">
                <nav className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link href={home().url} className="flex items-center space-x-3 rtl:space-x-reverse">
                        {ui?.org_logo ? (
                            <img
                                className="rounded-full w-12 h-12 md:w-16 md:h-16 object-cover border-2 border-white/20"
                                src={ui.org_logo}
                                alt="School Logo"
                            />
                        ) : (
                            <div className="rounded-full w-12 h-12 md:w-16 md:h-16 bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                                Logo
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xs md:text-base lg:text-lg text-white font-bold text-start">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="h-px my-0.5 bg-white/20 border-0" />
                            <h2 className="text-[10px] md:text-xs text-white/80 font-medium text-start">
                                Attendance Monitoring System
                            </h2>
                        </div>
                    </Link>

                    <div className="hidden w-full lg:block lg:w-auto">
                        <ul className="flex flex-col font-medium p-4 lg:p-0 mt-4 lg:flex-row lg:space-x-8 rtl:space-x-reverse lg:mt-0">
                            <li>
                                <a href="#services" className="block py-2 px-3 text-white/90 font-medium hover:text-white">
                                    Services
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="block py-2 px-3 text-white/90 font-medium hover:text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <Link
                                    href={login().url}
                                    className="block py-2 px-3 text-white/90 font-medium hover:text-white"
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            <main className="container relative mx-auto px-4 flex flex-col">
                {/* Hero Section */}
                <div id="main-welcome" className="flex items-center justify-center max-w-7xl my-16 md:my-24 lg:my-36 mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12 w-full">
                        {ui?.org_logo ? (
                            <img
                                className="order-1 rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-cover shadow-xl transition-transform duration-300 ease-in-out hover:scale-105"
                                src={ui.org_logo}
                                alt="Organization Logo"
                            />
                        ) : (
                            <div className="order-1 rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xl shadow-xl" />
                        )}

                        <div className="order-2 flex flex-col items-center text-center">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="w-full max-w-xs h-0.5 bg-slate-300 dark:bg-slate-700 border-0 my-3" />
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200">
                                Attendance Monitoring System
                            </h2>
                            <h4 className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400 my-3 uppercase tracking-wider">
                                Developed by
                            </h4>
                            <h3 className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">
                                OwlQuery
                            </h3>
                        </div>

                        <div className="order-3 shrink-0">
                            <img
                                className="block dark:hidden w-40 sm:w-48 md:w-56 lg:w-60 h-auto transition-transform duration-300 ease-in-out hover:scale-105"
                                src="/img/OwlQuery.png"
                                alt="OwlQuery"
                            />
                            <img
                                className="hidden dark:block w-40 sm:w-48 md:w-56 lg:w-60 h-auto transition-transform duration-300 ease-in-out hover:scale-105"
                                src="/img/OwlQuery Dark.png"
                                alt="OwlQuery Dark"
                            />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div id="about" className="min-h-[70vh] flex items-center justify-center py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
                        <div className="md:w-1/3 shrink-0 flex justify-center">
                            <img
                                className="w-48 h-48 sm:w-56 sm:h-56 md:w-full md:h-auto object-contain"
                                src="/gif/OwlQuery.gif"
                                alt="OwlQuery Animated Logo"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                About the System
                            </h2>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                                A streamlined solution for monitoring attendance. It offers efficient tracking and reporting processes, enhancing user experience and administrative operations.
                            </p>
                            <p className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                                With features like real-time logging, user management, and detailed analytics, it simplifies attendance administration and improves data accuracy.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div id="services" className="min-h-screen flex flex-col justify-center py-16 sm:py-24">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-gray-900 dark:text-white mb-12">
                        Our Services
                    </h2>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
            <footer className="bg-white dark:bg-gray-900 mt-10 border-t border-gray-200 dark:border-gray-700">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
                    <div className="md:flex md:justify-between md:gap-6 lg:gap-8">
                        <div className="mb-6 md:mb-0 md:max-w-xs lg:max-w-md">
                            <a href={ui?.social_links?.website || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                {ui?.org_logo && (
                                    <img src={ui.org_logo} className="h-12 w-12 md:h-16 md:w-16 me-3 rounded-full shrink-0 object-cover" alt="Logo" />
                                )}
                                <div className="min-w-0">
                                    <span className="self-center text-sm md:text-lg font-semibold dark:text-white wrap-break-word">
                                        {ui?.org_name || 'Organization Name'}
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 wrap-break-word">
                                        {ui?.org_address || 'Address not set'}
                                    </p>
                                </div>
                            </a>
                            <p className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                Attendance Monitoring System for managing school attendance and resources.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 sm:gap-6 sm:grid-cols-3 flex-1">
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Official Links</h2>
                                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                    <li className="mb-4">
                                        <a href={ui?.social_links?.website || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">Official Website</a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow us</h2>
                                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                    {ui?.social_links?.facebook && (
                                        <li className="mb-4">
                                            <a href={ui.social_links.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
                                        </li>
                                    )}
                                    {ui?.social_links?.twitter && (
                                        <li className="mb-4">
                                            <a href={ui.social_links.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Contact Us</h2>
                                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                    {ui?.contact_number && (
                                        <li className="mb-4">
                                            <a href={`tel:${ui.contact_number}`} className="hover:underline">{ui.contact_number}</a>
                                        </li>
                                    )}
                                    {ui?.email && (
                                        <li className="mb-4">
                                            <a href={`mailto:${ui.email}`} className="hover:underline">{ui.email}</a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                            &copy; {new Date().getFullYear()} OwlQuery Group. All Rights Reserved.
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ServiceCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 transition duration-300 shadow-md hover:shadow-lg border border-transparent hover:border-tertiary-500">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    );
}
