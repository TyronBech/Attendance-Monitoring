import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function ClockWidget() {
    const [time, setTime] = useState<Date>(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    if (!time) {
        return (
            <div className="w-full bg-primary-600 text-white rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[140px] animate-pulse">
                <div className="h-10 w-48 bg-white/20 rounded-md"></div>
            </div>
        );
    }

    const hours = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateFormatted = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="w-full bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-primary-500/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-wider text-white/80 font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Current Time
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums">
                {hours}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs sm:text-sm font-semibold text-white">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                <span>{dateFormatted}</span>
            </div>
        </div>
    );
}

