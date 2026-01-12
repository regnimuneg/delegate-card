/**
 * Verify backend configuration
 * Run: node src/utils/verifyConfig.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '../../.env') });

console.log('🔍 Verifying Backend Configuration...\n');

const checks = [];

// Check SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
    checks.push({ name: 'SUPABASE_URL', status: '❌ Missing', value: 'Not set' });
} else if (!supabaseUrl.startsWith('https://')) {
    checks.push({ name: 'SUPABASE_URL', status: '❌ Invalid', value: supabaseUrl, note: 'Should start with https://' });
} else if (!supabaseUrl.includes('.supabase.co')) {
    checks.push({ name: 'SUPABASE_URL', status: '❌ Invalid', value: supabaseUrl, note: 'Should be a Supabase API URL' });
} else if (supabaseUrl.includes('db.')) {
    checks.push({ name: 'SUPABASE_URL', status: '❌ Wrong Format', value: supabaseUrl, note: 'This looks like a database URL. Use the API URL from Settings → API → Project URL' });
} else {
    checks.push({ name: 'SUPABASE_URL', status: '✅ Valid', value: supabaseUrl });
}

// Check SUPABASE_ANON_KEY
const anonKey = process.env.SUPABASE_ANON_KEY;
if (!anonKey) {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '❌ Missing', value: 'Not set' });
} else if (anonKey.length < 100) {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '⚠️  Suspicious', value: `${anonKey.substring(0, 20)}...`, note: 'Key seems too short' });
} else {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '✅ Set', value: `${anonKey.substring(0, 20)}...` });
}

// Check SUPABASE_SERVICE_ROLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '❌ Missing', value: 'Not set' });
} else if (serviceKey.length < 100) {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '⚠️  Suspicious', value: `${serviceKey.substring(0, 20)}...`, note: 'Key seems too short' });
} else {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '✅ Set', value: `${serviceKey.substring(0, 20)}...` });
}

// Check JWT_SECRET
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    checks.push({ name: 'JWT_SECRET', status: '❌ Missing', value: 'Not set' });
} else if (jwtSecret.length < 32) {
    checks.push({ name: 'JWT_SECRET', status: '⚠️  Weak', value: '***', note: 'Should be at least 32 characters' });
} else {
    checks.push({ name: 'JWT_SECRET', status: '✅ Set', value: '***' });
}

// Check CORS_ORIGIN
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
    checks.push({ name: 'CORS_ORIGIN', status: '⚠️  Not set', value: 'Will use default', note: 'Default: http://localhost:5173' });
} else {
    checks.push({ name: 'CORS_ORIGIN', status: '✅ Set', value: corsOrigin });
}

// Display results
console.log('Configuration Check Results:\n');
checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
    console.log(`   Value: ${check.value}`);
    if (check.note) {
        console.log(`   Note: ${check.note}`);
    }
    console.log('');
});

// Summary
const hasErrors = checks.some(c => c.status.includes('❌'));
const hasWarnings = checks.some(c => c.status.includes('⚠️'));

if (hasErrors) {
    console.log('❌ Configuration has errors. Please fix them before starting the server.\n');
    console.log('📖 See TROUBLESHOOTING.md for help.\n');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  Configuration has warnings. Review them above.\n');
    process.exit(0);
} else {
    console.log('✅ All configuration checks passed!\n');
    process.exit(0);
}

