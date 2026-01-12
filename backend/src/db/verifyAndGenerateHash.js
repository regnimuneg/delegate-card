import bcrypt from 'bcrypt';

async function verifyAndGenerate() {
    const password = 'demo123';
    const currentHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    
    console.log('Testing current hash...');
    const match = await bcrypt.compare(password, currentHash);
    console.log('Current hash matches:', match);
    
    if (!match) {
        console.log('\nGenerating new hash for "demo123"...');
        const newHash = await bcrypt.hash(password, 10);
        console.log('New hash:', newHash);
        console.log('\nVerifying new hash...');
        const verify = await bcrypt.compare(password, newHash);
        console.log('New hash verification:', verify);
    }
    
    process.exit(0);
}

verifyAndGenerate().catch(console.error);

