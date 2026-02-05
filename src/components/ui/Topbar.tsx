import React from 'react';

interface TopbarProps {
    title: string;
}

export function Topbar({ title }: TopbarProps) {
    return (
        <header className="h-20 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Live Truth</span>
                </div>

                <div className="flex space-x-3">
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">📅</button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">✉️</button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
                        🔔
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
