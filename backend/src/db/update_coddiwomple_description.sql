-- ============================================
-- Update CoddiWomple Description with Deadline
-- ============================================

UPDATE vouchers 
SET description = '20% Discount. Use online code. Valid until Feb 16.'
WHERE name = 'CoddiWomple';

-- Verify update
SELECT id, name, description, valid_until 
FROM vouchers 
WHERE name = 'CoddiWomple';
