import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { getZoneSummaries } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function ZonesPage() {
  const zones = getZoneSummaries();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Zones" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <Card title="Zone Summary">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Communities</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Projects</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Properties</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Owners</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Network Contacts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {zones.map(zone => (
                    <tr key={zone.id}>
                      <td className="py-4 text-xs font-bold text-gray-900">{zone.name}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.communities)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.projects)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.properties)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.owners)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.transactions)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(zone.contacts)}</td>
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
