import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { getProjectSummaries } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function ProjectsPage() {
  const projects = getProjectSummaries();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Projects" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <Card title="Project Level Access and Metrics">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Properties</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Owners</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Network Contacts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map(project => (
                    <tr key={project.id}>
                      <td className="py-4 text-xs font-semibold text-gray-900">{project.zoneName}</td>
                      <td className="py-4 text-xs text-gray-700">{project.communityName}</td>
                      <td className="py-4 text-xs text-gray-700">{project.masterProject}</td>
                      <td className="py-4 text-xs font-bold text-gray-900">{project.name}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(project.properties)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(project.owners)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(project.transactions)}</td>
                      <td className="py-4 text-xs text-right text-gray-700">{formatNumber(project.contacts)}</td>
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
