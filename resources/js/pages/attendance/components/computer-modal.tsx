import { Monitor, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (recentScan?: any) => void;
    onNotify: (msg: string, opts?: { type?: string }) => void;
};

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

    if (metaToken) {
        return metaToken;
    }

    const match = document.cookie.match(new RegExp('(^|; )XSRF-TOKEN=([^;]+)'));

    return match ? decodeURIComponent(match[2]) : '';
}

export default function ComputerModal({ isOpen, onClose, onSuccess, onNotify }: Props) {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier.trim()) {
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/attendance/computer-use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ identifier: identifier.trim() }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 419 || data.message?.toLowerCase().includes('csrf')) {
                setErrorMsg('Session expired. Reloading page...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

                return;
            }

            if (!res.ok || data.status !== 'success') {
                setErrorMsg(data.message || 'Error recording computer use.');

                return;
            }

            onNotify(data.message || 'Online Research Use recorded!', { type: 'success' });
            onSuccess(data.recentScan);
            setIdentifier('');
            onClose();
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Online Research Use Form</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                            {errorMsg}
                        </div>
                    )}

                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Scan your RFID card or enter your ID / Employee Number below to log computer station usage for research.
                    </p>

                    <div className="space-y-1">
                        <Label htmlFor="pc_identifier" className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                            Scan RFID or Enter ID Number *
                        </Label>
                        <Input
                            id="pc_identifier"
                            autoFocus
                            required
                            placeholder="Scan RFID / Enter ID Number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs" disabled={loading}>
                            {loading ? 'Submitting...' : 'Log Computer Use'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
