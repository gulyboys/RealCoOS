import { executeReadOnly } from '../client';
import { getDatabricksConfig, isLiveDatabricks } from '../config';
import { getUnifiedSourceConfig } from '../sources';
import { adaptOwnerRow, OwnerRow } from './adapters/ownersAdapter';

export async function getOwners(limit = 100): Promise<OwnerRow[]> {
  const config = getDatabricksConfig();
  const sources = getUnifiedSourceConfig();

  if (!isLiveDatabricks(config)) {
    console.warn('Mock mode not implemented for owners yet.');
    return [];
  }

  if (!sources.ownersTable) {
    throw new Error('Missing DATABRICKS_TABLE_OWNERS for live Databricks queries.');
  }

  const sql = `SELECT * FROM ${sources.ownersTable}
    LIMIT ${Number(limit) || 100}`;

  const rows = await executeReadOnly(sql);
  return rows
    .map(adaptOwnerRow)
    .filter(row => Boolean(row.owner_id || row.owner_name));
}
