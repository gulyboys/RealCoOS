import { getDatabricksConfig, isLiveDatabricks } from './config';

export type SqlRow = Record<string, any>;
type DatabricksClientType = {
  getConfig: () => {
    socketTimeout: number;
    retryMaxAttempts: number;
    retriesTimeout: number;
  };
  connect: (options: {
    host: string;
    path: string;
    token: string;
    socketTimeout?: number;
  }) => Promise<unknown>;
  openSession: () => Promise<{
    executeStatement: (
      sql: string,
      options: { runAsync: boolean; maxRows: number }
    ) => Promise<{
      fetchAll: () => Promise<SqlRow[]>;
      close: () => Promise<void>;
    }>;
    close: () => Promise<void>;
  }>;
};

let sharedClientPromise: Promise<DatabricksClientType> | null = null;
const MAX_EXECUTION_ATTEMPTS = 2;
const CONNECT_TIMEOUT_MS = Number(process.env.DATABRICKS_CONNECT_TIMEOUT_MS ?? 12000);
const QUERY_TIMEOUT_MS = Number(process.env.DATABRICKS_QUERY_TIMEOUT_MS ?? 15000);

function resetClient() {
  sharedClientPromise = null;
}

function isRetryableDatabricksError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'string'
      ? error.toLowerCase()
      : '';

  return (
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('network') ||
    message.includes('temporarily unavailable') ||
    message.includes('invalid session') ||
    message.includes('session has been closed')
  );
}

async function wait(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function createDatabricksClient(): Promise<DatabricksClientType> {
  const dynamicImport = new Function(
    'moduleName',
    'return import(moduleName);'
  ) as (moduleName: string) => Promise<{ DBSQLClient: new () => DatabricksClientType }>;

  const { DBSQLClient } = await dynamicImport('@databricks/sql');
  return new DBSQLClient();
}

async function getClient() {
  const config = getDatabricksConfig();
  if (!isLiveDatabricks(config)) {
    throw new Error('Databricks is not configured (running in mock mode).');
  }

  if (!sharedClientPromise) {
    const client = await createDatabricksClient();
    const runtimeConfig = client.getConfig();
    runtimeConfig.socketTimeout = QUERY_TIMEOUT_MS;
    runtimeConfig.retryMaxAttempts = 1;
    runtimeConfig.retriesTimeout = QUERY_TIMEOUT_MS;

    sharedClientPromise = withTimeout(
      client.connect({
        host: config.host,
        path: config.httpPath,
        token: config.token,
        socketTimeout: QUERY_TIMEOUT_MS,
      }),
      CONNECT_TIMEOUT_MS,
      'Databricks connect'
    )
      .then(() => client)
      .catch(error => {
        resetClient();
        throw error;
      });
  }

  return sharedClientPromise;
}

function mockExecute(sql: string): SqlRow[] {
  const normalized = sql.trim().toLowerCase();
  if (normalized.startsWith('select 1')) {
    return [{ '1': 1 }];
  }
  if (normalized.startsWith('show ') || normalized.startsWith('describe ')) {
    return [];
  }
  throw new Error('Databricks is not configured (running in mock mode).');
}

export async function executeReadOnly(sql: string): Promise<SqlRow[]> {
  const config = getDatabricksConfig();
  if (!isLiveDatabricks(config)) {
    return mockExecute(sql);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_EXECUTION_ATTEMPTS; attempt += 1) {
    const client = await getClient();
    const session = await client.openSession();
    let statement: any;

    try {
      statement = await withTimeout(
        session.executeStatement(sql, {
          runAsync: true,
          maxRows: 10000
        }),
        QUERY_TIMEOUT_MS,
        'Databricks execute'
      );
      const rows = await withTimeout(statement.fetchAll(), QUERY_TIMEOUT_MS, 'Databricks fetch');
      return rows as SqlRow[];
    } catch (error) {
      lastError = error;

      if (attempt >= MAX_EXECUTION_ATTEMPTS || !isRetryableDatabricksError(error)) {
        throw error;
      }

      resetClient();
      await wait(250);
    } finally {
      if (statement) {
        await statement.close().catch(() => undefined);
      }
      await session.close().catch(() => undefined);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Databricks query failed.');
}
