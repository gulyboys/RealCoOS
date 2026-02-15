import { executeReadOnly } from './client';
import { getDatabricksConfig, isLiveDatabricks } from './config';
import { describeTable } from './discovery';
import { getMissingUnifiedSources, getUnifiedSourceConfig } from './sources';

type SourceCheckKey = 'dld_transactions' | 'dld_buildings' | 'monday_contacts' | 'owners';

export type SourceCheckResult = {
  key: SourceCheckKey;
  table: string;
  ok: boolean;
  latency_ms: number;
  sample_rows: number;
  missing_columns: string[];
  error?: string;
};

export type DatabricksConnectivityReport = {
  ok: boolean;
  mode: 'live' | 'mock';
  checked_at: string;
  latency_ms: number;
  missing_config: string[];
  warnings: string[];
  sources: SourceCheckResult[];
  error?: string;
};

const REQUIRED_COLUMNS: Record<SourceCheckKey, string[]> = {
  dld_transactions: ['instance_date', 'actual_worth'],
  dld_buildings: ['property_id'],
  monday_contacts: ['master_contact_id'],
  owners: ['owner_name'],
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown Databricks connectivity error.';
}

function hasColumn(columns: Set<string>, expected: string): boolean {
  if (columns.has(expected.toLowerCase())) return true;
  return Array.from(columns).some(column => column.includes(expected.toLowerCase()));
}

async function checkSource(
  key: SourceCheckKey,
  table: string,
  requiredColumns: string[]
): Promise<SourceCheckResult> {
  const startedAt = Date.now();

  try {
    const [sampleRows, columns] = await Promise.all([
      executeReadOnly(`SELECT * FROM ${table} LIMIT 1`),
      describeTable(table),
    ]);
    const names = new Set(columns.map(column => column.name.toLowerCase()));
    const missingColumns = requiredColumns.filter(required => !hasColumn(names, required));

    return {
      key,
      table,
      ok: missingColumns.length === 0,
      latency_ms: Date.now() - startedAt,
      sample_rows: sampleRows.length,
      missing_columns: missingColumns,
    };
  } catch (error: unknown) {
    return {
      key,
      table,
      ok: false,
      latency_ms: Date.now() - startedAt,
      sample_rows: 0,
      missing_columns: requiredColumns,
      error: toErrorMessage(error),
    };
  }
}

export async function verifyDatabricksConnectivity(): Promise<DatabricksConnectivityReport> {
  const startedAt = Date.now();
  const config = getDatabricksConfig();
  const sources = getUnifiedSourceConfig();
  const missingConfig = getMissingUnifiedSources(sources);
  const warnings = [...sources.warnings];

  if (!isLiveDatabricks(config)) {
    return {
      ok: false,
      mode: config.mode,
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      missing_config: missingConfig,
      warnings,
      sources: [],
      error: 'Databricks is running in mock mode. Configure live credentials to verify connectivity.',
    };
  }

  if (missingConfig.length > 0) {
    return {
      ok: false,
      mode: config.mode,
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      missing_config: missingConfig,
      warnings,
      sources: [],
      error: 'One or more required Databricks source tables are missing from configuration.',
    };
  }

  try {
    await executeReadOnly('SELECT 1 AS ok');
  } catch (error: unknown) {
    return {
      ok: false,
      mode: config.mode,
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      missing_config: missingConfig,
      warnings,
      sources: [],
      error: toErrorMessage(error),
    };
  }

  const sourceChecks = await Promise.all([
    checkSource('dld_transactions', sources.dldTransactionsTable, REQUIRED_COLUMNS.dld_transactions),
    checkSource('dld_buildings', sources.dldBuildingsTable, REQUIRED_COLUMNS.dld_buildings),
    checkSource('monday_contacts', sources.mondayContactsTable, REQUIRED_COLUMNS.monday_contacts),
    checkSource('owners', sources.ownersTable, REQUIRED_COLUMNS.owners),
  ]);

  return {
    ok: sourceChecks.every(check => check.ok),
    mode: config.mode,
    checked_at: new Date().toISOString(),
    latency_ms: Date.now() - startedAt,
    missing_config: missingConfig,
    warnings,
    sources: sourceChecks,
  };
}
