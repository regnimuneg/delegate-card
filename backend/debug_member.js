import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';
import { getMemberByEmail } from './src/config/database.js';

async function main() {
    try {
        const member = await getMemberByEmail('a.ahmad2313@nu.edu.eg');
        console.log("MEMBER OBJECT:", JSON.stringify(member, null, 2));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
