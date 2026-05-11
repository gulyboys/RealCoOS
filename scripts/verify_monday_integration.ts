import 'dotenv/config';
import { getMondayContacts } from '../src/lib/databricks/queries/monday';

async function main() {
    console.log('--- Verifying Monday.com Integration ---');

    try {
        console.log('Fetching contacts from Monday.com table via Databricks...');
        const contacts = await getMondayContacts(5);

        console.log(`Successfully fetched ${contacts.length} contacts.`);

        if (contacts.length > 0) {
            console.log('First contact sample:');
            console.log(JSON.stringify(contacts[0], null, 2));
        } else {
            console.warn('No contacts found. Check if the table is empty or criteria are too strict.');
        }

    } catch (error: any) {
        console.error('Verification Failed!');
        console.error(error);
        process.exit(1);
    }
}

main();
