import { executeReadOnly } from '../client';
import { getDatabricksConfig, isLiveDatabricks } from '../config';
import { adaptMondayContactRow, MondayContactRow } from './adapters/mondayAdapter';
import { getUnifiedSourceConfig } from '../sources';

function escapeSql(value: string): string {
    return value.replace(/'/g, "''");
}

export async function getMondayContacts(limit = 100): Promise<MondayContactRow[]> {
    const config = getDatabricksConfig();
    const sources = getUnifiedSourceConfig();

    if (!isLiveDatabricks(config)) {
        console.warn('Mock mode not implemented for Monday contacts yet.');
        return [];
    }

    if (!sources.mondayContactsTable) {
        throw new Error('Missing DATABRICKS_TABLE_MONDAY for live Databricks queries.');
    }

    // Basic query to fetch contacts, can be expanded with filters
    const sql = `SELECT * FROM ${sources.mondayContactsTable}
    ORDER BY first_seen_at DESC
    LIMIT ${Number(limit) || 100}`;

    const rows = await executeReadOnly(sql);
    return rows.map(adaptMondayContactRow);
}
