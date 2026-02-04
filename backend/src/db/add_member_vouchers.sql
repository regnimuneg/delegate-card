-- ============================================
-- Add Member Support to Voucher Claims
-- ============================================

-- Add member_id column to voucher_claims table
ALTER TABLE voucher_claims
ADD COLUMN member_id VARCHAR(10) REFERENCES members(id);

-- Make delegate_id nullable since we now support both delegates and members
ALTER TABLE voucher_claims
ALTER COLUMN delegate_id DROP NOT NULL;

-- Add constraint to ensure either delegate_id OR member_id is set (but not both)
ALTER TABLE voucher_claims
ADD CONSTRAINT voucher_claims_user_check 
CHECK (
    (delegate_id IS NOT NULL AND member_id IS NULL) OR 
    (delegate_id IS NULL AND member_id IS NOT NULL)
);

-- Create index for member claims
CREATE INDEX idx_voucher_claims_member_id ON voucher_claims(member_id);
