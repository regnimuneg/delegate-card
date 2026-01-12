# Database Setup & Test Data

## Quick Start

### 1. Set Up Database Schema

1. Go to your Supabase project → SQL Editor
2. Copy and paste the entire contents of `schema.sql`
3. Click **Run**

### 2. Generate Password Hashes

For the seed data, you need to generate proper bcrypt hashes:

```bash
# Generate hash for 'demo123'
node src/db/generatePasswordHash.js demo123

# Generate hash for 'admin123'
node src/db/generatePasswordHash.js admin123
```

Copy the generated hashes.

### 3. Update Seed File

1. Open `seed.sql`
2. Find the password hash placeholders:
   - `$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq` (replace with real hash)
   - `$2b$10$placeholder_hash_will_be_updated_on_claim` (leave as is)
3. Replace with the hashes you generated

### 4. Run Seed Script

1. Go to Supabase → SQL Editor
2. Copy and paste the entire contents of `seed.sql`
3. Click **Run**

## Test Accounts

### Delegates

**Sarah Ibrahim** (Already claimed - for login testing)
- Email: `sarah.ibrahim@example.com`
- Password: `demo123`
- Claim Token: `CLAIM-XYZ789` (already used)
- Status: Active
- Council: General Assembly
- Committee: SOCHUM

**Ahmed Hassan** (Unclaimed - for claim testing)
- Email: `ahmed.hassan@example.com`
- Claim Token: `CLAIM-ABC123` (not yet used)
- Status: Unclaimed
- Council: General Assembly
- Committee: DISEC

**Fatima Ali** (Active delegate)
- Email: `fatima.ali@example.com`
- Password: `demo123`
- Claim Token: `CLAIM-DEF456` (already used)
- Status: Active
- Council: Security Council
- Committee: UNSC

### Members

**Admin User**
- Email: `admin@nimun.org`
- Password: `admin123`
- Role: Administrator
- Committee: Secretariat

## Test Vouchers

1. **Coffee Corner** - 3 uses per delegate
2. **Snack Station** - 2 uses per delegate
3. **NIMUN Merch Shop** - 1 use per delegate
4. **Photo Booth** - Unlimited
5. **VIP Lounge Access** - Unlimited

## Verification

After seeding, verify the data:

```sql
-- Check users
SELECT id, email, first_name, last_name, user_type FROM users;

-- Check delegates
SELECT d.id, u.email, d.qr_slug, d.claim_token, d.status 
FROM delegates d 
JOIN users u ON d.id = u.id;

-- Check vouchers
SELECT id, name, usage_limit, is_active FROM vouchers;
```

## Troubleshooting

### Password Hashes Not Working

Make sure you:
1. Generated the hash using the script
2. Copied the entire hash (it's long!)
3. Replaced the placeholder in seed.sql

### Foreign Key Errors

Make sure you ran `schema.sql` first before `seed.sql`.

### Duplicate Key Errors

The seed script uses `ON CONFLICT DO NOTHING`, so it's safe to run multiple times. If you want to start fresh, uncomment the DELETE statements at the top of `seed.sql`.

