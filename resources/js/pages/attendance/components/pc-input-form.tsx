import React, { useEffect, useRef, useState } from 'react';
import useScannerCapture from '@/hooks/use-scanner-capture';
import TapIdPanel from './tap-id-panel';

function encodePayload(payload: any) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function getDisplayName(userData: any) {
    return (
        [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') ||
        'Library User'
    );
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

    const metaToken = (
        document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    )?.content;

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

    useEffect(
        () => () => {
            clearTimeout(clearUserTimeoutRef.current);
        },
        [],
    );

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
                setErrorMessage(
                    data.message || 'There was an error. Please try again.',
                );
                onNotify?.(
                    data.message || 'There was an error. Please try again.',
                    {
                        type: 'error',
                    },
                );

                return;
            }

            const scanPayload = {
                ...(data.user ?? {}),
                identifier: trimmedIdentifier,
                scanType: 'Online Research Use',
            };
            setUserData(scanPayload);
            setErrorMessage(null);
            setSuccessMessage(
                data.message || 'Online research use recorded successfully.',
            );
            onNotify?.(
                data.message || 'Online research use recorded successfully.',
                {
                    type: 'success',
                },
            );
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
    const hasProfileImage =
        Boolean(resolvedProfileImage) &&
        !resolvedProfileImage.includes('id_default.png');
    const detailText = userData ? getDetailText(userData) : null;

    if (!showForm) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md duration-200 fade-in sm:p-8"
            onClick={handleClose}
        >
            <div
                className="my-auto w-full max-w-4xl space-y-8 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl sm:p-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-extrabold tracking-widest text-primary-600 uppercase">
                            Attendance Support
                        </p>
                        <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                            Online Research Use Form
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                            Scan the user's RFID or enter their ID Number to
                            record online research use.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer rounded-full bg-slate-100 p-2.5 text-slate-600 transition-all hover:bg-slate-200"
                        aria-label="Close Online Research Use Form"
                    >
                        <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                <form
                    method="POST"
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 items-center gap-8 sm:grid-cols-12"
                >
                    <div className="flex justify-center sm:col-span-6">
                        <TapIdPanel
                            subtitle="Tap to log online research use"
                            profileImage={
                                userData && hasProfileImage
                                    ? resolvedProfileImage
                                    : null
                            }
                            displayName={
                                userData ? getDisplayName(userData) : null
                            }
                            detailText={detailText}
                            scanType={userData ? userData.scanType : null}
                            successMessage={successMessage}
                            errorMessage={errorMessage}
                            className="min-h-[240px] w-full"
                        />
                    </div>

                    <div className="space-y-5 sm:col-span-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="pcInput"
                                className="block text-xs font-extrabold tracking-wider text-slate-700 uppercase"
                            >
                                ID Number
                            </label>
                            <input
                                ref={inputRef}
                                id="pcInput"
                                type="text"
                                name="pcInput"
                                autoComplete="off"
                                value={identifier}
                                onChange={(event) =>
                                    setIdentifier(event.target.value)
                                }
                                disabled={isSubmitting}
                                placeholder="Scan RFID or enter ID Number"
                                className="h-15 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 text-lg font-bold text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 w-full cursor-pointer rounded-2xl bg-primary-600 text-base font-extrabold text-white shadow-xl shadow-primary-600/25 transition-all hover:bg-primary-700 disabled:opacity-60"
                        >
                            {isSubmitting
                                ? 'Recording...'
                                : 'Submit Computer Use'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
