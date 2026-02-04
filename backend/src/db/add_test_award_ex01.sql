-- ============================================
-- Add Test Award to EX-01 (Dev Account)
-- ============================================

-- Note: EX-01 is in the members table, not delegates
-- Check if award column exists in members table first

-- If members table doesn't have award column, add it:
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS award VARCHAR(100);

-- Assign a test award to EX-01
UPDATE members 
SET award = 'Best Executive' 
WHERE id = 'EX-01';

-- Verify
SELECT 
    m.id,
    u.first_name,
    u.last_name,
    m.committee,
    m.award
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.id = 'EX-01';
