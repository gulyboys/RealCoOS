import Link from 'next/link';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { getDashboardProjectRows, getHierarchyTotals, getZoneSummaries } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function DashboardPage() {
  const totals = getHierarchyTotals();
  const zones = getZoneSummaries();
  const projectRows = getDashboardProjectRows();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Hierarchy Dashboard" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <Card>
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Main Hierarchy</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Zones</Badge>
                <span className="text-xs text-gray-400">&gt;</span>
                <Badge variant="success">Community</Badge>
                <span className="text-xs text-gray-400">&gt;</span>
                <Badge variant="success">Project</Badge>
                <span className="text-xs text-gray-400">&gt;</span>
                <Badge variant="success">Property</Badge>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                DLD area aliases (Arabic and English) are normalized into communities and grouped under zones.
                Network and CRM contacts can be scoped at community, project, or property level.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
            <StatCard label="Zones" value={formatNumber(totals.zones)} color="purple" />
            <StatCard label="Communities" value={formatNumber(totals.communities)} color="blue" />
            <StatCard label="Projects" value={formatNumber(totals.projects)} color="yellow" />
            <StatCard label="Properties" value={formatNumber(totals.properties)} />
            <StatCard label="Transactions" value={formatNumber(totals.transactions)} color="blue" />
            <StatCard label="Network Contacts" value={formatNumber(totals.contacts)} color="purple" />
          </div>

          <Card title="Zone Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {zones.map(zone => (
                <Link
                  key={zone.id}
                  href={`/hierarchy/projects?zoneId=${encodeURIComponent(zone.id)}`}
                  className="rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900">{zone.name}</p>
                    <Badge>{formatNumber(zone.transactions)} tx</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider">Projects</p>
                      <p className="font-bold text-gray-900">{formatNumber(zone.projects)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider">Owners</p>
                      <p className="font-bold text-gray-900">{formatNumber(zone.owners)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider">Contacts</p>
                      <p className="font-bold text-gray-900">{formatNumber(zone.contacts)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Projects Inside Zones">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Owners</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Network Contacts</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Properties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projectRows.map(row => (
                    <tr key={row.projectId}>
                      <td className="py-4 text-xs font-bold text-gray-900">{row.zoneName}</td>
                      <td className="py-4 text-xs text-gray-700">{row.communityName}</td>
                      <td className="py-4 text-xs text-gray-700">{row.masterProject}</td>
                      <td className="py-4 text-xs font-semibold text-gray-900">{row.projectName}</td>
                      <td className="py-4 text-xs text-gray-700 text-right">{formatNumber(row.owners)}</td>
                      <td className="py-4 text-xs text-gray-700 text-right">{formatNumber(row.transactions)}</td>
                      <td className="py-4 text-xs text-gray-700 text-right">{formatNumber(row.contacts)}</td>
                      <td className="py-4 text-xs text-gray-700 text-right">{formatNumber(row.properties)}</td>
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
