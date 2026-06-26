import fs from 'fs';
import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';

async function main() {
    console.log("Fetching tokens from database...");
    
    // Fetch delegates
    const { data: delegates } = await supabaseAdmin.from('delegates').select('id, claim_token');
    // Fetch members
    const { data: members } = await supabaseAdmin.from('members').select('id, claim_token');
    // Fetch invitations
    const { data: invitations } = await supabaseAdmin.from('invitations').select('id, claim_token');
    
    const tokenMap = {};
    const addTokens = (arr) => {
        if (!arr) return;
        for (const row of arr) {
            if (row.id && row.claim_token) {
                tokenMap[row.id] = row.claim_token;
            }
        }
    };
    
    addTokens(delegates);
    addTokens(members);
    addTokens(invitations);
    
    console.log(`Loaded ${Object.keys(tokenMap).length} tokens from database.`);
    
    const filePath = 'seed_full_participants.sql';
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    const lines = fileContent.split('\n');
    let updatedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match start of row e.g. "    ('EX-01', "
        const match = line.match(/^\s*\(\s*'([^']+)'\s*,/);
        if (match) {
            const id = match[1];
            if (tokenMap[id]) {
                const newToken = tokenMap[id];
                
                // The claim code is the 10th element.
                // We can find it by looking for the 10th string literal or just use a regex for the 6-character code
                // Let's assume the claim code is always formatted as 'XXXXXX' (6 chars) preceded by a comma and space.
                // Wait, it could be a different length? In NIMUN it's always 6 chars.
                // Let's just find the 10th value carefully.
                // Or since it's a known format: 'ROLE', 'CLAIM_CODE', 'TYPE'
                // E.g. 'Head Of Socials & Events', 'UC9QXN', 'member'
                // Let's just replace the 6-character uppercase alphanumeric string that is alone in single quotes.
                
                // Actually, let's split the line by ", " and replace the 9th index (0-based)
                // But full_name or role might contain ", " so split is dangerous.
                
                // Instead, since claim codes in the file are exactly 6 uppercase alphanumeric characters:
                // We can match: /('[A-Z0-9]{6}')/g
                // But wait! Is there any other 6 char string? Maybe ID like 'DEL-01' is 6 chars but has hyphen.
                // Let's use a regex that looks for exactly 10 fields before it?
                // Better: find the string that looks like a token: it's preceded by a string (role) and followed by 'member' or 'delegate' or 'invitation'.
                
                // Safer approach: 
                // The line looks like: ..., 'Role Name', 'OLDTOK', 'participant_type', ...
                const newLine = line.replace(/(, '[^']+', )'([A-Z0-9]{6})'(, '(?:member|delegate|invitation)', )/, (match, p1, oldToken, p3) => {
                    return `${p1}'${newToken}'${p3}`;
                });
                
                if (line !== newLine) {
                    lines[i] = newLine;
                    updatedCount++;
                } else {
                    // Fallback regex if it didn't match perfectly
                    const fallbackLine = line.replace(/(, )'([A-Z0-9]{6})'(, '(?:member|delegate|invitation)', )/, (match, p1, oldToken, p3) => {
                        return `${p1}'${newToken}'${p3}`;
                    });
                    if (line !== fallbackLine) {
                        lines[i] = fallbackLine;
                        updatedCount++;
                    }
                }
            }
        }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Updated ${updatedCount} rows in ${filePath}`);
}

main();
