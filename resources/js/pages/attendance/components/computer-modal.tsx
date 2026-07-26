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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-primary-500 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💻</span>
                        <h3 className="text-lg font-bold">Online Research Use Form</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl font-bold p-1 leading-none rounded-md hover:bg-white/10"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 text-xs rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-300">
                        Scan your RFID card or enter your ID / Employee Number below to log computer station usage for research.
                    </p>

                    <div className="space-y-1">
                        <Label htmlFor="pc_identifier" className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                            Scan RFID or Enter ID Number *
                        </Label>
                        <Input
                            id="pc_identifier"
                            autoFocus
                            required
                            placeholder="Scan RFID / Enter ID Number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={loading}>
                            {loading ? 'Submitting...' : 'Log Computer Use'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
