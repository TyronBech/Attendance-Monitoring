import { useEffect, useState } from 'react';

export default function ClockWidget() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) {
        return (
            <div className="w-full bg-primary-600 text-white rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[140px] animate-pulse">
                <div className="h-10 w-48 bg-white/20 rounded-md"></div>
            </div>
        );
    }

    const hours = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateFormatted = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="w-full bg-gradient-to-br from-primary-600 to-primary-700 dark:from-gray-800 dark:to-gray-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-primary-500/20 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-widest text-white/80 font-semibold mb-1">
                Current Time
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-mono drop-shadow-sm">
                {hours}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-gray-700/50 backdrop-blur-xs text-xs sm:text-sm font-medium text-white/90">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateFormatted}
            </div>
        </div>
    );
}
