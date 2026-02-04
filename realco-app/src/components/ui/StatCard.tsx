import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    color?: 'white' | 'purple' | 'yellow' | 'blue';
}

export function StatCard({ label, value, color = 'white' }: StatCardProps) {
    const colors = {
        white: 'bg-white text-gray-900 border-gray-100',
        purple: 'bg-purple-100 text-purple-900 border-transparent',
        yellow: 'bg-yellow-100 text-yellow-900 border-transparent',
        blue: 'bg-blue-100 text-blue-900 border-transparent',
    };

    return (
        <div className={`p-6 rounded-2xl border shadow-sm ${colors[color]}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 opacity-70`}>{label}</p>
            <h2 className="text-2xl font-bold">{value || '—'}</h2>
        </div>
    );
}
