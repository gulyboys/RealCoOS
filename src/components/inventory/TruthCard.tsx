import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BuildingRow } from '@/lib/databricks/queries/adapters/buildingsAdapter';

interface TruthCardProps {
    unit: BuildingRow | null;
}

export function TruthCard({ unit }: TruthCardProps) {
    if (!unit) return null;

    const dataFields = [
        { label: 'Property ID', value: unit.property_id },
        { label: 'Area', value: unit.area_name_en },
        { label: 'Project', value: unit.project_name_en },
        { label: 'Building No', value: unit.building_number },
        { label: 'Floors', value: unit.floors },
        { label: 'Rooms', value: unit.rooms_en },
        { label: 'Reg Status', value: unit.is_registered },
        { label: 'Land Type', value: unit.land_type_en },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identity Card */}
                <Card title="Physical Identity">
                    <div className="grid grid-cols-2 gap-y-6">
                        {dataFields.map((field) => (
                            <div key={field.label}>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-gray-900">{field.value || '—'}</span>
                                    {!field.value && <Badge variant="unknown">Unknown</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Status Card */}
                <Card title="Operational Status">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Canonical Resolution</p>
                            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                <span className="text-xs font-bold text-gray-900 tracking-tight">Resolved to Ground Truth</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Governance Tags</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="success">Read Only</Badge>
                                <Badge>Append Only Memory</Badge>
                                <Badge variant="unknown">No Manual Overrides</Badge>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Metrics Row (Placeholder for V1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Value</p>
                    <span className="text-lg font-bold text-gray-900">—</span>
                    <Badge variant="unknown" className="ml-2">Inferred (Disabled)</Badge>
                </Card>
                <Card>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Market Velocity</p>
                    <span className="text-lg font-bold text-gray-900">Unknown</span>
                </Card>
                <Card>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Identity Reliability</p>
                    <span className="text-lg font-bold text-gray-900 text-green-600">99.2%</span>
                </Card>
            </div>
        </div>
    );
}
