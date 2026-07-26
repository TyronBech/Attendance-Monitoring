import React, { useEffect, useRef, useState } from 'react';
import useScannerCapture from '@/hooks/use-scanner-capture';
import TapIdPanel from './tap-id-panel';

function encodePayload(payload: any) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function getDisplayName(userData: any) {
    return [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || 'Library User';
}

function getScanType(remarks: string) {
    return strMatches(remarks, 'On Time') ? 'Time Out' : 'Time In';
}

function strMatches(a: string, b: string) {
    return String(a || '').toLowerCase() === String(b || '').toLowerCase();
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

const STANDARD_SCAN_DISPLAY_DURATION_MS = 2200;
const LIBRARY_FINE_EXTRA_DISPLAY_DURATION_MS = 2000;

type Props = {
    onVisitorClick: () => void;
    onOpenPcForm: () => void;
    onLoadingChange: (loading: boolean) => void;
    onNotify?: (msg: string, opts?: { type?: string }) => void;
    onScanSuccess?: (scanEntry: any) => void;
    onRecentScansSync?: () => void;
    scannerCaptureEnabled?: boolean;
};

export default function RFIDForm({
    onVisitorClick,
    onOpenPcForm,
    onLoadingChange,
    onNotify,
    onScanSuccess,
    onRecentScansSync,
    scannerCaptureEnabled = true,
}: Props) {
    const [identifier, setIdentifier] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [userData, setUserData] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const clearUserTimeoutRef = useRef<any>(null);

    useEffect(() => {
        if (!userData && scannerCaptureEnabled) {
            inputRef.current?.focus();
        }
    }, [scannerCaptureEnabled, userData]);

    useEffect(() => () => {
        clearTimeout(clearUserTimeoutRef.current);
    }, []);

    const submitIdentifier = async (rawIdentifier: string) => {
        const trimmedIdentifier = rawIdentifier.trim();

        if (!trimmedIdentifier) {
            setErrorMessage('Tap your RFID or write your ID Number.');
            clearTimeout(clearUserTimeoutRef.current);
            clearUserTimeoutRef.current = setTimeout(() => {
                setErrorMessage(null);
            }, 3000);

            return;
        }

        setIdentifier('');
        setIsScanning(true);
        setUserData(null);
        setErrorMessage(null);
        onLoadingChange(true);

        try {
            const response = await fetch('/attendance/scan', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    payload: encodePayload({ rfid: trimmedIdentifier }),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.status !== 'success') {
                setErrorMessage(data.message || 'ID not found. Please try again.');
                clearTimeout(clearUserTimeoutRef.current);
                clearUserTimeoutRef.current = setTimeout(() => {
                    setErrorMessage(null);
                }, 3000);

                return;
            }

            const scanType = getScanType(data.remarks);
            const scanPayload = {
                ...(data.data ?? {}),
                identifier: trimmedIdentifier,
                scanType,
                hasLibraryFine: Boolean(data.hasLibraryFine),
            };

            setUserData(scanPayload);
            onNotify?.(data.message || `${scanType} recorded.`, {
                type: scanType === 'Time Out' ? 'error' : 'success',
            });
            onScanSuccess?.(data.recentScan ?? null);
            onRecentScansSync?.();

            clearTimeout(clearUserTimeoutRef.current);
            clearUserTimeoutRef.current = setTimeout(() => {
                setUserData(null);
                setErrorMessage(null);
            }, STANDARD_SCAN_DISPLAY_DURATION_MS + (scanPayload.hasLibraryFine ? LIBRARY_FINE_EXTRA_DISPLAY_DURATION_MS : 0));
        } catch {
            setErrorMessage('An error occurred while scanning the ID.');
            clearTimeout(clearUserTimeoutRef.current);
            clearUserTimeoutRef.current = setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
        } finally {
            setIsScanning(false);
            onLoadingChange(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await submitIdentifier(identifier);
    };

    useScannerCapture({
        enabled: scannerCaptureEnabled && !isScanning && !userData,
        targetRef: inputRef,
        mirrorValue: (scannedValue) => setIdentifier(scannedValue),
        onScan: (scannedValue) => submitIdentifier(scannedValue),
    });

    const isStudent = userData?.group_name?.toLowerCase() === 'student';
    const resolvedProfileImage = userData?.image ?? '';
    const hasProfileImage = Boolean(resolvedProfileImage) && !resolvedProfileImage.includes('id_default.png');
    const detailLine = isStudent
        ? [userData?.level, userData?.section].filter(Boolean).join(' - ')
        : (userData?.role || userData?.group_name || 'Library access');

    return (
        <div className="w-full">
            <section className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-6">
                <div>
                    <TapIdPanel
                        title="Tap Your ID"
                        subtitle="RFID - ID Number - Employee ID"
                        profileImage={userData && hasProfileImage ? resolvedProfileImage : null}
                        displayName={userData ? getDisplayName(userData) : null}
                        detailText={userData ? detailLine : null}
                        scanType={userData ? userData.scanType : null}
                        hasLibraryFine={Boolean(userData?.hasLibraryFine)}
                        errorMessage={errorMessage}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="myInput" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Scan or Enter ID
                        </label>

                        <form method="POST" id="rfidForm" className="space-y-3" onSubmit={handleSubmit}>
                            <input
                                ref={inputRef}
                                autoFocus
                                id="myInput"
                                type="text"
                                name="rfidInput"
                                autoComplete="off"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                disabled={isScanning}
                                placeholder="Scan RFID or enter visitor email"
                                className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-semibold text-base focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                            />

                            <button
                                type="submit"
                                className="w-full h-13 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                disabled={isScanning}
                            >
                                {isScanning ? 'Scanning...' : 'Time In / Time Out'}
                            </button>
                        </form>
                    </div>

                    <button
                        type="button"
                        className="w-full h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        onClick={onOpenPcForm}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6.75A1.75 1.75 0 0 1 5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v8.5A1.75 1.75 0 0 1 18.25 17H5.75A1.75 1.75 0 0 1 4 15.25v-8.5Z" />
                            <path d="M9 19h6" />
                            <path d="M12 17v2" />
                        </svg>
                        <span>Online Research Use Form</span>
                    </button>

                    {isScanning ? (
                        <div className="text-center text-xs font-bold text-slate-500 animate-pulse">
                            <span>Scanning, please wait...</span>
                        </div>
                    ) : null}

                    <p className="text-center text-sm font-semibold text-slate-600">
                        Just visiting?{' '}
                        <a
                            href="#"
                            id="visitorLink"
                            className="font-bold text-primary-600 hover:underline"
                            onClick={(event) => {
                                event.preventDefault();
                                onVisitorClick();
                            }}
                        >
                            Complete the visitor form
                        </a>
                        .
                    </p>
                </div>
            </section>
        </div>
    );
}
