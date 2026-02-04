import 'dotenv/config';
import { executeReadOnly } from '../src/lib/databricks/client';
import { describeTable } from '../src/lib/databricks/discovery';
import * as fs from 'fs';
import * as path from 'path';

async function scoreCandidate(table: string) {
    console.log(`Scoring candidate: ${table}`);
    try {
        const columns = await describeTable(table);
        const countRes = await executeReadOnly(`SELECT COUNT(*) AS n FROM ${table}`);
        const rows = await executeReadOnly(`SELECT * FROM ${table} LIMIT 5`);

        const colNames = columns.map(c => c.name.toLowerCase());

        // Heuristics for "concepts"
        const has_date = colNames.some(n => n.includes('date') || n.includes('time') || n.includes('timestamp'));
        const has_price = colNames.some(n => n.includes('price') || n.includes('value') || n.includes('worth') || n.includes('amount'));
        const has_unit_or_property_id = colNames.some(n => n.includes('unit') || n.includes('property_id') || n.includes('property_number'));
        const has_area_or_project = colNames.some(n => n.includes('area') || n.includes('project') || n.includes('community'));

        return {
            table,
            row_count: countRes[0].n,
            columns: columns,
            signals: {
                has_date,
                has_price,
                has_unit_or_property_id,
                has_area_or_project
            },
            notes: []
        };
    } catch (e: any) {
        console.error(`Error scoring ${table}: ${e.message}`);
        return null;
    }
}

async function main() {
    const schemaMapPath = path.join(process.cwd(), '../docs/schema_map.json');
    if (!fs.existsSync(schemaMapPath)) {
        console.error('schema_map.json not found. Run npm run schema:map first.');
        process.exit(1);
    }

    const schemaMap = JSON.parse(fs.readFileSync(schemaMapPath, 'utf8'));

    // Extract candidates from discovery_notes
    const txCandidates = schemaMap.discovery_notes
        .filter((n: string) => n.includes('Candidate for transactions'))
        .map((n: string) => `workspace.${n.split(': ')[1]}`);

    const bldCandidates = schemaMap.discovery_notes
        .filter((n: string) => n.includes('Candidate for buildings'))
        .map((n: string) => `workspace.${n.split(': ')[1]}`);

    // Also check if any were found in DLD directly (unlikely based on Phase 3.1 output but good for robustness)
    if (schemaMap.dld.transactions_export?.table) txCandidates.push(schemaMap.dld.transactions_export.table);
    if (schemaMap.dld.buildings_freehold?.table) bldCandidates.push(schemaMap.dld.buildings_freehold.table);

    const scorecard: any = {
        transactions: [],
        buildings: [],
        recommendation: {
            transactions_source: null,
            buildings_source: null,
            reasoning: []
        }
    };

    console.log('--- Scoring Transaction Candidates ---');
    for (const t of [...new Set(txCandidates)] as string[]) {
        const score = await scoreCandidate(t);
        if (score) scorecard.transactions.push(score);
    }

    console.log('--- Scoring Building Candidates ---');
    for (const b of [...new Set(bldCandidates)] as string[]) {
        const score = await scoreCandidate(b);
        if (score) scorecard.buildings.push(score);
    }

    // Recommendation Logic
    const bestTx = scorecard.transactions.find((s: any) => s.signals.has_unit_or_property_id && s.signals.has_date && s.signals.has_price);
    if (bestTx) {
        scorecard.recommendation.transactions_source = bestTx.table;
        scorecard.recommendation.reasoning.push(`Chosen ${bestTx.table} because it has date, price, and unit identifiers.`);
    } else if (scorecard.transactions.length > 0) {
        scorecard.recommendation.reasoning.push("BLOCKER: no transaction candidate has a usable unit/property identifier.");
    }

    const bestBld = scorecard.buildings.find((s: any) => s.signals.has_unit_or_property_id);
    if (bestBld) {
        scorecard.recommendation.buildings_source = bestBld.table;
        scorecard.recommendation.reasoning.push(`Chosen ${bestBld.table} because it has unit identifiers.`);
    }

    fs.writeFileSync(path.join(process.cwd(), '../docs/source_scorecard.json'), JSON.stringify(scorecard, null, 2));
    console.log('Scorecard written to docs/source_scorecard.json');

    if (scorecard.recommendation.transactions_source === null && scorecard.transactions.length > 0) {
        console.error("BLOCKER: no unit join key found in transaction candidates.");
    }
}

main();
