import fs from 'fs';
import path from 'path';
import { getDatabricksConfig } from './config';

type ActiveSourcesDoc = {
  transactions_source?: unknown;
  buildings_source?: unknown;
  monday_sources?: unknown;
  owners_source?: unknown;
};

export type UnifiedSourceConfig = {
  dldTransactionsTable: string;
  dldBuildingsTable: string;
  mondayContactsTable: string;
  ownersTable: string;
  warnings: string[];
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readActiveSourcesFile(): ActiveSourcesDoc | null {
  const filePath = path.join(process.cwd(), 'docs', 'active_sources.json');
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as ActiveSourcesDoc;
    return parsed;
  } catch {
    return null;
  }
}

function firstMondaySource(doc: ActiveSourcesDoc | null): string | undefined {
  if (!doc || !Array.isArray(doc.monday_sources)) return undefined;
  for (const candidate of doc.monday_sources) {
    const table = asNonEmptyString(candidate);
    if (table) return table;
  }
  return undefined;
}

export function getUnifiedSourceConfig(): UnifiedSourceConfig {
  const config = getDatabricksConfig();
  const active = readActiveSourcesFile();
  const warnings: string[] = [];

  const dldTransactionsTable =
    asNonEmptyString(config.transactionsTable) ??
    asNonEmptyString(active?.transactions_source) ??
    '';
  const dldBuildingsTable =
    asNonEmptyString(config.buildingsTable) ??
    asNonEmptyString(active?.buildings_source) ??
    '';
  const mondayContactsTable =
    asNonEmptyString(config.mondayTable) ??
    firstMondaySource(active) ??
    '';
  const ownersTable =
    asNonEmptyString(config.ownersTable) ??
    asNonEmptyString(active?.owners_source) ??
    mondayContactsTable;

  if (!asNonEmptyString(config.ownersTable) && !asNonEmptyString(active?.owners_source)) {
    warnings.push('Owners source not explicitly configured; using Monday contacts source as fallback.');
  }

  return {
    dldTransactionsTable,
    dldBuildingsTable,
    mondayContactsTable,
    ownersTable,
    warnings,
  };
}

export function getMissingUnifiedSources(
  sources: UnifiedSourceConfig = getUnifiedSourceConfig()
): Array<keyof Omit<UnifiedSourceConfig, 'warnings'>> {
  const missing: Array<keyof Omit<UnifiedSourceConfig, 'warnings'>> = [];
  if (!sources.dldTransactionsTable) missing.push('dldTransactionsTable');
  if (!sources.dldBuildingsTable) missing.push('dldBuildingsTable');
  if (!sources.mondayContactsTable) missing.push('mondayContactsTable');
  if (!sources.ownersTable) missing.push('ownersTable');
  return missing;
}
