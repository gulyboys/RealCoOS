import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { getCommunitySummaries } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function CommunitiesPage() {
  const communities = getCommunitySummaries();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Communities" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <Card title="Community Mapping and Metrics">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">DLD Area Aliases (EN)</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">DLD Area Aliases (AR)</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Projects</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Properties</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Owners</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Network Contacts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {communities.map(community => (
                    <tr key={community.id}>
                      <td className="py-4 text-xs font-semibold text-gray-900">{community.zoneName}</td>
                      <td className="py-4 text-xs font-bold text-gray-900">{community.name}</td>
                      <td className="py-4 text-xs text-gray-700">{community.dldAreaAliasesEn.join(', ') || '—'}</td>
                      <td className="py-4 text-xs text-gray-700">{community.dldAreaAliasesAr.join(', ') || '—'}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(community.projects)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(community.properties)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(community.owners)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(community.transactions)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(community.contacts)}</td>
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
