import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { getPropertySummaries } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function PropertiesPage() {
  const properties = getPropertySummaries();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Properties" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <Card title="Property Level Similarity and Access">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property ID</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Roles</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Owners</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Network Contacts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map(property => (
                    <tr key={property.id}>
                      <td className="py-4 text-xs font-semibold text-gray-900">{property.propertyId}</td>
                      <td className="py-4 text-xs font-bold text-gray-900">{property.name}</td>
                      <td className="py-4 text-xs text-gray-700">{property.zoneName}</td>
                      <td className="py-4 text-xs text-gray-700">{property.communityName}</td>
                      <td className="py-4 text-xs text-gray-700">{property.projectName}</td>
                      <td className="py-4 text-xs text-gray-700">{property.activeRoles.join(', ') || '—'}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(property.owners)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(property.transactions)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(property.contacts)}</td>
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
