import React, { useState } from 'react';
import { AlertCircle, CreditCard, Scan, Sparkles } from 'lucide-react';

const AVATAR_RETRY_LIMIT = 2;

function buildRetryableAvatarSource(imageSource: string | null, attempt: number) {
    if (typeof imageSource !== 'string' || imageSource.trim() === '') {
        return '';
    }

    if (imageSource.startsWith('data:image/')) {
        return imageSource;
    }

    if (attempt <= 0) {
        return imageSource;
    }

    const separator = imageSource.includes('?') ? '&' : '?';

    return `${imageSource}${separator}retry=${attempt}`;
}

type Props = {
    className?: string;
    title?: string;
    subtitle?: string;
    profileImage?: string | null;
    displayName?: string | null;
    detailText?: string | null;
    scanType?: string | null;
    errorMessage?: string | null;
    successMessage?: string | null;
};

export default function TapIdPanel({
    className = '',
    title = 'Tap Your ID',
    subtitle = '',
    profileImage = null,
    displayName = null,
    detailText = null,
    scanType = null,
    errorMessage = null,
    successMessage = null,
}: Props) {
    const showProfile = Boolean(profileImage || displayName);
    const showError = Boolean(errorMessage && !showProfile);
    const [prevProfileImage, setPrevProfileImage] = useState(profileImage);
    const [retryCount, setRetryCount] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    if (prevProfileImage !== profileImage) {
        setPrevProfileImage(profileImage);
        setRetryCount(0);
        setImageFailed(false);
    }

    const resolvedProfileImage = buildRetryableAvatarSource(profileImage, retryCount);

    function handleImageError() {
        if (retryCount < AVATAR_RETRY_LIMIT) {
            setRetryCount((currentCount) => currentCount + 1);

            return;
        }

        setImageFailed(true);
    }

    const getBadgeStyle = (value: string | null) => {
        if (value === 'Time Out') {
            return 'bg-rose-500 text-white shadow-rose-500/20';
        }

        if (value === 'Online Research Use') {
            return 'bg-indigo-500 text-white shadow-indigo-500/20';
        }

        return 'bg-emerald-500 text-white shadow-emerald-500/20';
    };

    const scanLabel = scanType;
    const shouldShowScanBadge = Boolean(scanLabel);

    const getInitials = (name: string | null) => {
        if (!name) {
            return 'U';
        }

        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'U';
    };

    if (showError) {
        return (
            <div className={`w-full min-h-[190px] p-6 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Scan Failed</h3>
                    <p className="text-rose-600 dark:text-rose-400 font-medium text-xs max-w-sm">{errorMessage}</p>
                </div>
            </div>
        );
    }

    if (showProfile) {
        return (
            <div className={`w-full min-h-[200px] p-6 rounded-2xl bg-neutral-50/90 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 shadow-xs flex flex-col items-center justify-center text-center space-y-3.5 ${className}`}>
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-3 border-primary-500 overflow-hidden bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center shrink-0">
                        {profileImage && !imageFailed ? (
                            <img
                                src={resolvedProfileImage}
                                alt={displayName || 'Profile'}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 font-bold text-2xl">
                                {getInitials(displayName)}
                            </div>
                        )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                    </span>
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">{displayName}</h3>
                    {detailText && <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{detailText}</p>}
                    {successMessage && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{successMessage}</p>}
                </div>

                {shouldShowScanBadge ? (
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${getBadgeStyle(scanLabel)}`}>
                        {scanLabel}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div className={`w-full min-h-[190px] p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white shadow-sm flex flex-col items-center justify-center text-center space-y-3 relative border border-primary-500/20 overflow-hidden ${className}`}>
            {/* Subtle background glow pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative w-12 h-12 rounded-xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                <Scan className="w-6 h-6" />
            </div>
            
            <div className="relative space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">{title}</h2>
                {subtitle ? (
                    <p className="text-xs font-medium uppercase tracking-wider text-white/80 max-w-xs">{subtitle}</p>
                ) : null}
            </div>
        </div>
    );
}
