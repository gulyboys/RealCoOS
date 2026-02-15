import { NextResponse } from 'next/server';
import { verifyDatabricksConnectivity } from '@/lib/databricks/connectivity';

export async function GET() {
  const report = await verifyDatabricksConnectivity();
  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
