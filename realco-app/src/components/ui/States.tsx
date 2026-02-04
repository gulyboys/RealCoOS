import React from 'react';

export function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-100 mb-4"></div>
            <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-50 rounded"></div>
        </div>
    );
}

export function EmptyState({ message = 'No data available' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm font-medium">{message}</p>
        </div>
    );
}

export function ErrorState({ message = 'An error occurred' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-700 text-sm font-medium">{message}</p>
        </div>
    );
}
