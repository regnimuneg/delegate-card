-- ============================================
-- NIMUN Test Data Seed Script (Refactored Schema)
-- Run this in Supabase SQL Editor after schema
-- ============================================

-- Clear existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM reward_activations;
-- DELETE FROM activity_timeline;
-- DELETE FROM food_history;
-- DELETE FROM attendance_records;
-- DELETE FROM voucher_claims;
-- DELETE FROM vouchers;
-- DELETE FROM delegates;
-- DELETE FROM members;
-- DELETE FROM users;

-- ============================================
-- TEST USERS & DELEGATES
-- ============================================

-- Test Delegate 1: Sarah Ibrahim (HRC-01) - Already claimed
-- ID Format: HRC-XX
INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'sarah.ibrahim@example.com',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password: demo123 (PLACEHOLDER - MUST BE REPLACED)
    'Sarah',
    'Ibrahim',
    '2000-05-15',
    'delegate'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO delegates (
    id, user_id, name, council, claim_token, claim_token_used, qr_code, status,
    opening_ceremony_attended, opening_ceremony_checkin, opening_ceremony_food,
    day1_session_attended, day1_checkin, day1_food,
    day2_session_attended, day2_checkin, day2_food
)
VALUES (
    'HRC-01',
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah Ibrahim',
    'HRC',
    'CLAIM-XYZ789',
    TRUE,
    'NIMUN-2026-HRC-01',
    'active',
    TRUE, NOW() - INTERVAL '3 days', TRUE,
    TRUE, NOW() - INTERVAL '2 days', TRUE,
    TRUE, NOW() - INTERVAL '1 day', TRUE
) ON CONFLICT (id) DO NOTHING;

-- Test Delegate 2: Ahmed Hassan (ICJ-05) - Unclaimed
-- ID Format: ICJ-XX
INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'ahmed.hassan@example.com',
    '$2b$10$placeholder_hash_will_be_updated_on_claim',
    'Ahmed',
    'Hassan',
    '1999-08-22',
    'delegate'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO delegates (
    id, user_id, name, council, claim_token, claim_token_used, qr_code, status
)
VALUES (
    'ICJ-05',
    '550e8400-e29b-41d4-a716-446655440002',
    'Ahmed Hassan',
    'ICJ',
    'CLAIM-ABC123',
    FALSE,
    'NIMUN-2026-ICJ-05',
    'unclaimed'
) ON CONFLICT (id) DO NOTHING;

-- Test Delegate 3: Fatima Ali (DSC-12) - Active
-- ID Format: DSC-XX (DISEC)
INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'fatima.ali@example.com',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password: demo123 (PLACEHOLDER - MUST BE REPLACED)
    'Fatima',
    'Ali',
    '2001-03-10',
    'delegate'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO delegates (
    id, user_id, name, council, claim_token, claim_token_used, qr_code, status,
    opening_ceremony_attended, opening_ceremony_checkin, opening_ceremony_food,
    day1_session_attended, day1_checkin, day1_food, day1_comments
)
VALUES (
    'DSC-12',
    '550e8400-e29b-41d4-a716-446655440003',
    'Fatima Ali',
    'DISEC',
    'CLAIM-DEF456',
    TRUE,
    'NIMUN-2026-DSC-12',
    'active',
    TRUE, NOW() - INTERVAL '3 days', TRUE,
    TRUE, NOW() - INTERVAL '2 days', TRUE, 'Left 30 minutes early due to emergency'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST MEMBERS
-- ============================================

-- Executive Committee (EX-01 to EX-04 reserved for high board)
-- EX-01 to EX-04: Reserved for high board (not created in seed data)

-- Executive Member: Adham Abdelaal (EX-05)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    'adham.abdelaal@nimun.org',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password: demo123 (PLACEHOLDER - MUST BE REPLACED)
    'Adham',
    'Abdelaal',
    'member'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO members (id, user_id, name, phone_number, role, committee)
VALUES (
    'EX-05',
    '550e8400-e29b-41d4-a716-446655440013',
    'Adham Abdelaal',
    '+201234567890', -- Replace with actual phone number
    'Head Of Registration Affairs', -- Executive role
    'Executive'
) ON CONFLICT (id) DO NOTHING;

-- Executive Member: Malak Ehab (EX-06)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440014',
    'malak.ehab@nimun.org',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password: demo123 (PLACEHOLDER - MUST BE REPLACED)
    'Malak',
    'Ehab',
    'member'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO members (id, user_id, name, phone_number, role, committee)
VALUES (
    'EX-06',
    '550e8400-e29b-41d4-a716-446655440014',
    'Malak Ehab',
    '+201234567891', -- Replace with actual phone number
    'Chair Of UNHRC', -- Executive role (replace with actual role)
    'Executive'
) ON CONFLICT (id) DO NOTHING;

-- Test Member: Admin User (can be any committee or admin type)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    'admin@nimun.org',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: admin123
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Test Member 2: Registration Affairs Staff
-- ID Format: RG-XX (Registration)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440011',
    'staff.reg@nimun.org',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password: demo123 (PLACEHOLDER - MUST BE REPLACED)
    'Registration',
    'Staff',
    'member'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO members (id, user_id, name, phone_number, role, committee)
VALUES (
    'RG-01',
    '550e8400-e29b-41d4-a716-446655440011',
    'Registration Staff',
    '+201234567892', -- Replace with actual phone number
    'Coordinator',
    'Registration Affairs'
) ON CONFLICT (id) DO NOTHING;

-- Test Member 3: Media & Design
-- ID Format: MD-XX (Media & Design)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440012',
    'media@nimun.org',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
    'Media',
    'Designer',
    'member'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO members (id, user_id, name, phone_number, role, committee)
VALUES (
    'MD-01',
    '550e8400-e29b-41d4-a716-446655440012',
    'Media Designer',
    '+201234567893', -- Replace with actual phone number
    'Lead',
    'Media & Design'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST VOUCHERS
-- ============================================

INSERT INTO vouchers (id, name, description, icon, vendor_name, vendor_location, usage_limit, is_active)
VALUES 
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Coffee Corner',
    'Free specialty coffee or hot beverage',
    'coffee',
    'Coffee Corner',
    'Main Hall - Ground Floor',
    3,
    TRUE
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Snack Station',
    'Complimentary snack pack',
    'snack',
    'Snack Station',
    'Main Hall - First Floor',
    2,
    TRUE
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'NIMUN Merch Shop',
    'Conference merchandise discount (20% off)',
    'merch',
    'NIMUN Merch Shop',
    'Exhibition Area',
    1,
    TRUE
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'Photo Booth',
    'Professional delegate photo session',
    'photo',
    'Photo Booth',
    'Main Hall - Lobby',
    NULL, -- Unlimited
    TRUE
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    'VIP Lounge Access',
    'Access to exclusive delegate lounge',
    'lounge',
    'VIP Lounge',
    'Second Floor',
    NULL, -- Unlimited
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST VOUCHER CLAIMS (for Sarah - HRC-01)
-- ============================================

INSERT INTO voucher_claims (delegate_id, voucher_id, claimed_at, qr_token, qr_expires_at, status)
VALUES 
(
    'HRC-01', -- Sarah
    '660e8400-e29b-41d4-a716-446655440001', -- Coffee Corner
    NOW() - INTERVAL '2 hours',
    'qr_token_coffee_1',
    NOW() - INTERVAL '1 hour',
    'redeemed'
),
(
    'HRC-01', -- Sarah
    '660e8400-e29b-41d4-a716-446655440002', -- Snack Station
    NOW() - INTERVAL '4 hours',
    'qr_token_snack_1',
    NOW() - INTERVAL '3 hours',
    'redeemed'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST ATTENDANCE RECORDS (Legacy/Detailed)
-- ============================================

INSERT INTO attendance_records (delegate_id, session_name, session_date, session_type, check_in_time, location, points_awarded)
VALUES 
(
    'HRC-01', -- Sarah
    'Opening Ceremony',
    CURRENT_DATE - INTERVAL '3 days',
    'opening_ceremony',
    NOW() - INTERVAL '3 days' - INTERVAL '2 hours',
    'Main Hall A',
    10
),
(
    'HRC-01', -- Sarah
    'HRC - Day 1 Session',
    CURRENT_DATE - INTERVAL '2 days',
    'day1',
    NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
    'Committee Room 3',
    15
),
(
    'HRC-01', -- Sarah
    'HRC - Day 2 Session',
    CURRENT_DATE - INTERVAL '1 day',
    'day2',
    NOW() - INTERVAL '1 day' - INTERVAL '2 hours',
    'Committee Room 3',
    15
),
(
    'DSC-12', -- Fatima
    'DISEC - Day 1 Session',
    CURRENT_DATE - INTERVAL '2 days',
    'day1',
    NOW() - INTERVAL '2 days' - INTERVAL '4 hours',
    'Security Council Chamber',
    20
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST FOOD HISTORY
-- ============================================

INSERT INTO food_history (delegate_id, meal_type, meal_day, location, claimed_at)
VALUES 
(
    'HRC-01', -- Sarah
    'lunch',
    'day1',
    'Main Hall Cafeteria',
    NOW() - INTERVAL '2 days' - INTERVAL '4 hours'
),
(
    'HRC-01', -- Sarah
    'lunch',
    'day2',
    'Main Hall Cafeteria',
    NOW() - INTERVAL '1 day' - INTERVAL '4 hours'
),
(
    'DSC-12', -- Fatima
    'breakfast',
    'day1',
    'Main Hall Cafeteria',
    NOW() - INTERVAL '2 days' - INTERVAL '6 hours'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST ACTIVITY TIMELINE
-- ============================================

INSERT INTO activity_timeline (user_id, activity_type, title, description, points, metadata)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', -- Sarah
    'attendance',
    'Day 2 Session Check-in',
    'HRC - Day 2 Session',
    15,
    '{"session_type": "day2", "location": "Committee Room 3"}'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440001', -- Sarah
    'food',
    'Lunch Claimed',
    'Main Hall Cafeteria - Day 2',
    0,
    '{"meal_type": "lunch", "meal_day": "day2", "location": "Main Hall Cafeteria"}'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440001', -- Sarah
    'voucher',
    'Voucher Claimed: Coffee Corner',
    'Free specialty coffee or hot beverage',
    0,
    '{"voucher_name": "Coffee Corner"}'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440003', -- Fatima
    'attendance',
    'Day 1 Session Check-in',
    'DISEC - Day 1 Session',
    20,
    '{"session_type": "day1", "location": "Security Council Chamber"}'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440001', -- Sarah
    'other',
    'Account Claimed',
    'Account successfully claimed and activated',
    0,
    '{}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (Run these to check data)
-- ============================================

-- Check users
-- SELECT id, email, first_name, last_name, user_type FROM users;

-- Check delegates
-- SELECT d.id, d.name, d.council, u.email, d.status 
-- FROM delegates d 
-- JOIN users u ON d.user_id = u.id;

-- Check members
-- SELECT m.id, m.name, m.committee, m.role, u.email
-- FROM members m
-- JOIN users u ON m.user_id = u.id;

-- Check vouchers
-- SELECT id, name, usage_limit, is_active FROM vouchers;

-- ============================================
-- IMPORTANT NOTES
-- ============================================

-- 1. The password hash for 'demo123' needs to be generated properly
--    Use this Node.js command to generate a proper hash:
--    node -e "const bcrypt = require('bcrypt'); bcrypt.hash('demo123', 10).then(hash => console.log(hash))"
--
-- 2. Replace the placeholder password hashes above with real bcrypt hashes
--
-- 3. For testing login:
--    - Email: sarah.ibrahim@example.com
--    - Password: demo123
--
-- 4. For testing claim:
--    - Token: CLAIM-ABC123
--    - This will allow you to set a password for Ahmed Hassan (ICJ-05)
--
-- 5. Delegate IDs are now council-based:
--    - HRC-XX (HRC council)
--    - ICJ-XX (ICJ council)
--    - DSC-XX (DISEC council)
--    - PRS-XX (PRESS council)
--    Examples: HRC-01 (Sarah Ibrahim), ICJ-05 (Ahmed Hassan), DSC-12 (Fatima Ali)
--
-- 6. Member IDs are committee-based:
--    - EX-XX (Executive)
--      * EX-01 to EX-04: Reserved for high board
--      * EX-05: Adham Abdelaal (Head Of Registration Affairs)
--      * EX-06: Malak Ehab (Head Of Media & Design - replace with actual role)
--      * EX-07 onwards: Available for other executive members
--    Note: Each executive member has a specific role (e.g., "Head Of Registration Affairs")
--    - RG-XX (Registration Affairs)
--    - PR-XX (Public Relations)
--    - SO-XX (Socials & Events)
--    - MD-XX (Media & Design)
--    - OP-XX (Operations & Logistics)
--    Examples: EX-05 (Adham Abdelaal), EX-06 (Malak Ehab), RG-01 (Registration Affairs), MD-01 (Media & Design)

