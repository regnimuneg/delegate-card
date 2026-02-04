-- ============================================
-- Add New Partner Offers
-- ============================================

-- 1. Add static_code column to vouchers table
ALTER TABLE vouchers 
ADD COLUMN IF NOT EXISTS static_code VARCHAR(100);

-- 2. Insert new vouchers
INSERT INTO vouchers (name, description, icon, vendor_name, vendor_location, usage_limit, static_code, valid_from, valid_until, is_active)
VALUES 
-- Joya gelato: 15% off, Unlimited
(
    'Joya Gelato',
    '15% Discount. Redeem by showing offer on portal.',
    'snack', -- Using existing 'snack' icon as fallback for food/dessert
    'Joya Gelato',
    'Joya Gelato',
    NULL, -- Unlimited
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
),
-- Coddi womple: 20% off, Online code, Unlimited (2 weeks from 2/2/2026)
(
    'CoddiWomple',
    '20% Discount. Use online code. Valid until Feb 16.',
    'default', 
    'CoddiWomple',
    'Online',
    NULL, -- Unlimited
    'CODDIWOMPLEXNIMUN26',
    '2026-02-02 00:00:00+02',
    '2026-02-16 23:59:59+02', -- 2 weeks from Feb 2
    TRUE
),
-- Adrenalin: 20% off, Once, Reservation required
(
    'Adrenalin',
    '20% Discount. Reservation required before going.',
    'default', -- Could use 'photo' or 'lounge' if they fit better, but default is safe
    'Adrenalin Park',
    'Adrenalin Park',
    1, -- Once
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
),
-- Social: 10% off, Unlimited, The Isle Branch Only
(
    'Social',
    '10% Discount. The Isle Branch Only.',
    'lounge', -- 'lounge' icon fits a social place
    'Social',
    'The Isle Branch',
    NULL, -- Unlimited
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
),
-- Billy's Belly: 20% off, Once, Up to 80 EGP Off
(
    'Billy''s Belly',
    '20% Discount (Up to 80 EGP).',
    'snack',
    'Billy''s Belly',
    'Billy''s Belly',
    1, -- Once
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
)
-- Using ON CONFLICT DO NOTHING to prevent duplicates if run multiple times
-- However, since names typically aren't unique constraints, we should be careful. 
-- Schema doesn't enforce unique names, so simple INSERT matches requirement.
;
