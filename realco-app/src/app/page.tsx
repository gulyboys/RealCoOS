import React from 'react';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Overview" />

        <div className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Inventory" value="239k+" color="purple" />
            <StatCard label="Total Transactions" value="1.6M+" color="blue" />
            <StatCard label="Data Source" value="DLD Gold" color="yellow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card title="Quick Actions" className="bg-white">
              <div className="grid grid-cols-1 gap-4">
                <Link href="/inventory" className="p-6 border border-gray-50 rounded-2xl hover:border-gray-200 hover:bg-gray-50 transition-all flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Search Inventory</p>
                    <p className="text-xs text-gray-400 mt-1">Resolve units to Ground Truth</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-900">→</span>
                </Link>
                <Link href="/market" className="p-6 border border-gray-50 rounded-2xl hover:border-gray-200 hover:bg-gray-50 transition-all flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Market Intelligence</p>
                    <p className="text-xs text-gray-400 mt-1">Analyze area trends and PPSF</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-900">→</span>
                </Link>
              </div>
            </Card>

            <Card title="OS Governance" className="bg-gray-900 text-white">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-50">Operational Doctrine</p>
                  <p className="text-sm italic text-gray-300 leading-relaxed">
                    "Decisions are stored in Canonical Memory. Market facts are locked in Databricks. No data is inferred."
                  </p>
                </div>
                <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Armed</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">V1.0.4-Stable</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
