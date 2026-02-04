-- ============================================
-- Reset Adrenaline Usage for EX-01
-- ============================================

-- Find Adrenaline voucher ID
SELECT id, name, usage_limit 
FROM vouchers 
WHERE name LIKE '%Adrenaline%';

-- Delete any claims for EX-01 on Adrenaline
DELETE FROM voucher_claims 
WHERE member_id = 'EX-01' 
AND voucher_id = (SELECT id FROM vouchers WHERE name LIKE '%Adrenaline%' LIMIT 1);

-- Verify deletion
SELECT 
    vc.id,
    vc.member_id,
    v.name as voucher_name,
    vc.claimed_at,
    vc.status
FROM voucher_claims vc
JOIN vouchers v ON vc.voucher_id = v.id
WHERE vc.member_id = 'EX-01' AND v.name LIKE '%Adrenaline%';

-- Should return no rows if successful
