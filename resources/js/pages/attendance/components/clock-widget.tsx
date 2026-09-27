import { useEffect, useState } from 'react';

export default function ClockWidget() {
    const [time, setTime] = useState<Date>(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    if (!time) {
        return (
            <div className="flex min-h-[140px] w-full animate-pulse flex-col items-center justify-center rounded-2xl bg-primary-600 p-6 text-white shadow-xl">
                <div className="h-10 w-48 rounded-md bg-white/20"></div>
            </div>
        );
    }

    const hours = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
    const dateFormatted = time.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-center text-white shadow-xl sm:p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <span className="mb-1 text-xs font-semibold tracking-widest text-white/80 uppercase">
                Current Time
            </span>
            <h1 className="font-mono text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl">
                {hours}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-xs sm:text-sm dark:bg-gray-700/50">
                <svg
                    className="h-4 w-4 text-white/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                {dateFormatted}
            </div>
        </div>
    );
}
