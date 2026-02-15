import { NextRequest, NextResponse } from 'next/server';
import { getOwners } from '@/lib/databricks/queries/owners';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 100;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 100;

  try {
    const results = await getOwners(limit);
    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch owners.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
