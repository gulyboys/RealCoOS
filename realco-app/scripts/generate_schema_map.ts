import 'dotenv/config';
import { getDatabricksConfig } from '../src/lib/databricks/config';
import { executeReadOnly } from '../src/lib/databricks/client';
import {
    listSchemas,
    listTables,
    describeTable,
    findCandidateSchemas,
    findDldGoldViews
} from '../src/lib/databricks/discovery';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log('--- RealCo OS Schema Discovery ---');

    try {
        const config = getDatabricksConfig();
        console.log(`Target Catalog: ${config.catalog}`);

        // 1. Connectivity Check
        console.log('Running connectivity check...');
        await executeReadOnly('SELECT 1');
        console.log('Connected: YES');

        const registry: any = {
            generated_at: new Date().toISOString(),
            catalog: config.catalog,
            dld: {
                transactions_export: null,
                buildings_freehold: null
            },
            monday: [],
            discovery_notes: []
        };

        // 2. Discover Schemas
        console.log('Discovering candidate schemas...');
        const candidates = await findCandidateSchemas(config.catalog, config.preferredSchema);
        console.log(`Candidate schemas found: ${candidates.join(', ')}`);

        // 3. Search for DLD Gold Views and Monday Tables
        console.log('Searching for tables in candidate schemas...');
        for (const schema of candidates) {
            console.log(`Checking schema: ${schema}`);
            try {
                const tables = await listTables(config.catalog, schema);
                console.log(`Tables in ${schema}: ${tables.join(', ')}`);

                // Check for DLD targets in this schema
                if (tables.includes('transactions_export') && !registry.dld.transactions_export) {
                    const fullName = `${config.catalog}.${schema}.transactions_export`;
                    registry.dld.transactions_export = { table: fullName, columns: await describeTable(fullName), notes: [] };
                } else if (tables.some(t => t.toLowerCase().includes('transaction')) && !registry.dld.transactions_export) {
                    const match = tables.find(t => t.toLowerCase().includes('transaction'))!;
                    registry.discovery_notes.push(`Candidate for transactions found: ${schema}.${match}`);
                }

                if (tables.includes('buildings_freehold') && !registry.dld.buildings_freehold) {
                    const fullName = `${config.catalog}.${schema}.buildings_freehold`;
                    registry.dld.buildings_freehold = { table: fullName, columns: await describeTable(fullName), notes: [] };
                } else if (tables.some(t => t.toLowerCase().includes('building')) && !registry.dld.buildings_freehold) {
                    const match = tables.find(t => t.toLowerCase().includes('building'))!;
                    registry.discovery_notes.push(`Candidate for buildings found: ${schema}.${match}`);
                }

                // Check for Monday tables
                const mondayInSchema = tables.filter(t => t.toLowerCase().includes('monday'));
                for (const t of mondayInSchema) {
                    const fullName = `${config.catalog}.${schema}.${t}`;
                    console.log(`Adding Monday table: ${fullName}`);
                    registry.monday.push({
                        table: fullName,
                        columns: await describeTable(fullName)
                    });
                }
            } catch (e: any) {
                console.warn(`Could not list tables in ${schema}: ${e.message}`);
            }
        }

        if (!registry.dld.transactions_export || !registry.dld.buildings_freehold) {
            registry.discovery_notes.push('One or more DLD gold views missing in preferred schema.');
        }

        if (registry.monday.length === 0) {
            registry.discovery_notes.push('No Monday-related tables found in candidate schemas.');
        }

        // 5. Write artifacts
        const docsDir = path.join(process.cwd(), '../docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(docsDir, 'schema_map.json'),
            JSON.stringify(registry, null, 2)
        );

        console.log('--- Discovery Complete ---');
        console.log(`DLD Tables: ${registry.dld.transactions_export ? 'OK' : 'MISSING'}`);
        console.log(`Monday Tables: ${registry.monday.length}`);
        console.log(`Output: /docs/schema_map.json`);

    } catch (error: any) {
        console.error('Discovery Failed!');
        console.error(error.message);
        process.exit(1);
    }
}

main();
