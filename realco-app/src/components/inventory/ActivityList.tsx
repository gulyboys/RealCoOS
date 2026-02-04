import React from 'react';
import { TransactionRow } from '@/lib/databricks/queries/adapters/transactionsAdapter';

interface ActivityListProps {
    transactions: TransactionRow[];
    title?: string;
}

export function ActivityList({ transactions, title = 'Transactions' }: ActivityListProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">{title}</h3>
                <p className="text-xs text-gray-400 italic">No activity recorded for this unit.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">{title}</h3>
            <div className="space-y-6">
                {transactions.map((tx, idx) => (
                    <div key={tx.transaction_id || idx} className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                            <span className="text-lg">🏢</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {tx.trans_group_en || 'Transaction'}
                                </p>
                                <p className="text-sm font-bold text-gray-900 ml-2">
                                    {tx.actual_worth ? Number(tx.actual_worth).toLocaleString() : '—'}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-400">
                                    {tx.instance_date ? new Date(tx.instance_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Unknown Date'}
                                </p>
                                <p className={`text-[10px] font-bold uppercase ${tx.actual_worth ? 'text-green-600' : 'text-gray-400'}`}>
                                    {tx.actual_worth ? 'WON' : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
