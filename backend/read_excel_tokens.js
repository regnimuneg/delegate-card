import fs from 'fs';
import xlsx from 'xlsx';
import 'dotenv/config';
import { supabaseAdmin } from './src/db/supabase.js';

async function main() {
    const excelPath = '../Full Participants.xlsx';
    console.log("Reading Excel file:", excelPath);
    
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Create a map of ID -> Token
    const tokenMap = {};
    let validRows = 0;
    
    for (const row of data) {
        // Look for ID and Claim Code columns. They might be named 'ID' and 'Claim Code' or something similar.
        // Let's find the exact column names.
        const keys = Object.keys(row);
        const idKey = keys.find(k => k.toLowerCase() === 'id');
        const tokenKey = keys.find(k => k.toLowerCase().includes('claim') && k.toLowerCase().includes('code'));
        
        if (idKey && tokenKey && row[idKey] && row[tokenKey]) {
            tokenMap[row[idKey]] = row[tokenKey];
            validRows++;
        }
    }
    
    console.log(`Found ${validRows} valid tokens in Excel.`);
    
    // 1. Update the seed_full_participants.sql file
    const sqlPath = 'seed_full_participants.sql';
    const lines = fs.readFileSync(sqlPath, 'utf8').split('\n');
    let sqlUpdatedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^\s*\(\s*'([^']+)'\s*,/);
        
        if (match) {
            const id = match[1];
            if (tokenMap[id]) {
                const newToken = tokenMap[id];
                // Replace the old token in the SQL file line
                const newLine = line.replace(/(, '[^']+', )'([A-Z0-9]{6})'(, '(?:member|delegate|invitation)', )/, (m, p1, oldToken, p3) => {
                    return `${p1}'${newToken}'${p3}`;
                });
                
                if (line !== newLine) {
                    lines[i] = newLine;
                    sqlUpdatedCount++;
                } else {
                    // Try fallback regex
                    const fallbackLine = line.replace(/(, )'([A-Z0-9]{6})'(, '(?:member|delegate|invitation)', )/, (m, p1, oldToken, p3) => {
                        return `${p1}'${newToken}'${p3}`;
                    });
                    if (line !== fallbackLine) {
                        lines[i] = fallbackLine;
                        sqlUpdatedCount++;
                    }
                }
            }
        }
    }
    
    fs.writeFileSync(sqlPath, lines.join('\n'), 'utf8');
    console.log(`Updated ${sqlUpdatedCount} rows in ${sqlPath}`);
    
    // 2. Update the Supabase database
    console.log("Updating Supabase database...");
    let dbUpdatedDelegates = 0;
    let dbUpdatedMembers = 0;
    
    for (const [id, token] of Object.entries(tokenMap)) {
        // Try updating delegates first
        let { data: delData, error: delError } = await supabaseAdmin
            .from('delegates')
            .update({ claim_token: token })
            .eq('id', id)
            .select();
            
        if (delData && delData.length > 0) {
            dbUpdatedDelegates++;
            continue;
        }
        
        // If not delegate, try member
        let { data: memData, error: memError } = await supabaseAdmin
            .from('members')
            .update({ claim_token: token })
            .eq('id', id)
            .select();
            
        if (memData && memData.length > 0) {
            dbUpdatedMembers++;
        }
    }
    
    console.log(`Successfully updated ${dbUpdatedDelegates} delegates and ${dbUpdatedMembers} members in the live database!`);
}

main().catch(console.error);
