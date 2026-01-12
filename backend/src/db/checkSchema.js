/**
 * Check if database schema exists
 * Run: node src/db/checkSchema.js
 */

import { supabaseAdmin } from './supabase.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

async function checkSchema() {
    console.log('🔍 Checking database schema...\n');

    const requiredTables = [
        'users',
        'delegates',
        'members',
        'vouchers',
        'voucher_claims',
        'attendance_records',
        'food_history',
        'activity_timeline',
        'reward_activations'
    ];

    const results = [];

    for (const table of requiredTables) {
        try {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                if (error.message.includes('does not exist') || 
                    error.message.includes("Could not find the table")) {
                    results.push({ table, status: '❌ Missing', error: error.message });
                } else {
                    results.push({ table, status: '⚠️  Error', error: error.message });
                }
            } else {
                results.push({ table, status: '✅ Exists', error: null });
            }
        } catch (error) {
            results.push({ table, status: '❌ Error', error: error.message });
        }
    }

    console.log('Schema Check Results:\n');
    results.forEach(result => {
        console.log(`${result.status} ${result.table}`);
        if (result.error && result.status.includes('❌')) {
            console.log(`   ${result.error}`);
        }
    });

    const missingTables = results.filter(r => r.status.includes('❌ Missing'));
    const hasErrors = results.some(r => r.status.includes('❌'));

    console.log('');

    if (missingTables.length > 0) {
        console.log('❌ Schema is incomplete!\n');
        console.log('📋 To fix this:\n');
        console.log('   1. Go to Supabase Dashboard → SQL Editor');
        console.log('   2. Open: backend/src/db/schema.sql');
        console.log('   3. Copy the ENTIRE file content');
        console.log('   4. Paste in SQL Editor');
        console.log('   5. Click "Run" button');
        console.log('   6. Wait for "Success" message\n');
        console.log(`   Missing tables: ${missingTables.map(t => t.table).join(', ')}\n`);
        process.exit(1);
    } else if (hasErrors) {
        console.log('⚠️  Some tables have errors. Check the messages above.\n');
        process.exit(1);
    } else {
        console.log('✅ All required tables exist!\n');
        console.log('💡 Next step: Run seed.sql to populate test data\n');
        process.exit(0);
    }
}

checkSchema().catch(error => {
    console.error('❌ Error checking schema:', error.message);
    process.exit(1);
});

