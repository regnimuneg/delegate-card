
import { body, validationResult } from 'express-validator';
import express from 'express';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
console.log('Express Validator Version in package.json:', packageJson.dependencies['express-validator']);

const app = express();
app.use(express.json());

app.post('/test',
    body('email').isEmail().toLowerCase(),
    (req, res) => {
        const errors = validationResult(req);
        console.log('Errors:', errors.array());
        console.log('Body:', req.body);
        res.json({ body: req.body });
    }
);

// Supertest removed

// Since I cannot easily install supertest if not present, I'll just run the server and use fetch (if node 18+) or http
const port = 3456;
const server = app.listen(port, async () => {
    console.log(`Test server running on port ${port}`);

    try {
        const email = "y.mohammed2508@gmail.com";
        console.log(`Sending email: ${email}`);

        const response = await fetch(`http://localhost:${port}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Response body:', data.body);

        if (data.body.email === email) {
            console.log('✅ Dots preserved');
        } else {
            console.log('❌ Dots removed:', data.body.email);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        server.close();
    }
});
