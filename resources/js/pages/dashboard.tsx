import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <div className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-lg dark:border-sidebar-border dark:bg-neutral-900">
                        <div className="bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-8 py-10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                                    <Construction className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Dashboard
                                </h2>
                                <div className="mb-4 h-1 w-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-600" />
                                <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    For Future Implementation
                                </p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                                    This section is currently under development.
                                    Check back soon for updates.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center border-t border-sidebar-border/70 px-8 py-4 dark:border-sidebar-border">
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                                <span>In Progress</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
