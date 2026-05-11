import { NextResponse } from 'next/server';
import { getZoneSummaries } from '@/lib/hierarchy/service';

export async function GET() {
  return NextResponse.json(getZoneSummaries());
}
