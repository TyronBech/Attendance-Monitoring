import { Head, router, usePage } from '@inertiajs/react';
import { Filter, Search, FileText, Download, Calendar, Monitor, Clock } from 'lucide-react';
import { useState } from 'react';
import report from '@/routes/report';

interface ComputerLogEntry {
    id: number;
    time_in: string;
    remarks: string | null;
    user: {
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        students?: {
            level: string;
            section: string;
        } | null;
        employees?: {
            employee_role: string;
        } | null;
    };
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: ComputerLogEntry[];
    current_page: number;
    last_page: number;
    links: PaginationLinks[];
    total: number;
    per_page: number;
}

interface SharedProps {
    data: PaginatedData;
    search: string;
    fromInputDate: string;
    toInputDate: string;
    peak_hour: string;
    perPage: number;
    userType: string;
    ui: {
        theme_colors: {
            primary: string;
            secondary: string;
            tertiary: string;
        };
    };
    [key: string]: any;
}

export default function ComputersReport() {
    const { data, search, fromInputDate, toInputDate, peak_hour, perPage, userType, ui } = usePage<SharedProps>().props;
    
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [startDate, setStartDate] = useState(fromInputDate || '');
    const [endDate, setEndDate] = useState(toInputDate || '');
    const [typeFilter, setTypeFilter] = useState(userType || 'students');
    const [limit] = useState(perPage || 10);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(report.computerUse.url({
            query: {
                search: searchTerm,
                start: startDate,
                end: endDate,
                user_type: typeFilter,
                perPage: limit,
            }
        }), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExportPdf = () => {
        window.location.href = report.computerUse.exportPdf.url({
            query: {
                search: searchTerm,
                start: startDate,
                end: endDate,
                user_type: typeFilter,
            }
        });
    };

    const handleExportCsv = () => {
        window.location.href = report.computerUse.export.url({
            query: {
                format: 'csv',
                search: searchTerm,
                start: startDate,
                end: endDate,
            }
        });
    };

    return (
        <>
            <Head title="Online Research Report" />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold text-gray-800 dark:text-white mt-8 mb-8">Online Research Report</h1>

                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <Calendar size={14} className="mr-1" /> Date Range
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                />
                                <span className="text-gray-400">to</span>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <Search size={14} className="mr-1" /> Search
                            </label>
                            <input 
                                type="text" 
                                placeholder="Name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <Monitor size={14} className="mr-1" /> User Group
                            </label>
                            <select 
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                            >
                                <option value="students">Students</option>
                                <option value="employees">Faculties & Staff</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                type="submit"
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                style={{ backgroundColor: ui.theme_colors.primary }}
                            >
                                <Filter size={18} className="mr-2" /> Find
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 flex flex-wrap gap-3 justify-between items-center border-t dark:border-gray-700 pt-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mr-3">
                                <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Peak Hour</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{peak_hour || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={handleExportPdf}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
                            >
                                <FileText size={18} className="mr-2" /> PDF Export
                            </button>
                            <button 
                                onClick={handleExportCsv}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
                            >
                                <Download size={18} className="mr-2" /> CSV Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {typeFilter === 'students' ? 'Level & Section' : 'Position/Role'}
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose / Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {data.data.length > 0 ? (
                                    data.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {log.user.last_name}, {log.user.first_name} {log.user.middle_name ? log.user.middle_name[0] + '.' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {typeFilter === 'students' 
                                                        ? `${log.user.students?.level || ''} - ${log.user.students?.section || ''}`
                                                        : (log.user.employees?.employee_role || 'N/A')
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(log.time_in).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {log.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                                            No online research logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium text-gray-900 dark:text-white">{data.data.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{data.total}</span> entries
                            </div>
                            <div className="flex gap-1">
                                {data.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {
                                            search: searchTerm,
                                            start: startDate,
                                            end: endDate,
                                            user_type: typeFilter,
                                            perPage: limit
                                        }, { preserveState: true })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                            link.active 
                                                ? 'bg-primary-600 text-white' 
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={link.active ? { backgroundColor: ui.theme_colors.primary } : {}}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
