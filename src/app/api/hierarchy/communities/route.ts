import { NextResponse } from 'next/server';
import { getCommunitySummaries } from '@/lib/hierarchy/service';

export async function GET() {
  return NextResponse.json(getCommunitySummaries());
}
