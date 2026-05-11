import { NextRequest, NextResponse } from 'next/server';
import { getDashboardProjectRows, getHierarchyTotals, getZoneSummaries } from '@/lib/hierarchy/service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zoneId = searchParams.get('zoneId') ?? undefined;

  return NextResponse.json({
    totals: getHierarchyTotals(),
    zones: getZoneSummaries(),
    projects: getDashboardProjectRows(zoneId)
  });
}
