-- Check user_type for specific email
SELECT 
    email,
    user_type,
    first_name,
    last_name,
    id
FROM users
WHERE email = 'm.mamdouh2591@nu.edu.eg';

-- Check if there's a matching member record
SELECT m.*, u.email, u.user_type
FROM members m
JOIN users u ON m.user_id = u.id
WHERE u.email = 'm.mamdouh2591@nu.edu.eg';
