-- ============================================
-- Reset Billy's Belly Usage for EX-01
-- ============================================

-- Find Billy's Belly voucher ID
SELECT id, name, usage_limit 
FROM vouchers 
WHERE name LIKE '%Billy%';

-- Delete any claims for EX-01 on Billy's Belly
-- Replace 'VOUCHER_ID_HERE' with the actual ID from above query
DELETE FROM voucher_claims 
WHERE member_id = 'EX-01' 
AND voucher_id = (SELECT id FROM vouchers WHERE name LIKE '%Billy%' LIMIT 1);

-- Verify deletion
SELECT 
    vc.id,
    vc.member_id,
    v.name as voucher_name,
    vc.claimed_at,
    vc.status
FROM voucher_claims vc
JOIN vouchers v ON vc.voucher_id = v.id
WHERE vc.member_id = 'EX-01' AND v.name LIKE '%Billy%';

-- Should return no rows if successful
