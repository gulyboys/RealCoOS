'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', href: '/', icon: '📊' },
        { name: 'Inventory', href: '/inventory', icon: '🏢' },
        { name: 'Market', href: '/market', icon: '📈' },
        { name: 'Monday Sync', href: '/sync', icon: '🔄' }, // Placeholder for future
    ];

    return (
        <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
            <div className="p-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">REALCO OS</h1>
            </div>

            <nav className="flex-1 px-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-8 border-t border-gray-50">
                <div className="flex items-center space-x-3 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Admin</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">RealCo Agent</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
