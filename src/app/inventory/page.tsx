'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/ui/Topbar';
import { SearchSection } from '@/components/inventory/SearchSection';
import { Card } from '@/components/ui/Card';
import { TruthCard } from '@/components/inventory/TruthCard';
import { ActivityList } from '@/components/inventory/ActivityList';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { BuildingRow } from '@/lib/databricks/queries/adapters/buildingsAdapter';
import { TransactionRow } from '@/lib/databricks/queries/adapters/transactionsAdapter';

export default function InventoryPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<BuildingRow[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<BuildingRow | null>(null);
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (term: string) => {
        setIsSearching(true);
        setError(null);
        setResults([]);
        setSelectedUnit(null);
        setTransactions([]);

        try {
            // We use a fetch instead of importing registry directly to avoid node-only imports in client
            const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
            if (!res.ok) throw new Error('Failed to fetch results');
            const data = await res.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectUnit = async (unit: BuildingRow) => {
        setSelectedUnit(unit);
        setTransactions([]);

        try {
            const res = await fetch(`/api/transactions?id=${unit.property_id}`);
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex bg-[#fcfcfc] min-h-screen">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col border-r border-gray-100">
                <Topbar title="Inventory" />

                <div className="flex-1 p-10 overflow-y-auto">
                    <SearchSection onSearch={handleSearch} isSearching={isSearching} />

                    {error && <ErrorState message={error} />}

                    {isSearching && <LoadingState />}

                    {!isSearching && !selectedUnit && results.length > 0 && (
                        <Card title="Search Results">
                            <div className="space-y-2">
                                {results.map((unit) => (
                                    <button
                                        key={unit.property_id}
                                        onClick={() => handleSelectUnit(unit)}
                                        className="w-full text-left p-4 rounded-xl border border-gray-50 hover:border-gray-200 hover:bg-gray-50 transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-black">{unit.project_name_en || 'Unnamed Project'}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{unit.area_name_en} • ID: {unit.property_id}</p>
                                        </div>
                                        <span className="text-gray-300 group-hover:text-gray-900 transition-colors">→</span>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {!isSearching && !selectedUnit && results.length === 0 && !error && (
                        <EmptyState message="Search for a property to begin resolution." />
                    )}

                    {selectedUnit && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    onClick={() => setSelectedUnit(null)}
                                    className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center space-x-2 transition-colors uppercase tracking-widest"
                                >
                                    <span>←</span> <span>Back to search</span>
                                </button>
                                <div className="flex space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Live Ground Truth</span>
                                </div>
                            </div>
                            <TruthCard unit={selectedUnit} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Rail */}
            <div className="w-96 h-screen sticky top-0 bg-white overflow-y-auto hidden xl:block">
                <ActivityList transactions={transactions} />
            </div>
        </div>
    );
}
