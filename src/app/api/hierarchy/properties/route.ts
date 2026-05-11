import { NextRequest, NextResponse } from 'next/server';
import { getPropertySummaries } from '@/lib/hierarchy/service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const rows = getPropertySummaries().filter(property => (projectId ? property.projectId === projectId : true));
  return NextResponse.json(rows);
}
