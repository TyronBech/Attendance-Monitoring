import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { home } from '@/routes';
import ClockDisplay from './components/clock-display';
import PCInputForm from './components/pc-input-form';
import RFIDForm from './components/rfid-form';
import VisitorForm from './components/visitor-form';

const AVATAR_RETRY_LIMIT = 2;
const RECENT_SCANS_KEEP_ALIVE_INTERVAL_MS = 1000;

type RecentScan = {
    id: string | number;
    name: string;
    groupName: string;
    timeLabel: string;
    type: string;
    image?: string | null;
};

function getRecentScanGroupLabel(scan: RecentScan) {
    const normalizedGroup = String(scan?.groupName || '').trim().toLowerCase();

    if (normalizedGroup === 'visitor') {
return 'Visitor';
}

    if (normalizedGroup === 'student') {
return 'Student';
}

    return 'Employee';
}

function getAvatarInitials(name = '') {
    return String(name || 'L')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'LU';
}

function hasAvatarImage(imageSource = '') {
    if (typeof imageSource !== 'string') {
return false;
}

    const normalized = imageSource.trim().toLowerCase();

    return normalized !== '' && !normalized.includes('id_default.png') && !normalized.includes('sncs-logo');
}

function buildRetryableAvatarSource(imageSource: string | null | undefined, attempt: number) {
    if (typeof imageSource !== 'string' || imageSource.trim() === '') {
return '';
}

    if (imageSource.startsWith('data:image/')) {
return imageSource;
}

    if (attempt <= 0) {
return imageSource;
}

    const separator = imageSource.includes('?') ? '&' : '?';

    return `${imageSource}${separator}retry=${attempt}`;
}

function RecentScanAvatar({ scan }: { scan: RecentScan }) {
    const imageSource = typeof scan?.image === 'string' ? scan.image.trim() : '';
    const [prevImageSource, setPrevImageSource] = useState(imageSource);
    const [retryCount, setRetryCount] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    if (prevImageSource !== imageSource) {
        setPrevImageSource(imageSource);
        setRetryCount(0);
        setImageFailed(false);
    }

    const resolvedImageSource = buildRetryableAvatarSource(imageSource, retryCount);
    const canShowImage = hasAvatarImage(imageSource) && !imageFailed;

    function handleImageError() {
        if (retryCount < AVATAR_RETRY_LIMIT) {
            setRetryCount((currentCount) => currentCount + 1);

            return;
        }

        setImageFailed(true);
    }

    if (!canShowImage) {
        return <>{getAvatarInitials(scan?.name)}</>;
    }

    return (
        <img
            src={resolvedImageSource}
            alt=""
            className="w-full h-full object-cover"
            onError={handleImageError}
        />
    );
}

export default function AttendanceIndex() {
    const {
        ui = {},
        recentScans = [],
    } = usePage().props as any;

    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [showPcForm, setShowPcForm] = useState(false);
    const [, setIsGlobalLoading] = useState(false);
    const [prevRecentScans, setPrevRecentScans] = useState(recentScans);
    const [recentActivity, setRecentActivity] = useState<RecentScan[]>(Array.isArray(recentScans) ? recentScans : []);

    if (prevRecentScans !== recentScans) {
        setPrevRecentScans(recentScans);
        setRecentActivity(Array.isArray(recentScans) ? recentScans : []);
    }

    const isRecentScansRequestInFlightRef = useRef(false);

    const handleScanSuccess = (scanEntry: RecentScan) => {
        if (!scanEntry) {
return;
}

        setRecentActivity((currentEntries) => [
            scanEntry,
            ...currentEntries.filter((entry) => entry.id !== scanEntry.id),
        ].slice(0, 5));
    };

    const syncRecentScans = () => {
        if (isRecentScansRequestInFlightRef.current) {
return;
}

        isRecentScansRequestInFlightRef.current = true;

        fetch('/attendance/recent-scans', {
            method: 'GET',
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json().catch(() => ({})))
            .then((data) => {
                if (data.status === 'success' && Array.isArray(data.recentScans)) {
                    setRecentActivity(data.recentScans);
                }
            })
            .catch(() => {})
            .finally(() => {
                isRecentScansRequestInFlightRef.current = false;
            });
    };

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
return undefined;
}

        const pollIntervalId = window.setInterval(() => {
            syncRecentScans();
        }, RECENT_SCANS_KEEP_ALIVE_INTERVAL_MS);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
syncRecentScans();
}
        };

        const handleWindowFocus = () => {
            syncRecentScans();
        };

        syncRecentScans();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(pollIntervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    const getBadgeVariant = (type: string) => {
        if (type === 'Time Out') {
return 'bg-rose-100 text-rose-700 border-rose-200';
}

        if (type === 'Online Research Use') {
return 'bg-blue-100 text-blue-700 border-blue-200';
}

        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    return (
        <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 font-sans flex flex-col justify-between transition-colors duration-300">
            <Head title="Attendance Monitoring | Time In & Time Out" />

            {/* Header Navbar */}
            <header className="sticky top-0 z-40 bg-primary-600 dark:bg-slate-900 shadow-lg border-b border-primary-500/30">
                <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link href={home().url} className="flex items-center space-x-3 rtl:space-x-reverse">
                        {ui?.org_logo ? (
                            <img
                                className="rounded-full w-12 h-12 md:w-14 md:h-14 object-cover border-2 border-white/20"
                                src={ui.org_logo}
                                alt="School Logo"
                            />
                        ) : (
                            <div className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                                Logo
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xs md:text-sm lg:text-base text-white font-bold text-start">
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
                                <Link href={home().url} className="block py-2 px-3 text-white font-bold rounded hover:text-white/80">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <a href="/#services" className="block py-2 px-3 text-white/90 font-medium hover:text-white">
                                    Services
                                </a>
                            </li>
                            <li>
                                <a href="/#about" className="block py-2 px-3 text-white/90 font-medium hover:text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <Link href="/login" className="block py-2 px-3 text-white/90 font-medium hover:text-white">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            <PCInputForm
                showForm={showPcForm}
                onClose={() => setShowPcForm(false)}
                onLoadingChange={setIsGlobalLoading}
                onScanSuccess={handleScanSuccess}
                onRecentScansSync={syncRecentScans}
            />

            <VisitorForm
                active={showVisitorForm}
                onClose={() => setShowVisitorForm(false)}
                onLoadingChange={setIsGlobalLoading}
                onSuccess={(scanEntry) => {
                    handleScanSuccess(scanEntry);
                    setShowVisitorForm(false);
                }}
                onRecentScansSync={syncRecentScans}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
                    <div className="xl:col-span-7 w-full flex justify-center">
                        <div className="w-full max-w-2xl">
                            <RFIDForm
                                onVisitorClick={() => setShowVisitorForm(true)}
                                onOpenPcForm={() => setShowPcForm(true)}
                                onLoadingChange={setIsGlobalLoading}
                                onScanSuccess={handleScanSuccess}
                                onRecentScansSync={syncRecentScans}
                                scannerCaptureEnabled={!showVisitorForm && !showPcForm}
                            />
                        </div>
                    </div>

                    <div className="xl:col-span-5 w-full space-y-6">
                        <ClockDisplay />

                        <section className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600">Recent Scans</h2>
                                <span className="text-xs font-semibold text-slate-500">Last {recentActivity.length || 0} entries</span>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.length ? (
                                    recentActivity.map((scan) => (
                                        <article key={`${scan.id ?? scan.timeLabel}-${scan.type}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 text-primary-600 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                                    <RecentScanAvatar scan={scan} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-slate-900 truncate">{scan.name}</h3>
                                                    <p className="text-xs font-semibold text-slate-500">{getRecentScanGroupLabel(scan)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className="text-xs font-bold text-slate-600">{scan.timeLabel}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeVariant(scan.type)}`}>
                                                    {scan.type}
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-500 space-y-1">
                                        <p className="font-bold text-sm text-slate-700">No recent scans yet.</p>
                                        <p className="text-xs">The latest attendance activity will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 py-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} {ui?.org_name || 'OwlQuery Group'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
