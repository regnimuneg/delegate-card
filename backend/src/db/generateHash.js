import bcrypt from 'bcrypt';

const password = process.argv[2] || 'demo123';

bcrypt.hash(password, 10)
    .then(hash => {
        console.log(hash);
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

