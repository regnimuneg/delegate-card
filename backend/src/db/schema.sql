-- ============================================
-- NIMUN Database Schema
-- Shared by Delegate Card System & Delegate Tracking System
-- Supabase/PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Base user information)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    photo_url TEXT,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('delegate', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- DELEGATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delegates (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    qr_slug VARCHAR(50) UNIQUE NOT NULL,
    claim_token VARCHAR(50) UNIQUE,
    claim_token_used BOOLEAN DEFAULT FALSE,
    council VARCHAR(100) NOT NULL,
    committee VARCHAR(100),
    status VARCHAR(20) DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'active', 'inactive')),
    sessions_attended INTEGER DEFAULT 0,
    days_attended INTEGER DEFAULT 0,
    awards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEMBERS TABLE (Staff, Chairs, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- e.g., 'Chair', 'Vice-Chair', 'Staff', 'Admin'
    committee VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{}', -- Store role-specific permissions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VOUCHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon identifier for frontend
    vendor_name VARCHAR(100),
    vendor_location TEXT,
    usage_limit INTEGER, -- NULL for unlimited
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VOUCHER CLAIMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voucher_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegate_id UUID NOT NULL REFERENCES delegates(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qr_token TEXT, -- Dynamic QR token for redemption
    qr_expires_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    UNIQUE(delegate_id, voucher_id, claimed_at)
);

-- ============================================
-- ATTENDANCE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegate_id UUID NOT NULL REFERENCES delegates(id) ON DELETE CASCADE,
    session_name VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    points_awarded INTEGER DEFAULT 0,
    notes TEXT
);

-- ============================================
-- FOOD HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegate_id UUID NOT NULL REFERENCES delegates(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    location VARCHAR(200),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voucher_claim_id UUID REFERENCES voucher_claims(id) ON DELETE SET NULL
);

-- ============================================
-- ACTIVITY TIMELINE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('attendance', 'food', 'voucher', 'game', 'award', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- Store additional activity data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REWARD ACTIVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reward_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegate_id UUID NOT NULL REFERENCES delegates(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('lunch', 'dinner', 'snack', 'merch')),
    qr_token TEXT NOT NULL,
    qr_data JSONB NOT NULL, -- Store full QR payload
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- Delegates indexes
CREATE INDEX IF NOT EXISTS idx_delegates_qr_slug ON delegates(qr_slug);
CREATE INDEX IF NOT EXISTS idx_delegates_claim_token ON delegates(claim_token);
CREATE INDEX IF NOT EXISTS idx_delegates_status ON delegates(status);
CREATE INDEX IF NOT EXISTS idx_delegates_council ON delegates(council);

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_committee ON members(committee);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Voucher claims indexes
CREATE INDEX IF NOT EXISTS idx_voucher_claims_delegate ON voucher_claims(delegate_id);
CREATE INDEX IF NOT EXISTS idx_voucher_claims_voucher ON voucher_claims(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_claims_status ON voucher_claims(status);
CREATE INDEX IF NOT EXISTS idx_voucher_claims_qr_token ON voucher_claims(qr_token);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_delegate ON attendance_records(delegate_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(session_date);

-- Food history indexes
CREATE INDEX IF NOT EXISTS idx_food_delegate ON food_history(delegate_id);
CREATE INDEX IF NOT EXISTS idx_food_claimed_at ON food_history(claimed_at);

-- Activity timeline indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_timeline(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_timeline(created_at DESC);

-- Reward activations indexes
CREATE INDEX IF NOT EXISTS idx_reward_delegate ON reward_activations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_reward_qr_token ON reward_activations(qr_token);
CREATE INDEX IF NOT EXISTS idx_reward_status ON reward_activations(status);
CREATE INDEX IF NOT EXISTS idx_reward_expires ON reward_activations(expires_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegates_updated_at BEFORE UPDATE ON delegates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voucher_claims_updated_at BEFORE UPDATE ON voucher_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_activations ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Delegates: Delegates can view their own data
CREATE POLICY "Delegates can view own data" ON delegates
    FOR SELECT USING (auth.uid() = id);

-- Delegates: Service role can manage all delegates
CREATE POLICY "Service role can manage delegates" ON delegates
    FOR ALL USING (auth.role() = 'service_role');

-- Vouchers: Everyone can view active vouchers
CREATE POLICY "Everyone can view active vouchers" ON vouchers
    FOR SELECT USING (is_active = TRUE);

-- Voucher Claims: Delegates can view their own claims
CREATE POLICY "Delegates can view own claims" ON voucher_claims
    FOR SELECT USING (auth.uid() = delegate_id);

-- Attendance: Delegates can view their own attendance
CREATE POLICY "Delegates can view own attendance" ON attendance_records
    FOR SELECT USING (auth.uid() = delegate_id);

-- Food History: Delegates can view their own food history
CREATE POLICY "Delegates can view own food history" ON food_history
    FOR SELECT USING (auth.uid() = delegate_id);

-- Activity Timeline: Users can view their own activities
CREATE POLICY "Users can view own activities" ON activity_timeline
    FOR SELECT USING (auth.uid() = user_id);

-- Reward Activations: Delegates can view their own activations
CREATE POLICY "Delegates can view own reward activations" ON reward_activations
    FOR SELECT USING (auth.uid() = delegate_id);

-- Note: For production, you'll need to configure Supabase Auth
-- and adjust RLS policies based on your authentication setup

