import Link from 'next/link';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { getHierarchyTotals } from '@/lib/hierarchy/service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

const quickLinks = [
  {
    href: '/dashboard',
    title: 'Hierarchy Dashboard',
    subtitle: 'Zone to property rollups with owners, transactions, and contacts.'
  },
  {
    href: '/hierarchy/zones',
    title: 'Zones',
    subtitle: 'Zone-level health and capacity view.'
  },
  {
    href: '/hierarchy/communities',
    title: 'Communities',
    subtitle: 'DLD area alias mapping to community hierarchy.'
  },
  {
    href: '/hierarchy/projects',
    title: 'Projects',
    subtitle: 'Master project and project-level coverage.'
  },
  {
    href: '/hierarchy/properties',
    title: 'Properties',
    subtitle: 'Property-level similarity and contact access.'
  },
  {
    href: '/market',
    title: 'Market Intelligence',
    subtitle: 'Area trend lookup from DLD transaction view.'
  }
];

export default function Home() {
  const totals = getHierarchyTotals();

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Overview" />

        <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard label="Zones" value={formatNumber(totals.zones)} color="purple" />
            <StatCard label="Communities" value={formatNumber(totals.communities)} color="blue" />
            <StatCard label="Projects" value={formatNumber(totals.projects)} color="yellow" />
            <StatCard label="Properties" value={formatNumber(totals.properties)} />
            <StatCard label="Transactions" value={formatNumber(totals.transactions)} color="blue" />
            <StatCard label="Network Contacts" value={formatNumber(totals.contacts)} color="purple" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Hierarchy Doctrine">
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Main order in every section: <span className="font-semibold text-gray-900">Zone &gt; Community &gt; Project &gt; Property</span>.
                </p>
                <p>
                  Contacts in network and CRM can be scoped at community, project, or property level and can hold multiple roles
                  such as seller and buyer at the same time.
                </p>
                <p>
                  DLD area names are normalized into your hierarchy through alias mapping, so market transactions align with the same structure.
                </p>
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="grid grid-cols-1 gap-3">
                {quickLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <p className="text-sm font-bold text-gray-900">{link.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{link.subtitle}</p>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
