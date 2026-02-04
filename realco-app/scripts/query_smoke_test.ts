import 'dotenv/config';
import {
    getUnitCandidates,
    getTransactionsForUnit,
    getAreaTrends
} from '../src/lib/databricks/queries/registry';

async function runSmokeTests() {
    console.log('--- Query Registry Smoke Test ---');

    const testCases = [
        {
            name: 'getUnitCandidates',
            fn: () => getUnitCandidates('Palm Jumeirah', 5)
        },
        {
            name: 'getAreaTrends',
            fn: () => getAreaTrends('Palm Jumeirah', '2023-01-01', '2023-12-31', 5)
        }
    ];

    for (const { name, fn } of testCases) {
        process.stdout.write(`Testing ${name}... `);
        try {
            const result = await fn();
            console.log(`✅ SQL compiled + executed (${result.length} rows)`);
        } catch (error: any) {
            console.log(`❌ FAILED: ${error.message}`);
            // If it's a known mapping error, we want to see it
            if (error.message.includes('MISSING_REQUIRED_COLUMN_MAP')) {
                console.error(`Mapping Error: ${error.message}`);
            }
        }
    }

    // Special case for transactions (needs a property_id)
    process.stdout.write('Testing getTransactionsForUnit... ');
    try {
        // First get a candidate property_id
        const candidates = await getUnitCandidates('Palm Jumeirah', 1);
        if (candidates.length > 0) {
            const unitKey = candidates[0].property_id;
            const txs = await getTransactionsForUnit(unitKey, 5);
            console.log(`✅ SQL compiled + executed (${txs.length} rows for ${unitKey})`);
        } else {
            console.log('⚠️ Skipped (no candidate buildings found to test with)');
        }
    } catch (error: any) {
        console.log(`❌ FAILED: ${error.message}`);
    }

    console.log('--- Smoke Test Complete ---');
}

runSmokeTests().catch(err => {
    console.error('Fatal Smoke Test Error:', err);
    process.exit(1);
});
