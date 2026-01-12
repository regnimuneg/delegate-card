-- ============================================
-- Remove Admin Support and Fix Password Reset Tokens Security
-- Run this script to apply the changes
-- ============================================

-- ============================================
-- 1. Remove Admin from User Type Constraint
-- ============================================
-- Note: This requires dropping and recreating the constraint
-- First, check if there are any admin users and handle them
-- (You may want to delete or convert them first)

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;

-- Add new constraint without admin
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('delegate', 'member'));

-- ============================================
-- 2. Enable RLS on password_reset_tokens
-- ============================================
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Add RLS Policy for password_reset_tokens
-- ============================================
-- Only service role can access password reset tokens
-- This ensures tokens are only accessible via backend API (service role)
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING ((select auth.role()) = 'service_role');

-- ============================================
-- 4. Clean up: Remove any existing admin users
-- ============================================
-- Uncomment the line below if you want to delete admin users
-- DELETE FROM users WHERE user_type = 'admin';

-- ============================================
-- Verification Queries
-- ============================================
-- Check if RLS is enabled on password_reset_tokens
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'password_reset_tokens';

-- Check policies on password_reset_tokens
-- SELECT * FROM pg_policies WHERE tablename = 'password_reset_tokens';

-- Check for any remaining admin users
-- SELECT * FROM users WHERE user_type = 'admin';
