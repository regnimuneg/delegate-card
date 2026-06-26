import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';

async function main() {
    try {
        const email = 'mostafaelhussein2004@gmail.com';
        
        // Find user by email
        const newCode = 'MST666';
        const { error: updateError } = await supabaseAdmin
            .from('delegates')
            .update({ claim_token: newCode })
            .eq('id', 'TEST-DEL-7289');
            
        if (updateError) {
            console.error("Failed to update delegate:", updateError);
            return;
        }
        
        console.log(`Successfully updated claim code to: ${newCode}`);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
