'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { TransactionRow } from '@/lib/databricks/queries/adapters/transactionsAdapter';

const DEFAULT_AREA = 'Dubai Marina';
const MAX_BREAKDOWN_ROWS = 12;

interface MonthlyPoint {
  key: string;
  label: string;
  count: number;
  volume: number;
}

interface BreakdownRow {
  project: string;
  transactions: number;
  volume: number;
}

function toNumber(value: TransactionRow['actual_worth']): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCompactCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, idx) => {
      const x = (idx / (values.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-36 w-full rounded-xl bg-gray-50 p-3"
      aria-label="Trend sparkline"
    >
      <polyline
        fill="none"
        stroke="rgb(17 24 39)"
        strokeWidth="3"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [area, setArea] = useState(DEFAULT_AREA);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const runQuery = useCallback(async (targetArea: string) => {
    if (!targetArea.trim()) {
      setRows([]);
      setHasLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/trends?area=${encodeURIComponent(targetArea)}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data.');
      const data = (await res.json()) as TransactionRow[];
      setRows(Array.isArray(data) ? data : []);
      setLastRefreshedAt(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data.';
      setError(message);
      setRows([]);
    } finally {
      setHasLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void runQuery(DEFAULT_AREA);
  }, [runQuery]);

  const monthlyTrend = useMemo<MonthlyPoint[]>(() => {
    const monthMap = new Map<string, MonthlyPoint>();

    for (const row of rows) {
      if (!row.instance_date) continue;
      const date = new Date(row.instance_date);
      if (Number.isNaN(date.getTime())) continue;

      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const current = monthMap.get(key) ?? { key, label, count: 0, volume: 0 };
      current.count += 1;
      current.volume += toNumber(row.actual_worth);
      monthMap.set(key, current);
    }

    return Array.from(monthMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12);
  }, [rows]);

  const projectBreakdown = useMemo<BreakdownRow[]>(() => {
    const projectMap = new Map<string, BreakdownRow>();

    for (const row of rows) {
      const project = (row.project_name_en || 'Unknown Project').trim() || 'Unknown Project';
      const current = projectMap.get(project) ?? { project, transactions: 0, volume: 0 };
      current.transactions += 1;
      current.volume += toNumber(row.actual_worth);
      projectMap.set(project, current);
    }

    return Array.from(projectMap.values())
      .sort((a, b) => b.volume - a.volume || b.transactions - a.transactions)
      .slice(0, MAX_BREAKDOWN_ROWS);
  }, [rows]);

  const totals = useMemo(() => {
    let volume = 0;
    let latestDate: Date | null = null;

    for (const row of rows) {
      volume += toNumber(row.actual_worth);
      if (!row.instance_date) continue;

      const date = new Date(row.instance_date);
      if (Number.isNaN(date.getTime())) continue;
      if (!latestDate || date > latestDate) latestDate = date;
    }

    return {
      transactions: rows.length,
      volume,
      avgTicket: rows.length ? volume / rows.length : 0,
      latestDate,
    };
  }, [rows]);

  const hasRows = rows.length > 0;
  const highestCount = Math.max(...monthlyTrend.map((p) => p.count), 1);
  const sparklineValues = monthlyTrend.map((p) => p.volume);
  const latestSparkValue = sparklineValues[sparklineValues.length - 1] ?? 0;
  const kpiCards = [
    {
      label: 'Total Transactions',
      value: hasRows ? totals.transactions.toLocaleString() : '—',
      color: 'purple' as const,
    },
    {
      label: 'Total Volume',
      value: hasRows ? formatCompactCurrency(totals.volume) : '—',
      color: 'blue' as const,
    },
    {
      label: 'Avg Ticket',
      value: hasRows ? formatCompactCurrency(totals.avgTicket) : '—',
      color: 'yellow' as const,
    },
    {
      label: 'Latest Transaction',
      value: totals.latestDate ? totals.latestDate.toLocaleDateString('en-US') : '—',
      color: 'white' as const,
    },
  ];

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Dashboard Shell" />

        <div className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full space-y-8">
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void runQuery(area);
              }}
              className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6"
            >
              <div className="space-y-2 md:max-w-2xl">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Assumptions</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="unknown">Entity inferred: Area</Badge>
                  <Badge variant="default">Source: /api/trends</Badge>
                  <Badge variant="default">Currency: AED</Badge>
                  <Badge variant="default">Read-only shell</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  This shell is wired to transaction rows and can be swapped to a dedicated dashboard endpoint
                  without changing the KPI, trend, or breakdown layout.
                </p>
              </div>

              <div className="flex flex-1 gap-3 md:max-w-xl">
                <input
                  type="text"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Enter area name (e.g. Downtown Dubai)"
                  className="flex-1 px-5 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:outline-none text-sm font-medium transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors whitespace-nowrap"
                >
                  REFRESH
                </button>
              </div>
            </form>

            <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500 flex flex-wrap items-center gap-4">
              <span>Wiring point: `/api/trends?area=&lt;name&gt;`</span>
              <span>Grouping: `instance_date` (monthly), `project_name_en`</span>
              <span>
                Last refresh: {lastRefreshedAt ? lastRefreshedAt.toLocaleString('en-US') : 'Not refreshed yet'}
              </span>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiCards.map((kpi) => (
              <StatCard key={kpi.label} label={kpi.label} value={kpi.value} color={kpi.color} />
            ))}
          </div>

          {error && <ErrorState message={error} />}
          {isLoading && <LoadingState />}

          {!isLoading && !error && hasLoaded && !hasRows && (
            <EmptyState message="No records returned. Try another area or connect a dedicated dashboard endpoint." />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Transactions Trend (12 Months)">
              {monthlyTrend.length === 0 ? (
                <EmptyState message="No dated records available to render the trend." />
              ) : (
                <div className="space-y-4">
                  <div className="h-44 flex items-end gap-2">
                    {monthlyTrend.map((point) => (
                      <div key={point.key} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-md bg-gray-900/85"
                          style={{ height: `${Math.max((point.count / highestCount) * 100, 8)}%` }}
                          title={`${point.label}: ${point.count.toLocaleString()} transactions`}
                        />
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest truncate max-w-full">
                          {point.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Count trend is derived from `instance_date`.</p>
                </div>
              )}
            </Card>

            <Card title="Volume Trend (12 Months)">
              {sparklineValues.length < 2 ? (
                <EmptyState message="Need at least two monthly points to draw volume trend." />
              ) : (
                <div className="space-y-4">
                  <Sparkline values={sparklineValues} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Latest month: {formatCurrency(latestSparkValue)}</span>
                    <span>Peak month: {formatCurrency(Math.max(...sparklineValues))}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card title="Breakdown by Project">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Transactions
                    </th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Volume (AED)
                    </th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Avg Ticket
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projectBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs font-medium text-gray-400">
                        No project rows yet. Keep this table shape and wire a dedicated breakdown source when ready.
                      </td>
                    </tr>
                  )}
                  {projectBreakdown.map((row) => (
                    <tr key={row.project}>
                      <td className="py-4 text-xs font-bold text-gray-900">{row.project}</td>
                      <td className="py-4 text-xs font-medium text-gray-700 text-right">
                        {row.transactions.toLocaleString()}
                      </td>
                      <td className="py-4 text-xs font-medium text-gray-700 text-right">
                        {formatCurrency(row.volume)}
                      </td>
                      <td className="py-4 text-xs font-medium text-gray-700 text-right">
                        {formatCurrency(row.transactions ? row.volume / row.transactions : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
