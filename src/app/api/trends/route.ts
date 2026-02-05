import { NextRequest, NextResponse } from 'next/server';
import { getAreaTrends } from '@/lib/databricks/queries/registry';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area');

    if (!area) {
        return NextResponse.json([]);
    }

    try {
        // For V1, we just fetch a year range
        const results = await getAreaTrends(area, '2023-01-01', '2025-12-31');
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
