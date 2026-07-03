-- ============================================
-- Update Partner Vendors for JNIMUN'26
-- ============================================

-- Step 1: Deactivate all existing vouchers
UPDATE vouchers SET is_active = false;

-- Step 2: Insert or update vendors
-- Using INSERT ... ON CONFLICT (id) DO UPDATE isn't straightforward because names aren't primary keys.
-- We can write clean INSERTs. To avoid duplicate names if run repeatedly, we can clean up old active ones first,
-- or just delete first and insert fresh. 
-- Since we deactivated all, we can delete any previously active one with these names first to prevent duplicates.
DELETE FROM vouchers WHERE name IN (
    'Billy''s Belly', 'Yole', 'B&f', 'Vapiano', 'Coddiwomple', 'Superpark', '2ooltasa'
);

INSERT INTO vouchers (name, description, icon, vendor_name, vendor_location, usage_limit, static_code, valid_from, valid_until, is_active)
VALUES 
-- Billy's Belly
(
    'Billy''s Belly',
    '10% Discount on show of card.',
    '/assets/jnimun/vendors/billys_belly.png',
    'Billy''s Belly',
    'Billy''s Belly',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    '2026-07-30 23:59:59+03',
    TRUE
),
-- Yole
(
    'Yole',
    '15% off. Unlimited usages.',
    '/assets/jnimun/vendors/yole.png',
    'Yole',
    'Yole',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
),
-- B&f
(
    'B&f',
    '10% Discount.',
    '/assets/jnimun/vendors/b_and_f.png',
    'B&f',
    'B&f',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    '2026-08-01 23:59:59+03',
    TRUE
),
-- Vapiano
(
    'Vapiano',
    '20% Discount at Arkan and Marassi branches.',
    '/assets/jnimun/vendors/vapiano.png',
    'Vapiano',
    'Arkan & Marassi',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    '2026-12-31 23:59:59+03',
    TRUE
),
-- Coddiwomple
(
    'Coddiwomple',
    '25% Discount.',
    '/assets/jnimun/vendors/coddiwomple.png',
    'Coddiwomple',
    'Online',
    NULL,
    'NIMUN26xCoddiwomple',
    '2026-07-06 00:00:00+03',
    '2026-09-01 23:59:59+03',
    TRUE
),
-- Superpark
(
    'Superpark',
    '10% Discount.',
    '/assets/jnimun/vendors/superpark.png',
    'Superpark',
    'Superpark',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    '2026-08-15 23:59:59+03',
    TRUE
),
-- 2ooltasa
(
    '2ooltasa',
    '50% off the first meal. Subsequent orders are 10% off. Place orders 1 day before via Instagram DM by sending a card photo.',
    '/assets/jnimun/vendors/2ooltasa.png',
    '2ooltasa',
    'Instagram DM',
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    '2026-12-31 23:59:59+03',
    TRUE
);
