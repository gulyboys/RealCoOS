import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'unknown' | 'success';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        unknown: 'bg-orange-50 text-orange-700 border border-orange-100',
        success: 'bg-green-50 text-green-700 border border-green-100',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
