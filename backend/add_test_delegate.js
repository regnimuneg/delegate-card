import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function main() {
    try {
        const email = process.argv[2] || 'mostafaelhussein2004@gmail.com';
        const rawId = `TEST-DEL-${Math.floor(Math.random() * 10000)}`;
        
        // Use a random UUID for the user
        const userId = crypto.randomUUID();

        console.log(`Creating user with ID ${userId}...`);

        const passwordHash = await bcrypt.hash(rawId, 10);

        // 1. Insert into public.users
        const { error: userError } = await supabaseAdmin.from('users').insert({
            id: userId,
            email: email,
            password_hash: passwordHash,
            first_name: 'Adham',
            last_name: 'Test',
            phone_number: '01000000000',
            user_type: 'delegate'
        });

        if (userError) throw userError;

        // 2. Insert into public.delegates
        const claimCode = `TEST${Math.floor(Math.random() * 1000)}`;
        const { error: delError } = await supabaseAdmin.from('delegates').insert({
            id: rawId,
            user_id: userId,
            council: 'UNSC',
            claim_token: claimCode,
            qr_code: rawId,
            status: 'unclaimed',
            claim_token_used: false,
            award: null,
            past_awards: []
        });

        if (delError) throw delError;

        console.log(`\nSuccessfully created delegate!`);
        console.log(`Email: ${email}`);
        console.log(`Claim Code: ${claimCode}`);

    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
