import { NextRequest, NextResponse } from 'next/server';
import { getMondayContacts } from '@/lib/databricks/queries/monday';
import { getNetworkContacts } from '@/lib/hierarchy/service';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limitParams = searchParams.get('limit');
    const source = searchParams.get('source');
    // Default limit to 100 if not specified
    const limit = limitParams ? parseInt(limitParams, 10) : 100;

    try {
        if (source === 'hierarchy' || source === null) {
            return NextResponse.json(getNetworkContacts(limit));
        }
        const results = await getMondayContacts(limit);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error fetching Monday contacts:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
