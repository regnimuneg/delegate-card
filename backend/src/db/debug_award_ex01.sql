-- ============================================
-- Debug: Check if award was set for EX-01
-- ============================================

-- 1. Check if award column exists in members table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' AND column_name = 'award';

-- 2. Check EX-01's current data
SELECT 
    m.id,
    u.first_name,
    u.last_name,
    m.committee,
    m.award
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.id = 'EX-01';

-- 3. If award column exists but is NULL, set it:
UPDATE members 
SET award = 'Best Executive' 
WHERE id = 'EX-01';

-- 4. Verify again
SELECT 
    m.id,
    u.first_name,
    u.last_name,
    m.committee,
    m.award
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.id = 'EX-01';
