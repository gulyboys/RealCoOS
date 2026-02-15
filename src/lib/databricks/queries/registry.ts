import { executeReadOnly } from '../client';
import { isLiveDatabricks } from '../config';
import { getMockBuildings, getMockTransactions } from '../mock';
import { adaptBuildingRow, BuildingRow } from './adapters/buildingsAdapter';
import { adaptTransactionRow, TransactionRow } from './adapters/transactionsAdapter';
import { getUnifiedSourceConfig } from '../sources';

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function matchesText(value: string | null | undefined, query: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function getUnitCandidates(query: string, limit = 10): Promise<BuildingRow[]> {
  if (!query.trim()) return [];

  if (!isLiveDatabricks()) {
    const lower = query.toLowerCase();
    return getMockBuildings()
      .filter(row =>
        matchesText(row.property_id, lower) ||
        matchesText(row.area_name_en, lower) ||
        matchesText(row.project_name_en, lower)
      )
      .slice(0, limit);
  }

  const sources = getUnifiedSourceConfig();
  if (!sources.dldBuildingsTable) {
    throw new Error('Missing DATABRICKS_TABLE_BUILDINGS for live Databricks queries.');
  }

  const escaped = escapeSql(query);
  const sql = `SELECT * FROM ${sources.dldBuildingsTable}
    WHERE lower(area_name_en) LIKE lower('%${escaped}%')
       OR lower(project_name_en) LIKE lower('%${escaped}%')
       OR CAST(property_id AS STRING) LIKE '%${escaped}%'
    LIMIT ${Number(limit) || 10}`;

  const rows = await executeReadOnly(sql);
  return rows.map(adaptBuildingRow).filter(row => row.property_id);
}

export async function getTransactionsForUnit(propertyId: string, limit = 50): Promise<TransactionRow[]> {
  if (!propertyId.trim()) return [];

  if (!isLiveDatabricks()) {
    return getMockTransactions()
      .filter(row => row.property_id === propertyId)
      .slice(0, limit);
  }

  const sources = getUnifiedSourceConfig();
  if (!sources.dldTransactionsTable) {
    throw new Error('Missing DATABRICKS_TABLE_TRANSACTIONS for live Databricks queries.');
  }

  const escaped = escapeSql(propertyId);
  const sql = `SELECT * FROM ${sources.dldTransactionsTable}
    WHERE CAST(property_id AS STRING) = '${escaped}'
    ORDER BY instance_date DESC
    LIMIT ${Number(limit) || 50}`;

  const rows = await executeReadOnly(sql);
  return rows.map(adaptTransactionRow);
}

export async function getAreaTrends(
  area: string,
  startDate?: string,
  endDate?: string,
  limit = 200
): Promise<TransactionRow[]> {
  if (!area.trim()) return [];

  if (!isLiveDatabricks()) {
    const lower = area.toLowerCase();
    return getMockTransactions()
      .filter(row => matchesText(row.area_name_en, lower))
      .slice(0, limit);
  }

  const sources = getUnifiedSourceConfig();
  if (!sources.dldTransactionsTable) {
    throw new Error('Missing DATABRICKS_TABLE_TRANSACTIONS for live Databricks queries.');
  }

  const escaped = escapeSql(area);
  const dateFilters: string[] = [];
  if (startDate) dateFilters.push(`instance_date >= DATE('${escapeSql(startDate)}')`);
  if (endDate) dateFilters.push(`instance_date <= DATE('${escapeSql(endDate)}')`);

  const sql = `SELECT * FROM ${sources.dldTransactionsTable}
    WHERE lower(area_name_en) LIKE lower('%${escaped}%')
      ${dateFilters.length ? `AND ${dateFilters.join(' AND ')}` : ''}
    ORDER BY instance_date DESC
    LIMIT ${Number(limit) || 200}`;

  const rows = await executeReadOnly(sql);
  return rows.map(adaptTransactionRow);
}
