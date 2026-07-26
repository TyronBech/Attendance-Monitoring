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
        <div className="w-full p-8 sm:p-10 rounded-3xl bg-white text-slate-900 shadow-xl border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary-600">Current Library Time</p>

            <div className="flex items-baseline justify-center gap-3">
                <div className="inline-flex items-baseline gap-1 text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-900 drop-shadow-sm" aria-label={`${hours}:${minutes}:${seconds} ${meridiem}`}>
                    <span>{hours}</span>
                    <span className="text-primary-500/50 font-sans text-5xl sm:text-6xl lg:text-7xl">:</span>
                    <span>{minutes}</span>
                    <span className="text-primary-500/50 font-sans text-5xl sm:text-6xl lg:text-7xl">:</span>
                    <span>{seconds}</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary-600 uppercase tracking-wide">{meridiem}</span>
            </div>

            <div className="w-24 h-1 bg-slate-200 rounded-full my-2" />

            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 tracking-wide">{formattedDate}</h2>
        </div>
    );
}
