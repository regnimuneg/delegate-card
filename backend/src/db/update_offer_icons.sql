-- ============================================
-- Update Voucher Icons (Logos)
-- ============================================

-- Update icons to point to local images in public/Vouchers/ directory
-- File names must match EXACTLY as they appear in the filesystem

-- Joya Gelato
UPDATE vouchers 
SET icon = '/Vouchers/joya.jpeg' 
WHERE name LIKE '%Joya%' OR name LIKE '%joya%';

-- Coddi Womple (using black version for visibility on light backgrounds)
UPDATE vouchers 
SET icon = '/Vouchers/coddiewomple black.png' 
WHERE name LIKE '%Coddi%' OR name LIKE '%coddi%';

-- Adrenalin Park  
UPDATE vouchers 
SET icon = '/Vouchers/Adernaline.jpeg' 
WHERE name LIKE '%Adrenalin%' OR name LIKE '%adrenalin%';

-- Social Restaurant
UPDATE vouchers 
SET icon = '/Vouchers/Social.jpeg' 
WHERE name LIKE '%Social%' OR name LIKE '%social%';

-- Billy's Belly
UPDATE vouchers 
SET icon = '/Vouchers/Billy''s Belly.PNG' 
WHERE name LIKE '%Billy%' OR name LIKE '%billy%';

-- Verify the updates
SELECT id, name, icon FROM vouchers WHERE icon LIKE '/Vouchers/%';
