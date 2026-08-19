import React, { useEffect, useRef, useState } from 'react';
import { Monitor, ScanLine, X } from 'lucide-react';
import useScannerCapture from '@/hooks/use-scanner-capture';
import TapIdPanel from './tap-id-panel';

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

const PANEL_DISPLAY_DURATION_MS = 1400;

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
    const handleClose = () => {
        setIdentifier('');
        setIsSubmitting(false);
        setUserData(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        clearTimeout(clearUserTimeoutRef.current);
        onClose();
    };

    useEffect(() => {
        if (showForm) {
            inputRef.current?.focus();
        }
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

    if (!showForm) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" onClick={handleClose}>
            <div className="w-full max-w-3xl my-auto bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-6 text-neutral-900 dark:text-neutral-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Online Research Use Form</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                            Scan the user's RFID or enter their ID Number to record online research station use.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                        aria-label="Close Online Research Use Form"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form method="POST" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-6 flex justify-center">
                        <TapIdPanel
                            subtitle="Tap to log online research use"
                            profileImage={userData && hasProfileImage ? resolvedProfileImage : null}
                            displayName={userData ? getDisplayName(userData) : null}
                            detailText={detailText}
                            scanType={userData ? userData.scanType : null}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            className="w-full min-h-[220px]"
                        />
                    </div>

                    <div className="md:col-span-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="pcInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                <ScanLine className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                ID Number / RFID
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
                                className="w-full h-12 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold text-base focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm tracking-wide rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <Monitor className="w-4 h-4" />
                            <span>{isSubmitting ? 'Recording...' : 'Submit Computer Use'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
