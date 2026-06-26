import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function setAdminPassword() {
    try {
        const email = 'a.ahmad2313@nu.edu.eg';
        const randomPassword = crypto.randomBytes(6).toString('hex'); // 12 character random password
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        // 1. Get the user first
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) throw new Error("User not found: " + userError?.message);

        // 2. Update users table with new hash
        const { error: hashError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('email', email);
            
        if (hashError) throw hashError;

        // 3. Update members table with admin permissions
        const { error: permError } = await supabaseAdmin
            .from('members')
            .update({ 
                permissions: { admin: true, manage_delegates: true, manage_members: true },
                claim_token_used: true
            })
            .eq('user_id', user.id);
            
        if (permError) throw permError;

        console.log("======================================");
        console.log("SUCCESS! Account Updated.");
        console.log("Email:    " + email);
        console.log("Password: " + randomPassword);
        console.log("Permissions granted: Admin");
        console.log("======================================");
        
    } catch (e) {
        console.error("ERROR:", e);
    }
}
setAdminPassword();
