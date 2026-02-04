-- ============================================
-- Add Award Column to Delegates Table
-- Run this FIRST before assign_awards.sql
-- ============================================

-- Add award column to delegates table
ALTER TABLE delegates 
ADD COLUMN IF NOT EXISTS award VARCHAR(100);

-- Add index for faster award queries
CREATE INDEX IF NOT EXISTS idx_delegates_award ON delegates(award);

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'delegates' AND column_name = 'award';
