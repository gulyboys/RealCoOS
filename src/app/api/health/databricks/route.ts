import { NextResponse } from 'next/server';
import { executeReadOnly } from '@/lib/databricks/client';

export async function GET() {
    try {
        await executeReadOnly('SELECT 1');
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}
