/**
 * Test Supabase connection and verify hostname
 * Run: node src/utils/testSupabaseConnection.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

async function testConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        console.error('❌ SUPABASE_URL not set in .env file');
        process.exit(1);
    }

    console.log(`📋 Configuration:`);
    console.log(`   SUPABASE_URL: ${supabaseUrl}\n`);

    // Extract hostname from URL
    let hostname;
    try {
        const url = new URL(supabaseUrl);
        hostname = url.hostname;
        console.log(`🌐 Extracted hostname: ${hostname}\n`);
    } catch (error) {
        console.error('❌ Invalid SUPABASE_URL format:', supabaseUrl);
        console.error('   Should be: https://xxxxx.supabase.co\n');
        process.exit(1);
    }

    // Test DNS resolution
    console.log('🔍 Testing DNS resolution...');
    try {
        const addresses = await resolve4(hostname);
        console.log(`✅ DNS resolution successful!`);
        console.log(`   IP addresses: ${addresses.join(', ')}\n`);
    } catch (error) {
        console.error(`❌ DNS resolution failed!`);
        console.error(`   Error: ${error.message}\n`);
        console.error('💡 Possible causes:');
        console.error('   1. Supabase project is paused');
        console.error('   2. Incorrect project URL');
        console.error('   3. Network connectivity issues');
        console.error('   4. Project reference ID is wrong\n');
        console.error('📖 How to fix:');
        console.error('   1. Go to Supabase Dashboard');
        console.error('   2. Check if project is active (not paused)');
        console.error('   3. Go to Settings → API');
        console.error('   4. Copy the "Project URL" (should be https://xxxxx.supabase.co)');
        console.error('   5. Update SUPABASE_URL in .env file\n');
        process.exit(1);
    }

    // Test Supabase API connection
    console.log('🔍 Testing Supabase API connection...');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey || '',
                'Authorization': `Bearer ${supabaseAnonKey || ''}`
            }
        });

        if (response.ok || response.status === 404) {
            // 404 is okay - it means the API is reachable
            console.log(`✅ Supabase API is reachable!`);
            console.log(`   Status: ${response.status}\n`);
        } else {
            console.log(`⚠️  API responded with status: ${response.status}`);
            console.log(`   This might indicate an authentication issue\n`);
        }
    } catch (error) {
        console.error(`❌ Failed to connect to Supabase API`);
        console.error(`   Error: ${error.message}\n`);
        
        if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.error('💡 This means the hostname cannot be resolved.');
            console.error('   Check:');
            console.error('   1. Is your Supabase project active? (not paused)');
            console.error('   2. Is the URL correct in .env?');
            console.error('   3. Can you access https://app.supabase.com?\n');
        }
        process.exit(1);
    }

    // Test actual database query
    console.log('🔍 Testing database query...');
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            if (error.message.includes('does not exist') || 
                error.message.includes("Could not find the table")) {
                console.error(`❌ Database schema not found!`);
                console.error(`   Error: ${error.message}\n`);
                console.error('📋 Solution:');
                console.error('   1. Go to Supabase → SQL Editor');
                console.error('   2. Run: backend/src/db/schema.sql\n');
            } else if (error.message.includes('JWT') || error.message.includes('Invalid API key')) {
                console.error(`❌ Authentication failed!`);
                console.error(`   Error: ${error.message}\n`);
                console.error('📋 Solution:');
                console.error('   1. Check SUPABASE_ANON_KEY in .env');
                console.error('   2. Get correct key from: Settings → API → anon public\n');
            } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
                console.error(`❌ Row Level Security (RLS) blocking query!`);
                console.error(`   Error: ${error.message}\n`);
                console.error('📋 Solution:');
                console.error('   1. Check if RLS policies are set up correctly');
                console.error('   2. Make sure service_role key is used for admin operations');
                console.error('   3. Verify SUPABASE_SERVICE_ROLE_KEY is set in .env\n');
            } else {
                console.error(`❌ Database query failed!`);
                console.error(`   Error: ${error.message}\n`);
                console.error(`   Code: ${error.code || 'N/A'}\n`);
            }
            process.exit(1);
        } else {
            console.log(`✅ Database query successful!`);
            console.log(`   Table 'users' exists and is accessible\n`);
        }
    } catch (error) {
        console.error(`❌ Failed to test database query`);
        console.error(`   Error: ${error.message}\n`);
        process.exit(1);
    }

    // Test service role connection (for admin operations)
    console.log('🔍 Testing service role connection...');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        console.log(`⚠️  SUPABASE_SERVICE_ROLE_KEY not set`);
        console.log(`   Some operations may fail without it\n`);
    } else {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            const { data, error } = await supabaseAdmin
                .from('users')
                .select('id')
                .limit(1);

            if (error) {
                console.error(`❌ Service role connection failed!`);
                console.error(`   Error: ${error.message}\n`);
                console.error('📋 This might affect admin operations\n');
            } else {
                console.log(`✅ Service role connection successful!\n`);
            }
        } catch (error) {
            console.error(`❌ Service role test failed`);
            console.error(`   Error: ${error.message}\n`);
        }
    }

    console.log('✅ All connection tests passed!\n');
    console.log('💡 If you still get errors when running the server:');
    console.log('   1. Make sure database schema is created (run schema.sql)');
    console.log('   2. Check all API keys are correct in .env');
    console.log('   3. Verify SUPABASE_SERVICE_ROLE_KEY is set\n');
}

testConnection().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});

