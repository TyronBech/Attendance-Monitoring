import React, { useState } from 'react';

const AVATAR_RETRY_LIMIT = 2;

function buildRetryableAvatarSource(
    imageSource: string | null,
    attempt: number,
) {
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

    const resolvedProfileImage = buildRetryableAvatarSource(
        profileImage,
        retryCount,
    );

    function handleImageError() {
        if (retryCount < AVATAR_RETRY_LIMIT) {
            setRetryCount((currentCount) => currentCount + 1);

            return;
        }

        setImageFailed(true);
    }

    const getBadgeStyle = (value: string | null) => {
        if (value === 'Time Out') {
            return 'bg-rose-600 text-white';
        }

        if (value === 'Online Research Use') {
            return 'bg-blue-600 text-white';
        }

        return 'bg-emerald-600 text-white';
    };

    const scanLabel = scanType;
    const shouldShowScanBadge = Boolean(scanLabel);

    const getInitials = (name: string | null) => {
        if (!name) {
            return 'U';
        }

        return (
            name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('') || 'U'
        );
    };

    if (showError) {
        return (
            <div
                className={`flex min-h-[180px] w-full flex-col items-center justify-center space-y-3 rounded-2xl border border-red-200 bg-white p-6 text-center shadow-md ${className}`}
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg
                        className="h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </div>
                <p className="max-w-xs text-base font-bold text-red-600">
                    {errorMessage}
                </p>
            </div>
        );
    }

    if (showProfile) {
        return (
            <div
                className={`flex min-h-[200px] w-full flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-md ${className}`}
            >
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-primary-500 bg-white shadow-md">
                    {profileImage && !imageFailed ? (
                        <img
                            src={resolvedProfileImage}
                            alt={displayName || 'Profile'}
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-50 text-3xl font-black text-primary-600">
                            {getInitials(displayName)}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl leading-tight font-extrabold text-slate-900">
                        {displayName}
                    </h3>
                    {detailText && (
                        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            {detailText}
                        </p>
                    )}
                    {successMessage && (
                        <p className="text-xs font-semibold text-emerald-600">
                            {successMessage}
                        </p>
                    )}
                </div>

                {shouldShowScanBadge ? (
                    <span
                        className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wide uppercase shadow-sm ${getBadgeStyle(scanLabel)}`}
                    >
                        {scanLabel}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div
            className={`relative flex min-h-[180px] w-full flex-col items-center justify-center space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-primary-600 to-primary-900 p-6 text-center text-white shadow-xl ${className}`}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white">
                <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <rect x="7" y="3" width="10" height="18" rx="2" />
                    <path d="M11 7h2" />
                    <path d="M11 11h2" />
                    <path d="M12 16.5h.01" />
                </svg>
            </div>
            <h2 className="font-serif text-2xl leading-none font-extrabold tracking-wide text-white uppercase sm:text-3xl">
                {title}
            </h2>
            {subtitle ? (
                <p className="max-w-xs text-xs font-bold tracking-wider text-white/80 uppercase">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
