import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsForUnit } from '@/lib/databricks/queries/registry';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json([]);
    }

    try {
        const results = await getTransactionsForUnit(id);
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
