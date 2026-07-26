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

export default function VisitorModal({ isOpen, onClose, onSuccess, onNotify }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        gender: 'Male',
        purpose: '',
        school_org: '',
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) {
return null;
}

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/attendance/visitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
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
                setErrorMsg(data.message || 'Error processing visitor submission.');

                return;
            }

            onNotify(data.message || 'Visitor Time In recorded!', { type: 'success' });
            onSuccess(data.recentScan);
            onClose();
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-primary-500 p-5 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Visitor Registration Form</h3>
                        <p className="text-xs text-white/80">Complete the form below to record your visit and Time In</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl font-bold p-1 leading-none rounded-md hover:bg-white/10"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                    {errorMsg && (
                        <div className="p-3 text-xs rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-900/60 text-xs text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        💡 <strong>Tip:</strong> After registering once, you can use your email address to Time In / Time Out in the future.
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Email Address *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="visitor@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="first_name" className="text-xs font-semibold text-gray-700 dark:text-gray-200">First Name *</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="middle_name" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Middle Name</Label>
                            <Input
                                id="middle_name"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleChange}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="last_name" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Last Name *</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="suffix" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Suffix</Label>
                            <select
                                id="suffix"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleChange}
                                className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm dark:text-white"
                            >
                                <option value="">None</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="gender" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Gender *</Label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm dark:text-white"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="purpose" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Purpose of Visit *</Label>
                        <Input
                            id="purpose"
                            name="purpose"
                            required
                            placeholder="e.g., Research, Borrowing books, Inquiries"
                            value={formData.purpose}
                            onChange={handleChange}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="school_org" className="text-xs font-semibold text-gray-700 dark:text-gray-200">School / Organization *</Label>
                        <Input
                            id="school_org"
                            name="school_org"
                            required
                            placeholder="e.g., University / Company Name"
                            value={formData.school_org}
                            onChange={handleChange}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit & Time In'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
