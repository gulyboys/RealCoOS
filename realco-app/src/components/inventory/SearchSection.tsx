'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface SearchSectionProps {
    onSearch: (term: string) => void;
    isSearching: boolean;
}

export function SearchSection({ onSearch, isSearching }: SearchSectionProps) {
    const [term, setTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            onSearch(term);
        }
    };

    return (
        <Card className="mb-8">
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <span className="absolute left-6 text-gray-400">🔍</span>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search by Area, Project, or Property ID..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:outline-none text-sm font-medium text-gray-900 transition-all"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-3 px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                >
                    {isSearching ? '...' : 'SEARCH'}
                </button>
            </form>
        </Card>
    );
}
