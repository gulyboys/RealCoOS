import dotenv from 'dotenv';
import { verifyDatabricksConnectivity } from '../src/lib/databricks/connectivity';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  console.log('--- Verifying Databricks Connectivity (DLD + Monday + Owners) ---');
  const report = await verifyDatabricksConnectivity();
  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown verification failure.';
  console.error(message);
  process.exit(1);
});
