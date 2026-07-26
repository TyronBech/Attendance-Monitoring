import React, { useEffect, useRef, useState } from 'react';
import TapIdPanel from './tap-id-panel';
import useScannerCapture from '@/hooks/use-scanner-capture';

function encodePayload(payload: any) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function getDisplayName(userData: any) {
    return [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || 'Library User';
}

function getDetailText(userData: any) {
    const isStudent = userData?.group_name?.toLowerCase() === 'student';
    if (isStudent) {
        return [userData?.level, userData?.section].filter(Boolean).join(' - ');
    }
    return userData?.role || userData?.group_name || 'Online Research Use';
}

function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
    if (metaToken) return metaToken;
    const match = document.cookie.match(new RegExp('(^|; )XSRF-TOKEN=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
}

type Props = {
    showForm: boolean;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onNotify?: (msg: string, opts?: { type?: string }) => void;
    onScanSuccess?: (scanEntry: any) => void;
    onRecentScansSync?: () => void;
};

export default function PCInputForm({
    showForm,
    onClose,
    onLoadingChange,
    onNotify,
    onScanSuccess,
    onRecentScansSync,
}: Props) {
    const [identifier, setIdentifier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const clearUserTimeoutRef = useRef<any>(null);
    const PANEL_DISPLAY_DURATION_MS = 1400;

    useEffect(() => {
        if (showForm) {
            inputRef.current?.focus();
            return;
        }
        setIdentifier('');
        setIsSubmitting(false);
        setUserData(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        clearTimeout(clearUserTimeoutRef.current);
    }, [showForm]);

    useEffect(() => () => {
        clearTimeout(clearUserTimeoutRef.current);
    }, []);

    const submitIdentifier = async (scannedValue: string) => {
        const trimmedIdentifier = scannedValue.trim();

        if (!trimmedIdentifier) {
            setUserData(null);
            setSuccessMessage(null);
            setIdentifier('');
            setErrorMessage('Please scan the RFID or enter your ID Number.');
            return;
        }

        setIsSubmitting(true);
        setUserData(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        setIdentifier('');
        onLoadingChange(true);

        try {
            const response = await fetch('/attendance/computer-use', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    payload: encodePayload({ identifier: trimmedIdentifier }),
                    identifier: trimmedIdentifier,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.status !== 'success') {
                setUserData(null);
                setSuccessMessage(null);
                setErrorMessage(data.message || 'There was an error. Please try again.');
                onNotify?.(data.message || 'There was an error. Please try again.', {
                    type: 'error',
                });
                return;
            }

            const scanPayload = {
                ...(data.user ?? {}),
                identifier: trimmedIdentifier,
                scanType: 'Online Research Use',
            };
            setUserData(scanPayload);
            setErrorMessage(null);
            setSuccessMessage(data.message || 'Online research use recorded successfully.');
            onNotify?.(data.message || 'Online research use recorded successfully.', {
                type: 'success',
            });
            onScanSuccess?.(data.recentScan ?? null);
            onRecentScansSync?.();
            inputRef.current?.focus();

            clearTimeout(clearUserTimeoutRef.current);
            clearUserTimeoutRef.current = setTimeout(() => {
                setUserData(null);
                setSuccessMessage(null);
            }, PANEL_DISPLAY_DURATION_MS);
        } catch {
            setUserData(null);
            setSuccessMessage(null);
            setErrorMessage('There was an error. Please try again.');
            onNotify?.('There was an error. Please try again.', {
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
            onLoadingChange(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await submitIdentifier(identifier);
    };

    useScannerCapture({
        enabled: showForm && !isSubmitting,
        targetRef: inputRef,
        mirrorValue: (scannedValue) => setIdentifier(scannedValue),
        onScan: (scannedValue) => submitIdentifier(scannedValue),
    });

    const resolvedProfileImage = userData?.image ?? '';
    const hasProfileImage = Boolean(resolvedProfileImage) && !resolvedProfileImage.includes('id_default.png');
    const detailText = userData ? getDetailText(userData) : null;

    if (!showForm) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-4xl my-auto bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-8 text-slate-900" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-5 border-b border-slate-200">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-primary-600">Attendance Support</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Online Research Use Form</h2>
                        <p className="text-sm font-medium text-slate-600 mt-1">
                            Scan the user's RFID or enter their ID Number to record online research use.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        aria-label="Close Online Research Use Form"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                <form method="POST" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
                    <div className="sm:col-span-6 flex justify-center">
                        <TapIdPanel
                            subtitle="Tap to log online research use"
                            profileImage={userData && hasProfileImage ? resolvedProfileImage : null}
                            displayName={userData ? getDisplayName(userData) : null}
                            detailText={detailText}
                            scanType={userData ? userData.scanType : null}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            className="w-full min-h-[240px]"
                        />
                    </div>

                    <div className="sm:col-span-6 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="pcInput" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                ID Number
                            </label>
                            <input
                                ref={inputRef}
                                id="pcInput"
                                type="text"
                                name="pcInput"
                                autoComplete="off"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                disabled={isSubmitting}
                                placeholder="Scan RFID or enter ID Number"
                                className="w-full h-15 px-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-lg focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-primary-600/25 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {isSubmitting ? 'Recording...' : 'Submit Computer Use'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
