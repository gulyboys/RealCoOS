import { NextRequest, NextResponse } from 'next/server';
import { getProjectSummaries } from '@/lib/hierarchy/service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zoneId = searchParams.get('zoneId');

  const rows = getProjectSummaries().filter(project => (zoneId ? project.zoneId === zoneId : true));
  return NextResponse.json(rows);
}
