import fs from 'fs';

function main() {
    const sqlPath = 'd:\\NIMUN\\NIMUN\'26\\Regsitration System\\NIMUN-Registration-System\\Backend\\db\\seed_full_participants.sql';
    const lines = fs.readFileSync(sqlPath, 'utf8').split('\n');
    let updatedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match a tuple row, e.g. "    ('EX-04', ..."
        if (line.match(/^\s*\(\s*'([^']+)'\s*,/)) {
            // Check if participant_type is 'member'
            if (line.includes(", 'member', ")) {
                // If the permissions are currently empty, update them
                if (line.includes("'{}'::JSONB")) {
                    lines[i] = line.replace("'{}'::JSONB", "'{\"track_data\": true, \"update_data\": true}'::JSONB");
                    updatedCount++;
                }
            }
        }
    }
    
    fs.writeFileSync(sqlPath, lines.join('\n'), 'utf8');
    
    // Also update the original one in backend folder to keep them in sync
    const originalSqlPath = 'd:\\NIMUN\\NIMUN\'26\\NIMUN Card\\backend\\seed_full_participants.sql';
    fs.writeFileSync(originalSqlPath, lines.join('\n'), 'utf8');
    
    console.log(`Updated ${updatedCount} member rows with track_data and update_data permissions.`);
}

main();
