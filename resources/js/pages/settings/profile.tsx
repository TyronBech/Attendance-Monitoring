import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, CheckCircle2, Edit3, Eye, EyeOff, Lock, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { useState, useRef } from 'react';
import type { FormEventHandler } from 'react';
import SettingsLayout from '@/layouts/settings/layout';
import profile from '@/routes/profile';

interface User {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    email: string;
    profile_image: string | null;
    user_type: string;
    user_id_number: string | null;
    employee_role: string | null;
    two_factor_enabled: boolean;
    updated_at: string;
}

interface SharedProps {
    auth: {
        user: User;
    };
    settings: {
        theme_colors: {
            primary: string;
            secondary: string;
            tertiary: string;
        };
    };
    [key: string]: any;
}

export default function Profile() {
    const { user, settings, ui } = usePage<SharedProps>().props;
    const primaryColor = settings?.theme_colors?.primary || ui?.theme_colors?.primary || '#3B82F6';
    const secondaryColor = settings?.theme_colors?.secondary || ui?.theme_colors?.secondary || '#6366F1';
    const [isEditMode, setIsEditMode] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorAction, setTwoFactorAction] = useState<'enable' | 'disable'>('enable');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_image ?? null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        first_name: user.first_name,
        middle_name: user.middle_name || '',
        last_name: user.last_name,
        suffix: user.suffix || '',
        email: user.email,
        profile_image: null as File | null,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const twoFactorForm = useForm({
        password: '',
    });

    const handleProfileUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        patch(profile.update.url(), {
            onSuccess: () => {
                setIsEditMode(false);
                reset('current_password', 'new_password', 'new_password_confirmation');
            },
        });
    };

    const handleTwoFactorAction: FormEventHandler = (e) => {
        e.preventDefault();
        const actionUrl = twoFactorAction === 'enable' 
            ? profile['2fa'].enable.url() 
            : profile['2fa'].disable.url();
            
        twoFactorForm.post(actionUrl, {
            onSuccess: () => {
                setShowTwoFactorModal(false);
                twoFactorForm.reset();
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('profile_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEditMode = (enable: boolean) => {
        if (!enable) {
            reset();
            setPreviewImage(user.profile_image);
        }

        setIsEditMode(enable);
    };

    const openTwoFactorModal = (action: 'enable' | 'disable') => {
        setTwoFactorAction(action);
        setShowTwoFactorModal(true);
        twoFactorForm.reset();
    };

    return (
        <>
            <Head title="Account Settings" />
            
            <SettingsLayout>
                {/* Profile Information Card */}
                <div className="w-full p-4 sm:p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-8 shadow-md">
                    <form onSubmit={handleProfileUpdate} encType="multipart/form-data">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column: Profile Image and Basic Info */}
                            <div className="lg:col-span-1 flex flex-col items-center text-center lg:border-r lg:border-gray-200 dark:lg:border-gray-700 lg:pr-8">
                                <div className="relative mb-6 group">
                                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-md bg-gray-100 dark:bg-gray-700">
                                        {previewImage ? (
                                            <img 
                                                src={previewImage.startsWith('data:') ? previewImage : previewImage} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Camera size={48} />
                                            </div>
                                        )}
                                    </div>

                                    {isEditMode && (
                                        <label 
                                            htmlFor="profile_image" 
                                            className="absolute bottom-2 right-2 bg-primary-500 hover:bg-primary-400 text-white p-2.5 rounded-full cursor-pointer shadow-lg border-4 border-white dark:border-gray-800 dark:bg-primary-400 dark:hover:bg-primary-300 transition-transform hover:scale-110"
                                            title="Upload new photo"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Camera size={20} />
                                            <input 
                                                type="file" 
                                                id="profile_image" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                ref={fileInputRef}
                                            />
                                        </label>
                                    )}
                                </div>

                                <h5 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.first_name} {user.middle_name} {user.last_name}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 capitalize">
                                    {user.user_type === 'employee' ? user.employee_role : user.user_type}
                                </p>

                                <div className="w-full max-w-xs space-y-3">
                                    {user.user_id_number && (
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.user_id_number}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.user_type === 'student' ? 'ID Number' : 'Employee ID'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Form */}
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-6">
                                    <h6 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Personal Information</h6>
                                    
                                    {!isEditMode && (
                                        <button 
                                            type="button" 
                                            onClick={() => toggleEditMode(true)}
                                            className="text-sm font-medium hover:underline flex items-center"
                                            style={{ color: primaryColor }}
                                        >
                                            <Edit3 size={16} className="mr-1" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div className="relative z-0 w-full group">
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                                        {isEditMode ? (
                                            <input 
                                                type="text" 
                                                value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                className="py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400"
                                                required 
                                            />
                                        ) : (
                                            <p className="text-base font-medium text-gray-900 dark:text-white py-2 border-b border-transparent">{user.first_name}</p>
                                        )}
                                        {errors.first_name && <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>}
                                    </div>

                                    {/* Middle Name */}
                                    <div className="relative z-0 w-full group">
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Middle Name</label>
                                        {isEditMode ? (
                                            <input 
                                                type="text" 
                                                value={data.middle_name}
                                                onChange={e => setData('middle_name', e.target.value)}
                                                className="py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400"
                                            />
                                        ) : (
                                            <p className="text-base font-medium text-gray-900 dark:text-white py-2 border-b border-transparent">{user.middle_name || '-'}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="relative z-0 w-full group">
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                                        {isEditMode ? (
                                            <input 
                                                type="text" 
                                                value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                className="py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400"
                                                required 
                                            />
                                        ) : (
                                            <p className="text-base font-medium text-gray-900 dark:text-white py-2 border-b border-transparent">{user.last_name}</p>
                                        )}
                                        {errors.last_name && <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>}
                                    </div>

                                    {/* Suffix */}
                                    <div className="relative z-0 w-full group">
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Suffix</label>
                                        {isEditMode ? (
                                            <input 
                                                type="text" 
                                                value={data.suffix}
                                                onChange={e => setData('suffix', e.target.value)}
                                                className="py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400"
                                            />
                                        ) : (
                                            <p className="text-base font-medium text-gray-900 dark:text-white py-2 border-b border-transparent">{user.suffix || '-'}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="relative z-0 w-full sm:col-span-2 group">
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                                        {isEditMode ? (
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400"
                                                required 
                                            />
                                        ) : (
                                            <p className="text-base font-medium text-gray-900 dark:text-white py-2 border-b border-transparent">{user.email}</p>
                                        )}
                                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Security Section */}
                                    <div className="relative z-0 w-full sm:col-span-2 group pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <h6 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Security</h6>

                                        {isEditMode ? (
                                            <div className="space-y-6">
                                                {/* Current Password */}
                                                <div className="relative z-0 w-full group">
                                                    <input 
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={data.current_password}
                                                        onChange={e => setData('current_password', e.target.value)}
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400 peer pr-10"
                                                        placeholder=" "
                                                    />
                                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Current Password</label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-0 top-2.5 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                    {errors.current_password && <p className="mt-2 text-sm text-red-600">{errors.current_password}</p>}
                                                </div>

                                                {/* New Password */}
                                                <div className="relative z-0 w-full group">
                                                    <input 
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={data.new_password}
                                                        onChange={e => setData('new_password', e.target.value)}
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400 peer pr-10"
                                                        placeholder=" "
                                                    />
                                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">New Password</label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-0 top-2.5 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                    {errors.new_password && <p className="mt-2 text-sm text-red-600">{errors.new_password}</p>}
                                                </div>

                                                {/* Confirm New Password */}
                                                <div className="relative z-0 w-full group">
                                                    <input 
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={data.new_password_confirmation}
                                                        onChange={e => setData('new_password_confirmation', e.target.value)}
                                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400 peer pr-10"
                                                        placeholder=" "
                                                    />
                                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-0 top-2.5 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Password</label>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white tracking-widest">••••••••</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className={`flex justify-end gap-3 mt-8 ${!isEditMode ? 'hidden' : ''}`}>
                                    <button 
                                        type="button" 
                                        onClick={() => toggleEditMode(false)}
                                        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md disabled:opacity-50"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication Card */}
                <div className="max-w-5xl mx-auto p-6 sm:p-8 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                                    <ShieldCheck className="w-6 h-6" style={{ color: primaryColor }} />
                                </div>
                                <h6 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Two-Factor Authentication</h6>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                Strengthen your account security by adding an additional verification step. When enabled, you'll need to enter a code from your authentication app along with your password.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                {user.two_factor_enabled ? (
                                    <>
                                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200 shadow-sm">
                                            <CheckCircle2 size={16} className="mr-2" />
                                            <span>Active & Protected</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Lock size={14} className="mr-1" />
                                            <span>Activated on {user.updated_at}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900 dark:to-amber-800 dark:text-amber-200 shadow-sm">
                                            <ShieldAlert size={16} className="mr-2" />
                                            <span>Not Configured</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <ShieldCheck size={14} className="mr-1" />
                                            <span>Recommended for enhanced security</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0">
                            {user.two_factor_enabled ? (
                                <button 
                                    type="button" 
                                    onClick={() => openTwoFactorModal('disable')}
                                    className="group relative inline-flex items-center justify-center px-6 py-3 text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-semibold rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <ShieldAlert size={18} className="mr-2 transition-transform group-hover:scale-110" />
                                    <span>Disable 2FA</span>
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => openTwoFactorModal('enable')}
                                    className="group relative inline-flex items-center justify-center px-6 py-3 text-white focus:ring-4 focus:outline-none font-semibold rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <ShieldCheck size={18} className="mr-2 transition-transform group-hover:scale-110" />
                                    <span>Enable 2FA</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {!user.two_factor_enabled && (
                        <div className="mt-6 p-4 rounded-r-lg border-l-4" style={{ backgroundColor: `${secondaryColor}10`, borderColor: primaryColor }}>
                            <div className="flex items-start">
                                <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: primaryColor }} />
                                <div className="ml-3">
                                    <p className="text-sm font-medium" style={{ color: primaryColor }}>Security Tip</p>
                                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Enable 2FA to add an extra layer of protection to your account. You'll need an authenticator app like Google Authenticator or Microsoft Authenticator.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>

            {/* Two-Factor Authentication Modal */}
            {showTwoFactorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {twoFactorAction === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
                            </h3>
                            <button 
                                onClick={() => setShowTwoFactorModal(false)}
                                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleTwoFactorAction}>
                            <div className="p-4 space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Please enter your password to {twoFactorAction === 'enable' ? 'enable' : 'disable'} two-factor authentication.
                                </p>
                                
                                <div className="relative z-0 w-full group">
                                    <input 
                                        type={showModalPassword ? 'text' : 'password'}
                                        value={twoFactorForm.data.password}
                                        onChange={e => twoFactorForm.setData('password', e.target.value)}
                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-400 peer pr-10"
                                        placeholder=" "
                                        autoFocus
                                        required
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModalPassword(!showModalPassword)}
                                        className="absolute right-0 top-2.5 text-gray-500 hover:text-gray-700"
                                    >
                                        {showModalPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                
                                {twoFactorForm.errors.password && (
                                    <div className="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-900 dark:text-red-400">
                                        {twoFactorForm.errors.password}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center p-4 border-t dark:border-gray-700 gap-3">
                                <button 
                                    type="submit"
                                    disabled={twoFactorForm.processing}
                                    className={`flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md disabled:opacity-50 ${
                                        twoFactorAction === 'disable' ? 'bg-red-600 hover:bg-red-700' : ''
                                    }`}
                                    style={twoFactorAction === 'enable' ? { backgroundColor: primaryColor } : {}}
                                >
                                    {twoFactorAction === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowTwoFactorModal(false)}
                                    className="flex-1 py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
