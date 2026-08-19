import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ClockDisplay() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const meridiem = now.getHours() >= 12 ? 'PM' : 'AM';
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(now);

    return (
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Current Library Time
                </span>
            </div>

            <div className="flex items-baseline justify-center gap-2 sm:gap-3">
                <div
                    className="inline-flex items-baseline gap-1 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums"
                    aria-label={`${hours}:${minutes}:${seconds} ${meridiem}`}
                >
                    <span>{hours}</span>
                    <span className="text-primary-500/50 dark:text-primary-400/50 font-light">:</span>
                    <span>{minutes}</span>
                    <span className="text-primary-500/50 dark:text-primary-400/50 font-light">:</span>
                    <span>{seconds}</span>
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-tight">
                    {meridiem}
                </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>{formattedDate}</span>
            </div>
        </div>
    );
}

