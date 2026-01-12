# CSV Import Guide for Delegates and Members

## Understanding the ID Structure

### Two Types of IDs:

1. **`users.id`** (UUID)
   - **Auto-generated**: ✅ Yes, automatically created if not provided
   - **Format**: UUID (e.g., `550e8400-e29b-41d4-a716-446655440001`)
   - **Purpose**: Internal database identifier for the user account
   - **Used by**: Authentication system, password reset, activity timeline

2. **`delegates.id` / `members.id`** (VARCHAR - Council/Committee Code)
   - **Auto-generated**: ❌ No, must be provided in CSV
   - **Format**: 
     - Delegates: `HRC-01`, `ICJ-05`, `DSC-12`, `PRS-03` (Council-Number)
     - Members: `EX-01`, `RG-05`, `PR-03`, `SO-12`, `MD-08`, `OP-15` (Committee-Number)
   - **Purpose**: Human-readable identifier used in QR codes, display, and external references
   - **Used by**: QR codes, delegate cards, public-facing displays

### The Relationship:

```
users table (base account)
    ↓ (one-to-one)
delegates/members table (role-specific data)
```

- Each delegate/member **must** have a corresponding user record
- The `delegates.user_id` / `members.user_id` links to `users.id`
- This creates a relationship: one user account → one delegate/member profile

## CSV Import Process

### Option 1: Import with Auto-Generated User IDs (Recommended)

**Step 1: Import Users First**

Your CSV should have:
```csv
email,password_hash,first_name,last_name,date_of_birth,user_type
sarah.ibrahim@example.com,$2b$10$...,Sarah,Ibrahim,2000-05-15,delegate
ahmed.hassan@example.com,$2b$10$...,Ahmed,Hassan,1999-08-22,delegate
```

**Note**: Leave `id` column empty or omit it - it will be auto-generated.

**Step 2: Get the Generated User IDs**

After importing users, query to get the mapping:
```sql
SELECT id, email FROM users WHERE user_type = 'delegate';
```

**Step 3: Import Delegates with User IDs**

Your CSV should have:
```csv
id,user_id,name,council,claim_token,qr_code,status
HRC-01,550e8400-e29b-41d4-a716-446655440001,Sarah Ibrahim,HRC,CLAIM-XYZ789,IC'26-HRC-01,unclaimed
ICJ-05,550e8400-e29b-41d4-a716-446655440002,Ahmed Hassan,ICJ,CLAIM-ABC123,IC'26-ICJ-05,unclaimed
```

**Important**: 
- `id` (HRC-01, etc.) must be provided - NOT auto-generated
- `user_id` must match the UUID from the users table

### Option 2: Import with Pre-Defined User IDs

If you want to control both IDs:

**Step 1: Import Users with Specific IDs**

```csv
id,email,password_hash,first_name,last_name,date_of_birth,user_type
550e8400-e29b-41d4-a716-446655440001,sarah.ibrahim@example.com,$2b$10$...,Sarah,Ibrahim,2000-05-15,delegate
550e8400-e29b-41d4-a716-446655440002,ahmed.hassan@example.com,$2b$10$...,Ahmed,Hassan,1999-08-22,delegate
```

**Step 2: Import Delegates with Matching User IDs**

```csv
id,user_id,name,council,claim_token,qr_code,status
HRC-01,550e8400-e29b-41d4-a716-446655440001,Sarah Ibrahim,HRC,CLAIM-XYZ789,IC'26-HRC-01,unclaimed
ICJ-05,550e8400-e29b-41d4-a716-446655440002,Ahmed Hassan,ICJ,CLAIM-ABC123,IC'26-ICJ-05,unclaimed
```

## Required CSV Columns

### For Users Table:
- `email` (required, unique)
- `password_hash` (required - use bcrypt hash)
- `first_name` (required)
- `last_name` (required)
- `date_of_birth` (optional, format: YYYY-MM-DD)
- `user_type` (required: 'delegate' or 'member')
- `id` (optional - auto-generated if omitted)

### For Delegates Table:
- `id` (required - format: HRC-01, ICJ-05, etc.)
- `user_id` (required - must match users.id UUID)
- `name` (required - full name)
- `council` (required - e.g., HRC, ICJ, DISEC, PRESS)
- `claim_token` (optional - format: CLAIM-XXXXXX)
- `qr_code` (required - format: IC'26-HRC-01)
- `status` (optional - default: 'unclaimed')

### For Members Table:
- `id` (required - format: EX-01, RG-05, etc.)
- `user_id` (required - must match users.id UUID)
- `name` (required - full name)
- `phone_number` (required)
- `role` (required - e.g., 'Head Of Registration Affairs')
- `committee` (required - must be one of: Executive, Registration Affairs, Socials & Events, Public Relations, Media & Design, Operations & Logistics)

## Example Import Script

Here's a Node.js script example for importing:

```javascript
import { supabaseAdmin } from './db/supabase.js';
import fs from 'fs';
import csv from 'csv-parser';

// Step 1: Import users
async function importUsers(csvPath) {
    const users = [];
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            // If id is empty, omit it (will be auto-generated)
            const user = {
                email: row.email,
                password_hash: row.password_hash,
                first_name: row.first_name,
                last_name: row.last_name,
                date_of_birth: row.date_of_birth || null,
                user_type: row.user_type
            };
            if (row.id) user.id = row.id; // Only include if provided
            users.push(user);
        })
        .on('end', async () => {
            const { data, error } = await supabaseAdmin
                .from('users')
                .insert(users)
                .select('id, email');
            
            if (error) {
                console.error('Error importing users:', error);
            } else {
                console.log('✅ Imported users:', data);
                // Save mapping for next step
                return data;
            }
        });
}

// Step 2: Import delegates (after users are imported)
async function importDelegates(csvPath, userEmailToIdMap) {
    const delegates = [];
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            const user_id = userEmailToIdMap[row.email];
            if (!user_id) {
                console.error(`User not found for email: ${row.email}`);
                return;
            }
            
            delegates.push({
                id: row.id, // HRC-01, etc.
                user_id: user_id,
                name: row.name,
                council: row.council,
                claim_token: row.claim_token || null,
                qr_code: row.qr_code,
                status: row.status || 'unclaimed'
            });
        })
        .on('end', async () => {
            const { data, error } = await supabaseAdmin
                .from('delegates')
                .insert(delegates);
            
            if (error) {
                console.error('Error importing delegates:', error);
            } else {
                console.log('✅ Imported delegates');
            }
        });
}
```

## Summary

| Field | Auto-Generated? | Required in CSV? | Notes |
|-------|----------------|------------------|-------|
| `users.id` | ✅ Yes | ❌ No (optional) | UUID, auto-generated if omitted |
| `delegates.id` / `members.id` | ❌ No | ✅ Yes | Must provide: HRC-01, EX-05, etc. |
| `delegates.user_id` / `members.user_id` | ❌ No | ✅ Yes | Must match `users.id` UUID |

## Best Practice

1. **Import users first** (let IDs auto-generate)
2. **Query the user_id mapping** (email → UUID)
3. **Import delegates/members** with the correct user_id references

This ensures proper relationships and avoids foreign key constraint errors.
