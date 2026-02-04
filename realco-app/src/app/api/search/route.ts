import { NextRequest, NextResponse } from 'next/server';
import { getUnitCandidates } from '@/lib/databricks/queries/registry';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const results = await getUnitCandidates(query);
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
