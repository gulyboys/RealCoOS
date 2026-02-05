'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { TransactionRow } from '@/lib/databricks/queries/adapters/transactionsAdapter';

export default function MarketPage() {
    const [area, setArea] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [trends, setTrends] = useState<TransactionRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!area.trim()) return;

        setIsSearching(true);
        setError(null);
        setTrends([]);

        try {
            const res = await fetch(`/api/trends?area=${encodeURIComponent(area)}`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setTrends(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex bg-[#fcfcfc] min-h-screen">
            <div className="flex-1 flex flex-col">
                <Topbar title="Market Intelligence" />

                <div className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full">
                    <Card className="mb-10">
                        <form onSubmit={handleSearch} className="flex space-x-4">
                            <input
                                type="text"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="Enter Area Name (e.g. Dubai Marina)..."
                                className="flex-1 px-6 py-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:outline-none text-sm font-medium transition-all"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                            >
                                ANALYZE AREA
                            </button>
                        </form>
                    </Card>

                    {error && <ErrorState message={error} />}
                    {isSearching && <LoadingState />}

                    {!isSearching && trends.length > 0 && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <StatCard label="Total Volume" value={`${trends.length}`} color="purple" />
                                <StatCard label="Avg Price" value="Unknown" color="blue" />
                                <StatCard label="Trends PPSF" value="—" color="yellow" />
                                <StatCard label="Market Status" value="READ-ONLY" />
                            </div>

                            <Card title="Recent Transactions in Area">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                                                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount (AED)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {trends.slice(0, 50).map((tx, idx) => (
                                                <tr key={idx} className="group">
                                                    <td className="py-4 text-xs font-medium text-gray-500">
                                                        {tx.instance_date ? new Date(tx.instance_date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="py-4 text-xs font-bold text-gray-900">
                                                        {tx.project_name_en || 'Unknown Project'}
                                                    </td>
                                                    <td className="py-4 text-xs font-bold text-gray-900 text-right">
                                                        {tx.actual_worth ? Number(tx.actual_worth).toLocaleString() : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {!isSearching && trends.length === 0 && !error && (
                        <EmptyState message="Enter an area name to see historical market performance." />
                    )}
                </div>
            </div>
        </div>
    );
}
