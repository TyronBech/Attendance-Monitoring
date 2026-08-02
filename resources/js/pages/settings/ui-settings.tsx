import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit3, Facebook, Globe, Instagram, Mail, MapPin, Phone, Twitter, Youtube, X, UploadCloud, Info } from 'lucide-react';
import { useState  } from 'react';
import type {FormEventHandler} from 'react';
import SettingsLayout from '@/layouts/settings/layout';
import settingsRoutes from '@/routes/settings';

interface UISettings {
    org_name: string;
    org_initial: string;
    org_address: string;
    email: string;
    contact_number: string;
    org_logo_base64: string | null;
    org_logo_full_base64: string | null;
    social_links: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        website?: string;
    };
    theme_colors: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
}

interface SharedProps {
    settings: UISettings;
    [key: string]: any;
}

export default function UISettingsPage() {
    const { settings } = usePage<SharedProps>().props;
    const [showEditModal, setShowEditModal] = useState(false);
    const [previewLogo, setPreviewLogo] = useState<string | null>(settings.org_logo_base64);
    const [previewLogoFull, setPreviewLogoFull] = useState<string | null>(settings.org_logo_full_base64);

    const { data, setData, post, processing } = useForm({
        org_name: settings.org_name || '',
        org_initial: settings.org_initial || '',
        org_address: settings.org_address || '',
        email: settings.email || '',
        contact_number: settings.contact_number || '',
        org_logo: null as File | null,
        org_logo_full: null as File | null,
        facebook: settings.social_links?.facebook || '',
        instagram: settings.social_links?.instagram || '',
        twitter: settings.social_links?.twitter || '',
        youtube: settings.social_links?.youtube || '',
        website: settings.social_links?.website || '',
        primary: settings.theme_colors?.primary || '#3B82F6',
        secondary: settings.theme_colors?.secondary || '#6366F1',
        tertiary: settings.theme_colors?.tertiary || '#F59E0B',
    });

    const handleUpdateSettings: FormEventHandler = (e) => {
        e.preventDefault();
        post(settingsRoutes.updateUiSettings.url(), {
            onSuccess: () => {
                setShowEditModal(false);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_full') => {
        const file = e.target.files?.[0];

        if (file) {
            if (type === 'logo') {
                setData('org_logo', file);
                const reader = new FileReader();
                reader.onloadend = () => setPreviewLogo(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setData('org_logo_full', file);
                const reader = new FileReader();
                reader.onloadend = () => setPreviewLogoFull(reader.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    return (
        <>
            <Head title="System Settings" />

            <SettingsLayout>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 relative shadow-md w-full">
                    {/* Edit Button */}
                    <button 
                        onClick={() => setShowEditModal(true)}
                        className="absolute top-4 right-4 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out flex items-center"
                        style={{ backgroundColor: settings.theme_colors.primary }}
                    >
                        <Edit3 size={18} className="mr-2" />
                        <span className="hidden sm:inline">Edit Settings</span>
                    </button>

                    {/* Organization Details Section */}
                    <div className="mb-10 mt-12 sm:mt-8">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 border-b dark:border-gray-700 pb-2">Organization Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Organization Name</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{settings.org_name || 'Not set'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Organization Initial</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{settings.org_initial || 'Not set'}</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Organization Address</label>
                                <div className="flex items-start">
                                    <MapPin size={18} className="mr-2 mt-1 text-gray-400" />
                                    <p className="text-gray-800 dark:text-white">{settings.org_address || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                                    <div className="flex items-center">
                                        <Mail size={18} className="mr-2 text-gray-400" />
                                        <p className="text-gray-800 dark:text-white">{settings.email || 'Not set'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Number</label>
                                    <div className="flex items-center">
                                        <Phone size={18} className="mr-2 text-gray-400" />
                                        <p className="text-gray-800 dark:text-white">{settings.contact_number || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Icon Logo</label>
                                    <div className="h-48 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                                        {settings.org_logo_base64 ? (
                                            <img src={settings.org_logo_base64.startsWith('data:') ? settings.org_logo_base64 : `data:image/png;base64,${settings.org_logo_base64}`} alt="Logo" className="max-h-full object-contain" />
                                        ) : (
                                            <p className="text-gray-400">No logo uploaded</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Full Banner Logo</label>
                                    <div className="h-48 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                                        {settings.org_logo_full_base64 ? (
                                            <img src={settings.org_logo_full_base64.startsWith('data:') ? settings.org_logo_full_base64 : `data:image/png;base64,${settings.org_logo_full_base64}`} alt="Full Logo" className="max-h-full object-contain" />
                                        ) : (
                                            <p className="text-gray-400">No logo uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 border-b dark:border-gray-700 pb-2">Social Links</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <Facebook className="text-blue-600" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-500">Facebook</p>
                                    <p className="text-sm font-medium truncate">{settings.social_links?.facebook || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <Instagram className="text-pink-600" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-500">Instagram</p>
                                    <p className="text-sm font-medium truncate">{settings.social_links?.instagram || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <Twitter className="text-sky-500" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-500">Twitter (X)</p>
                                    <p className="text-sm font-medium truncate">{settings.social_links?.twitter || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <Youtube className="text-red-600" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-500">YouTube</p>
                                    <p className="text-sm font-medium truncate">{settings.social_links?.youtube || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 lg:col-span-2">
                                <Globe className="text-indigo-500" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-500">Official Website</p>
                                    <p className="text-sm font-medium truncate">{settings.social_links?.website || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Colors Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 border-b dark:border-gray-700 pb-2">Theme Colors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Primary Color</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded shadow-sm border border-white" style={{ backgroundColor: settings.theme_colors.primary }}></div>
                                    <span className="font-mono text-sm">{settings.theme_colors.primary}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Secondary Color</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded shadow-sm border border-white" style={{ backgroundColor: settings.theme_colors.secondary }}></div>
                                    <span className="font-mono text-sm">{settings.theme_colors.secondary}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Tertiary Color</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded shadow-sm border border-white" style={{ backgroundColor: settings.theme_colors.tertiary }}></div>
                                    <span className="font-mono text-sm">{settings.theme_colors.tertiary}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit System Settings</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-8">
                                {/* Organization Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-1 bg-primary-500 rounded-full" style={{ backgroundColor: settings.theme_colors.primary }}></div>
                                        <h4 className="text-lg font-bold">Organization Details</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Organization Name</label>
                                            <input 
                                                type="text" 
                                                value={data.org_name}
                                                onChange={e => setData('org_name', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Organization Initial</label>
                                            <input 
                                                type="text" 
                                                value={data.org_initial}
                                                onChange={e => setData('org_initial', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Contact Number</label>
                                            <input 
                                                type="text" 
                                                value={data.contact_number}
                                                onChange={e => setData('contact_number', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Address</label>
                                            <textarea 
                                                rows={2}
                                                value={data.org_address}
                                                onChange={e => setData('org_address', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            ></textarea>
                                        </div>
                                    </div>
                                </section>

                                {/* Logos Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-1 bg-primary-500 rounded-full" style={{ backgroundColor: settings.theme_colors.primary }}></div>
                                        <h4 className="text-lg font-bold">Logos</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Icon Logo (PNG, max 5MB)</label>
                                            <div 
                                                className="h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary-500 transition-colors"
                                                onClick={() => document.getElementById('logo_input')?.click()}
                                            >
                                                {previewLogo ? (
                                                    <img src={previewLogo.startsWith('data:') ? previewLogo : `data:image/png;base64,${previewLogo}`} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 group-hover:blur-sm transition-all" />
                                                ) : (
                                                    <UploadCloud size={48} className="text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                                    <UploadCloud size={32} />
                                                    <span className="text-sm font-semibold">Click to upload</span>
                                                </div>
                                                <input id="logo_input" type="file" accept="image/png" className="hidden" onChange={e => handleFileChange(e, 'logo')} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Full Banner Logo (PNG, max 5MB)</label>
                                            <div 
                                                className="h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary-500 transition-colors"
                                                onClick={() => document.getElementById('logo_full_input')?.click()}
                                            >
                                                {previewLogoFull ? (
                                                    <img src={previewLogoFull.startsWith('data:') ? previewLogoFull : `data:image/png;base64,${previewLogoFull}`} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 group-hover:blur-sm transition-all" />
                                                ) : (
                                                    <UploadCloud size={48} className="text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                                    <UploadCloud size={32} />
                                                    <span className="text-sm font-semibold">Click to upload</span>
                                                </div>
                                                <input id="logo_full_input" type="file" accept="image/png" className="hidden" onChange={e => handleFileChange(e, 'logo_full')} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                                        <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            Please use high-quality PNG images with transparent backgrounds for the best visual results.
                                        </p>
                                    </div>
                                </section>

                                {/* Social Links */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-1 bg-primary-500 rounded-full" style={{ backgroundColor: settings.theme_colors.primary }}></div>
                                        <h4 className="text-lg font-bold">Social Links</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Facebook URL</label>
                                            <input type="url" value={data.facebook} onChange={e => setData('facebook', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" placeholder="https://facebook.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Instagram URL</label>
                                            <input type="url" value={data.instagram} onChange={e => setData('instagram', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" placeholder="https://instagram.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Twitter URL</label>
                                            <input type="url" value={data.twitter} onChange={e => setData('twitter', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" placeholder="https://twitter.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">YouTube URL</label>
                                            <input type="url" value={data.youtube} onChange={e => setData('youtube', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" placeholder="https://youtube.com/..." />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Official Website URL</label>
                                            <input type="url" value={data.website} onChange={e => setData('website', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" placeholder="https://..." />
                                        </div>
                                    </div>
                                </section>

                                {/* Colors */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-1 bg-primary-500 rounded-full" style={{ backgroundColor: settings.theme_colors.primary }}></div>
                                        <h4 className="text-lg font-bold">Theme Colors</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="text-sm font-medium">Primary</label>
                                            <input type="color" value={data.primary} onChange={e => setData('primary', e.target.value)} className="w-full h-12 rounded cursor-pointer border-none p-0" />
                                            <span className="text-xs font-mono">{data.primary}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="text-sm font-medium">Secondary</label>
                                            <input type="color" value={data.secondary} onChange={e => setData('secondary', e.target.value)} className="w-full h-12 rounded cursor-pointer border-none p-0" />
                                            <span className="text-xs font-mono">{data.secondary}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="text-sm font-medium">Tertiary</label>
                                            <input type="color" value={data.tertiary} onChange={e => setData('tertiary', e.target.value)} className="w-full h-12 rounded cursor-pointer border-none p-0" />
                                            <span className="text-xs font-mono">{data.tertiary}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-8 py-2.5 rounded-lg text-white font-bold shadow-lg disabled:opacity-50"
                                    style={{ backgroundColor: settings.theme_colors.primary }}
                                >
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
