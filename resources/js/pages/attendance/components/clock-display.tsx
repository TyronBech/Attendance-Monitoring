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
        <div className="flex w-full flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-200/80 bg-white p-8 text-center text-slate-900 shadow-xl sm:p-10">
            <p className="text-xs font-extrabold tracking-widest text-primary-600 uppercase sm:text-sm">
                Current Library Time
            </p>

            <div className="flex items-baseline justify-center gap-3">
                <div
                    className="inline-flex items-baseline gap-1 font-mono text-6xl font-black tracking-tight text-slate-900 drop-shadow-sm sm:text-7xl lg:text-8xl"
                    aria-label={`${hours}:${minutes}:${seconds} ${meridiem}`}
                >
                    <span>{hours}</span>
                    <span className="font-sans text-5xl text-primary-500/50 sm:text-6xl lg:text-7xl">
                        :
                    </span>
                    <span>{minutes}</span>
                    <span className="font-sans text-5xl text-primary-500/50 sm:text-6xl lg:text-7xl">
                        :
                    </span>
                    <span>{seconds}</span>
                </div>
                <span className="text-2xl font-extrabold tracking-wide text-primary-600 uppercase sm:text-3xl">
                    {meridiem}
                </span>
            </div>

            <div className="my-2 h-1 w-24 rounded-full bg-slate-200" />

            <h2 className="text-xl font-bold tracking-wide text-slate-700 sm:text-2xl">
                {formattedDate}
            </h2>
        </div>
    );
}
