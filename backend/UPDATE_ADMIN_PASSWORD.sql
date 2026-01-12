-- ============================================
-- UPDATE ADMIN PASSWORD HASH
-- Run this in Supabase SQL Editor
-- ============================================

-- First, generate the hash:
-- Run: node src/db/generatePasswordHash.js admin123
-- Then replace HASH_HERE with the generated hash

UPDATE users 
SET password_hash = '$2b$10$Qef5xWc6ex0BDGDXtvlngOGUIeeiwstocxBW2TZyFcBuJ/mVYhvq6'  -- Password: admin123
WHERE email = 'admin@nimun.org';

-- Verify the update
SELECT email, first_name, last_name, user_type, LEFT(password_hash, 20) as hash_preview 
FROM users 
WHERE email = 'admin@nimun.org';

