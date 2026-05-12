import { usePage } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    const { ui, name } = usePage().props as any;
    const year = new Date().getFullYear();

    const socialLinks = ui?.social_links || {};

    return (
        <footer className="bg-white dark:bg-gray-900 mt-10 border-t border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between md:gap-6 lg:gap-8">
                    <div className="mb-6 md:mb-0 md:max-w-xs lg:max-w-md">
                        <a 
                            href={socialLinks.website || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center"
                        >
                            {ui?.org_logo_base64 && (
                                <img 
                                    src={ui.org_logo_base64} 
                                    className="h-12 w-12 md:h-16 md:w-16 me-3 rounded-full shrink-0" 
                                    alt={`${ui.org_name || name} Logo`} 
                                />
                            )}
                            <div className="min-w-0">
                                <span className="self-center text-sm md:text-lg font-semibold dark:text-white wrap-break-word">
                                    {ui?.org_name || name}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 wrap-break-word">
                                    {ui?.org_address || '123 Main St, City, Country'}
                                </p>
                            </div>
                        </a>
                        <p className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {name} Admin Panel for managing school library attendance and resources.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 sm:gap-6 sm:grid-cols-3 flex-1">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Official Links</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href={socialLinks.website || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">Official Website</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline">E-Library</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow us</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                {socialLinks.facebook && (
                                    <li className="mb-4">
                                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
                                    </li>
                                )}
                                {socialLinks.instagram && (
                                    <li className="mb-4">
                                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
                                    </li>
                                )}
                                {socialLinks.twitter && (
                                    <li className="mb-4">
                                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">X (Twitter)</a>
                                    </li>
                                )}
                                {socialLinks.youtube && (
                                    <li className="mb-4">
                                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:underline">YouTube</a>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Contact Us</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                {ui?.contact_number && (
                                    <li className="mb-4">
                                        <a href={`tel:${ui.contact_number}`} className="hover:underline">{ui.contact_number}</a>
                                    </li>
                                )}
                                {ui?.email && (
                                    <li className="mb-4">
                                        <a href={`mailto:${ui.email}`} className="hover:underline">{ui.email}</a>
                                    </li>
                                )}
                                <li>
                                    <a href="mailto:owlquery.tech@gmail.com" className="hover:underline">owlquery.tech@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                        &copy; {year} <a href="mailto:owlquery.tech@gmail.com" className="hover:underline">OwlQuery Group</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Facebook className="w-4 h-4" />
                                <span className="sr-only">Facebook page</span>
                            </a>
                        )}
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5 transition-colors">
                                <Instagram className="w-4 h-4" />
                                <span className="sr-only">Instagram page</span>
                            </a>
                        )}
                        {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5 transition-colors">
                                <Twitter className="w-4 h-4" />
                                <span className="sr-only">X page</span>
                            </a>
                        )}
                        {socialLinks.youtube && (
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5 transition-colors">
                                <Youtube className="w-4 h-4" />
                                <span className="sr-only">YouTube channel</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
