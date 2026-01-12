/**
 * Generate bcrypt password hash
 * Run: node src/db/generatePasswordHash.js <password>
 */

import bcrypt from 'bcrypt';

const password = process.argv[2] || 'demo123';

bcrypt.hash(password, 10)
    .then(hash => {
        console.log('\nPassword:', password);
        console.log('Hash:', hash);
        console.log('\nCopy the hash above to use in seed.sql\n');
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

