import bcrypt from 'bcrypt';

const password = 'demo123';
const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

console.log('Testing password:', password);
console.log('Testing hash:', hash);

bcrypt.compare(password, hash)
    .then(match => {
        console.log('Match:', match);
        if (!match) {
            console.log('\nGenerating new hash...');
            return bcrypt.hash(password, 10);
        }
    })
    .then(newHash => {
        if (newHash) {
            console.log('New hash:', newHash);
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

