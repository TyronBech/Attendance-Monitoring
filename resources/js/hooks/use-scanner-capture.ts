import { useEffect, useRef } from 'react';

const DEFAULT_MAX_INTERVAL_MS = 80;
const DEFAULT_CLEAR_TIMEOUT_MS = 250;
const DEFAULT_MIN_LENGTH = 3;
const TERMINATOR_KEYS = new Set(['Enter']);
const IGNORED_KEYS = new Set([
    'Shift',
    'Control',
    'Alt',
    'Meta',
    'CapsLock',
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
]);

function isEditableElement(element: EventTarget | null): boolean {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    if (element.isContentEditable) {
        return true;
    }

    const tagName = element.tagName.toLowerCase();

    if (tagName === 'textarea' || tagName === 'select') {
        return true;
    }

    if (tagName !== 'input') {
        return false;
    }

    const inputType = (element.getAttribute('type') || 'text').toLowerCase();
    return !['button', 'checkbox', 'color', 'file', 'hidden', 'radio', 'range', 'submit'].includes(inputType);
}

function shouldIgnoreTarget(target: EventTarget | null, targetElement: HTMLElement | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (targetElement && target === targetElement) {
        return true;
    }

    if (target.closest('[data-scanner-capture-ignore="true"]')) {
        return true;
    }

    return isEditableElement(target);
}

type UseScannerCaptureOptions = {
    enabled?: boolean;
    onScan?: (scannedValue: string) => void;
    mirrorValue?: (scannedValue: string) => void;
    targetRef?: React.RefObject<HTMLInputElement | null> | null;
    minLength?: number;
    maxIntervalMs?: number;
    clearTimeoutMs?: number;
};

export default function useScannerCapture({
    enabled = true,
    onScan,
    mirrorValue,
    targetRef = null,
    minLength = DEFAULT_MIN_LENGTH,
    maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
    clearTimeoutMs = DEFAULT_CLEAR_TIMEOUT_MS,
}: UseScannerCaptureOptions) {
    const bufferRef = useRef('');
    const lastKeyTimestampRef = useRef(0);
    const clearTimerRef = useRef<number | null>(null);
    const onScanRef = useRef(onScan);
    const mirrorValueRef = useRef(mirrorValue);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        mirrorValueRef.current = mirrorValue;
    }, [mirrorValue]);

    useEffect(() => () => {
        if (clearTimerRef.current) {
            window.clearTimeout(clearTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            bufferRef.current = '';
            lastKeyTimestampRef.current = 0;
            if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
            return undefined;
        }

        const resetBuffer = () => {
            bufferRef.current = '';
            lastKeyTimestampRef.current = 0;
            if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
        };

        const scheduleBufferReset = () => {
            if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
            clearTimerRef.current = window.setTimeout(() => {
                bufferRef.current = '';
                lastKeyTimestampRef.current = 0;
            }, clearTimeoutMs);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            if (IGNORED_KEYS.has(event.key)) {
                return;
            }

            const targetElement = targetRef?.current ?? null;

            if (shouldIgnoreTarget(event.target, targetElement)) {
                resetBuffer();
                return;
            }

            const currentTimestamp = Date.now();

            if (TERMINATOR_KEYS.has(event.key)) {
                const scannedValue = bufferRef.current.trim();
                resetBuffer();

                if (scannedValue.length < minLength) {
                    return;
                }

                event.preventDefault();
                mirrorValueRef.current?.(scannedValue);
                onScanRef.current?.(scannedValue);
                return;
            }

            if (event.key.length !== 1) {
                return;
            }

            if (
                lastKeyTimestampRef.current > 0
                && currentTimestamp - lastKeyTimestampRef.current > maxIntervalMs
            ) {
                bufferRef.current = '';
            }

            bufferRef.current += event.key;
            lastKeyTimestampRef.current = currentTimestamp;
            scheduleBufferReset();
            event.preventDefault();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            resetBuffer();
        };
    }, [clearTimeoutMs, enabled, maxIntervalMs, minLength, targetRef]);
}
