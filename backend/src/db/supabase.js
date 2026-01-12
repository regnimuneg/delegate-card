import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables with helpful error messages
if (!supabaseUrl) {
    throw new Error(
        'Missing SUPABASE_URL in .env file.\n' +
        '   Get it from: Supabase Dashboard → Settings → API → Project URL\n' +
        '   Format should be: https://xxxxx.supabase.co'
    );
}

if (!supabaseUrl.startsWith('https://')) {
    throw new Error(
        `Invalid SUPABASE_URL format: ${supabaseUrl}\n` +
        '   Should start with https:// (not db. or http://)\n' +
        '   Get the correct URL from: Supabase Dashboard → Settings → API → Project URL'
    );
}

if (supabaseUrl.includes('db.')) {
    throw new Error(
        `Wrong SUPABASE_URL format: ${supabaseUrl}\n` +
        '   This looks like a database connection string, not the API URL.\n' +
        '   Use the API URL from: Supabase Dashboard → Settings → API → Project URL\n' +
        '   Should be: https://xxxxx.supabase.co (not db.xxxxx.supabase.co)'
    );
}

if (!supabaseAnonKey) {
    throw new Error(
        'Missing SUPABASE_ANON_KEY in .env file.\n' +
        '   Get it from: Supabase Dashboard → Settings → API → anon public key'
    );
}

// Client for user operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service operations (uses service role key)
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
              autoRefreshToken: false,
              persistSession: false
          }
      })
    : null;

export default supabase;

