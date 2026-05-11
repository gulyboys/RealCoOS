import fs from 'fs';
import os from 'os';
import path from 'path';

export type DatabricksMode = 'live' | 'mock';

export type DatabricksConfig = {
  host: string;
  httpPath: string;
  token: string;
  catalog: string;
  preferredSchema?: string;
  buildingsTable?: string;
  transactionsTable?: string;
  mondayTable?: string;
  ownersTable?: string;
  mode: DatabricksMode;
};

type ProfileConfig = Partial<Pick<DatabricksConfig, 'host' | 'httpPath' | 'token' | 'catalog' | 'preferredSchema'>>;

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function normalizeHost(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function normalizeHttpPath(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function loadDatabricksProfile(): ProfileConfig | null {
  const profileName = process.env.DATABRICKS_CONFIG_PROFILE || 'DEFAULT';
  const cfgPath = process.env.DATABRICKS_CONFIG_FILE || path.join(os.homedir(), '.databrickscfg');

  if (!fs.existsSync(cfgPath)) return null;

  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    let current: string | null = null;
    const profile: Record<string, string> = {};

    raw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        current = trimmed.slice(1, -1);
        return;
      }
      if (current !== profileName) return;
      const [key, ...rest] = trimmed.split('=');
      if (!key || rest.length === 0) return;
      profile[key.trim().toLowerCase()] = rest.join('=').trim();
    });

    if (Object.keys(profile).length === 0) return null;

    return {
      host: normalizeHost(profile.host),
      httpPath: normalizeHttpPath(profile.http_path || profile['http-path'] || profile.path),
      token: profile.token,
      catalog: profile.catalog,
      preferredSchema: profile.schema || profile.database,
    };
  } catch {
    return null;
  }
}

export function getDatabricksConfig(): DatabricksConfig {
  const profile = loadDatabricksProfile();

  const host = normalizeHost(readEnv('DATABRICKS_HOST', 'DATABRICKS_SERVER_HOSTNAME') || profile?.host);
  const httpPath = normalizeHttpPath(
    readEnv('DATABRICKS_HTTP_PATH', 'DATABRICKS_WAREHOUSE_HTTP_PATH') || profile?.httpPath
  );
  const token = readEnv('DATABRICKS_TOKEN', 'DATABRICKS_PAT') || profile?.token;
  const catalog = readEnv('DATABRICKS_CATALOG') ?? profile?.catalog ?? 'workspace';
  const preferredSchema = readEnv('DATABRICKS_SCHEMA', 'DATABRICKS_PREFERRED_SCHEMA') ?? profile?.preferredSchema;
  const buildingsTable = readEnv('DATABRICKS_TABLE_BUILDINGS');
  const transactionsTable = readEnv('DATABRICKS_TABLE_TRANSACTIONS');
  const ownersTable = readEnv('DATABRICKS_TABLE_OWNERS', 'DATABRICKS_OWNERS_TABLE');

  const mode: DatabricksMode =
    readEnv('DATABRICKS_MODE') === 'live'
      ? 'live'
      : host && httpPath && token
        ? 'live'
        : 'mock';

  return {
    host: host ?? '',
    httpPath: httpPath ?? '',
    token: token ?? '',
    catalog,
    preferredSchema,
    buildingsTable,
    transactionsTable,
    mondayTable: readEnv('DATABRICKS_TABLE_MONDAY') ?? 'workspace.default.v_monday_crm_contact_profile',
    ownersTable,
    mode
  };
}

export function isLiveDatabricks(config: DatabricksConfig = getDatabricksConfig()): boolean {
  return config.mode === 'live';
}

export function assertLiveDatabricks(config: DatabricksConfig = getDatabricksConfig()): DatabricksConfig {
  if (!isLiveDatabricks(config)) {
    throw new Error(
      'Databricks is not configured. Set DATABRICKS_HOST, DATABRICKS_HTTP_PATH, and DATABRICKS_TOKEN (or DATABRICKS_MODE=live).'
    );
  }
  return config;
}
