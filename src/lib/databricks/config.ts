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

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

export function getDatabricksConfig(): DatabricksConfig {
  const host = readEnv('DATABRICKS_HOST', 'DATABRICKS_SERVER_HOSTNAME');
  const httpPath = readEnv('DATABRICKS_HTTP_PATH', 'DATABRICKS_WAREHOUSE_HTTP_PATH');
  const token = readEnv('DATABRICKS_TOKEN');
  const catalog = readEnv('DATABRICKS_CATALOG') ?? 'workspace';
  const preferredSchema = readEnv('DATABRICKS_SCHEMA', 'DATABRICKS_PREFERRED_SCHEMA');
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
