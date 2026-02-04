-- ============================================
-- Assign Remaining 4 Awards by ID
-- ============================================

-- Now that we know the exact IDs, assign directly:

-- DSC-06: Mazen Waleed - Best Delegate
UPDATE delegates SET award = 'Best Delegate' WHERE id = 'DSC-06';

-- DSC-07: Omar Elghamrawy - Best Delegation  
UPDATE delegates SET award = 'Best Delegation' WHERE id = 'DSC-07';

-- PRS-02: Abdelrahman Esherif - Best Agency
UPDATE delegates SET award = 'Best Agency' WHERE id = 'PRS-02';

-- ICJ-02: serien boghdady - Honorable Mention
UPDATE delegates SET award = 'Honorable Mention' WHERE id = 'ICJ-02';

-- Verify all 16 awards assigned
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
