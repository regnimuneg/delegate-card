-- ============================================
-- Find Missing Delegates and Assign Awards
-- ============================================

-- 1. Search for the missing delegates
SELECT d.id, u.first_name, u.last_name, d.council
FROM delegates d
JOIN users u ON d.user_id = u.id
WHERE 
    (u.first_name ILIKE '%Abdelrahman%' OR u.last_name ILIKE '%Elsherif%' OR u.last_name ILIKE '%Sherif%')
    OR (u.first_name ILIKE '%Mazen%' OR u.last_name ILIKE '%Waleed%')
    OR (u.first_name ILIKE '%Omar%' OR u.last_name ILIKE '%Ghamrawy%')
    OR (u.first_name ILIKE '%Serien%' OR u.last_name ILIKE '%Boghdady%')
ORDER BY d.council, u.first_name;

-- If you see the correct delegates above, run the updates below:

-- 2. Assign awards (update first_name/last_name if search reveals different spelling)
-- Abdelrahman Elsherif - Best Agency
UPDATE delegates 
SET award = 'Best Agency' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE (u.first_name ILIKE '%Abdelrahman%' AND u.last_name ILIKE '%sherif%')
);

-- Mazen Waleed - Best Delegate
UPDATE delegates 
SET award = 'Best Delegate' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name ILIKE '%Mazen%' AND u.last_name ILIKE '%Waleed%'
);

-- Omar El Ghamrawy - Best Delegation
UPDATE delegates 
SET award = 'Best Delegation' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name ILIKE '%Omar%' AND u.last_name ILIKE '%Ghamrawy%'
);

-- Serien Boghdady - Honorable Mention
UPDATE delegates 
SET award = 'Honorable Mention' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name ILIKE '%Serien%' AND u.last_name ILIKE '%Boghdady%'
);

-- 3. Verify all awards (should show 16 now)
SELECT 
    d.id,
    u.first_name,
    u.last_name,
    d.council,
    d.award
FROM delegates d
JOIN users u ON d.user_id = u.id
WHERE d.award IS NOT NULL
ORDER BY d.council, d.award;
