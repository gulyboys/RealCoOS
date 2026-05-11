import Link from 'next/link';
import { Topbar } from '@/components/ui/Topbar';
import { Card } from '@/components/ui/Card';

const links = [
  { href: '/hierarchy/zones', label: 'Zones', description: 'Zone level dashboard and metrics.' },
  { href: '/hierarchy/communities', label: 'Communities', description: 'DLD area alias mapping to community nodes.' },
  { href: '/hierarchy/projects', label: 'Projects', description: 'Master project and project-level rollups.' },
  { href: '/hierarchy/properties', label: 'Properties', description: 'Property-level owners, contacts, and transactions.' }
];

export default function HierarchyIndexPage() {
  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <div className="flex-1 flex flex-col">
        <Topbar title="Hierarchy" />

        <div className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full">
          <Card title="Hierarchy Sections">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-bold text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
