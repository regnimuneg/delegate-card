-- ============================================
-- Assign Awards to Delegates - NIMUN'26
-- ============================================

-- PRESS Awards
UPDATE delegates 
SET award = 'Best Reporter' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Haya' AND u.last_name = 'Labib'
);

UPDATE delegates 
SET award = 'Best Agency' 
WHERE id IN (
    SELECT d.id 
    FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Abdelrahman' AND u.last_name = 'Elsherif'
);

UPDATE delegates 
SET award = 'Honorable Mention' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE (u.first_name = 'Lama' AND u.last_name = 'Badr')
       OR (u.first_name = 'Kenzy' AND u.last_name = 'Kadry')
);

-- DISEC Awards
UPDATE delegates 
SET award = 'Best Delegate' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Mazen' AND u.last_name = 'Waleed'
);

UPDATE delegates 
SET award = 'Best Delegation' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Omar' AND u.last_name LIKE '%Ghamrawy%'
);

UPDATE delegates 
SET award = 'Honorable Mention' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE (u.first_name = 'Adel' AND u.last_name = 'Moataz')
       OR (u.first_name = 'Ahmed' AND u.last_name = 'Nashaat')
);

-- ICJ Awards
UPDATE delegates 
SET award = 'Honorable Mention' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE (u.first_name = 'Yasmine' AND u.last_name LIKE '%Kamel%')
       OR (u.first_name = 'Serien' AND u.last_name = 'Boghdady')
);

UPDATE delegates 
SET award = 'Best Judge' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Ziad' AND u.last_name = 'Fawzi'
);

UPDATE delegates 
SET award = 'Best Advocate' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Ali' AND u.last_name = 'Megahed'
);

-- HRC Awards
UPDATE delegates 
SET award = 'Best Delegate' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Yehia' AND u.last_name = 'Ezzat'
);

UPDATE delegates 
SET award = 'Best Delegation' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.first_name = 'Ahmad' AND u.last_name = 'Arafa'
);

UPDATE delegates 
SET award = 'Honorable Mention' 
WHERE id IN (
    SELECT d.id FROM delegates d 
    JOIN users u ON d.user_id = u.id 
    WHERE (u.first_name = 'Hala' AND u.last_name = 'Osama')
       OR (u.first_name = 'Youssef' AND u.last_name = 'Elliethy')
);

-- Verify awards assigned
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