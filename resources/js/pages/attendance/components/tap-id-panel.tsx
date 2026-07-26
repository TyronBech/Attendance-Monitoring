import React, { useState } from 'react';

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

        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'U';
    };

    if (showError) {
        return (
            <div className={`w-full min-h-[180px] p-6 rounded-2xl bg-white border border-red-200 shadow-md flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </div>
                <p className="text-red-600 font-bold text-base max-w-xs">{errorMessage}</p>
            </div>
        );
    }

    if (showProfile) {
        return (
            <div className={`w-full min-h-[200px] p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-md flex flex-col items-center justify-center text-center space-y-4 ${className}`}>
                <div className="w-24 h-24 rounded-full border-4 border-primary-500 overflow-hidden bg-white shadow-md flex items-center justify-center shrink-0">
                    {profileImage && !imageFailed ? (
                        <img
                            src={resolvedProfileImage}
                            alt={displayName || 'Profile'}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-3xl">
                            {getInitials(displayName)}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{displayName}</h3>
                    {detailText && <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{detailText}</p>}
                    {successMessage && <p className="text-xs font-semibold text-emerald-600">{successMessage}</p>}
                </div>

                {shouldShowScanBadge ? (
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm ${getBadgeStyle(scanLabel)}`}>
                        {scanLabel}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div className={`w-full min-h-[180px] p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-3 relative border border-white/10 ${className}`}>
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="7" y="3" width="10" height="18" rx="2" />
                    <path d="M11 7h2" />
                    <path d="M11 11h2" />
                    <path d="M12 16.5h.01" />
                </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white leading-none font-serif">{title}</h2>
            {subtitle ? <p className="text-xs font-bold uppercase tracking-wider text-white/80 max-w-xs">{subtitle}</p> : null}
        </div>
    );
}
