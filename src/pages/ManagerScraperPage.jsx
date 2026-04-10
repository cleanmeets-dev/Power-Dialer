import React, { useState } from 'react';
import { Search, Loader2, Download, MapPin, Phone, Star } from 'lucide-react';
import api from '../services/api';

export default function ManagerScraperPage() {
    const [businessType, setBusinessType] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const combinedKeyword = `${businessType.trim()} in ${location.trim()}`;
        if (!businessType.trim() || !location.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const { data } = await api.post('/scraper/maps', { keyword: combinedKeyword, maxResults: 50 });
            if (data.success) {
                setResults(data.data);
            } else {
                setError(data.message || 'Scraping failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error occurred while scraping');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!results || results.length === 0) return;

        const headers = ['Name', 'Phone', 'Address', 'Rating', 'URL'];
        const csvRows = [
            headers.join(','),
            ...results.map(row => {
                const values = [
                    `"${row.name || ''}"`,
                    `"${row.phone || ''}"`,
                    `"${row.address || ''}"`,
                    row.rating || '',
                    `"${row.url || ''}"`
                ];
                return values.join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${businessType.replace(/\s+/g, '_')}_${location.replace(/\s+/g, '_')}_leads.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Map Scraper
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Extract business leads directly from Google Maps.
                    </p>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                placeholder="Business Type (e.g. Gyms)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                disabled={loading}
                            />
                        </div>
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Location (e.g. Austin, TX)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !businessType.trim() || !location.trim()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            'Start'
                        )}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20">
                        {error}
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                            Scraping Results <span className="text-sm font-normal text-slate-500 ml-2">({results.length} found)</span>
                        </h2>
                        <button
                            onClick={handleExportCSV}
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="p-4 pl-6 font-medium whitespace-nowrap">Business Name</th>
                                    <th className="p-4 font-medium whitespace-nowrap">Phone Number</th>
                                    <th className="p-4 font-medium whitespace-nowrap">Address</th>
                                    <th className="p-4 pr-6 font-medium whitespace-nowrap text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {results.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="font-medium text-slate-900 dark:text-white">{row.name}</div>
                                            <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline inline-block mt-1">View on Map</a>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {row.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {row.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">Not available</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {row.address ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                                                    <span className="line-clamp-2 text-sm">{row.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">Not available</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {row.rating ? (
                                                <div className="flex items-center justify-end gap-1 font-medium text-amber-600 dark:text-amber-500">
                                                    {row.rating} <Star className="w-4 h-4 fill-amber-500/20" />
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
