# Row Level Security (RLS) Summary

## Overview

All tables have Row Level Security (RLS) enabled to ensure **each user can ONLY access their own data**. This document summarizes the security policies.

## User Data Isolation

### ✅ Users Table
- **Policy**: "Users can view own data"
- **Access**: Users can only SELECT their own user record
- **Check**: `auth.uid() = users.id`

### ✅ Delegates Table
- **Policy**: "Delegates can view own data"
- **Access**: Delegates can only SELECT their own delegate profile
- **Check**: `auth.uid() = delegates.user_id`
- **Note**: Service role can access all for administrative purposes

### ✅ Members Table
- **Policy**: "Members can view own data"
- **Access**: Members can only SELECT their own member profile
- **Check**: `auth.uid() = members.user_id`
- **Note**: Service role can access all for administrative purposes

### ✅ Voucher Claims Table
- **Policy**: "Delegates can view own claims"
- **Access**: Delegates can only SELECT their own voucher claims
- **Check**: `auth.uid() = (SELECT user_id FROM delegates WHERE id = voucher_claims.delegate_id)`

### ✅ Attendance Records Table
- **Policy**: "Delegates can view own attendance"
- **Access**: Delegates can only SELECT their own attendance records
- **Check**: `auth.uid() = (SELECT user_id FROM delegates WHERE id = attendance_records.delegate_id)`

### ✅ Food History Table
- **Policy**: "Delegates can view own food history"
- **Access**: Delegates can only SELECT their own food history
- **Check**: `auth.uid() = (SELECT user_id FROM delegates WHERE id = food_history.delegate_id)`

### ✅ Activity Timeline Table
- **Policy**: "Users can view own activities"
- **Access**: Users (both delegates and members) can only SELECT their own activity timeline entries
- **Check**: `auth.uid() = activity_timeline.user_id`
- **Note**: This applies to ALL users (delegates and members)

### ✅ Reward Activations Table
- **Policy**: "Delegates can view own reward activations"
- **Access**: Delegates can only SELECT their own reward activations
- **Check**: `auth.uid() = (SELECT user_id FROM delegates WHERE id = reward_activations.delegate_id)`

### ✅ Vouchers Table
- **Policy**: "Everyone can view active vouchers"
- **Access**: All authenticated users can view active vouchers (public catalog)
- **Check**: `is_active = TRUE`
- **Note**: This is intentional - vouchers are a public catalog that all users can browse

### ✅ Password Reset Tokens Table
- **Policy**: "Service role can manage password reset tokens"
- **Access**: Only service role (backend API) can access
- **Check**: `auth.role() = 'service_role'`
- **Note**: Tokens are sensitive and should never be accessible to regular users

## How It Works

1. **When a user logs in**:
   - Supabase Auth sets `auth.uid()` to the user's UUID from the `users` table
   - This UUID is used in all RLS policy checks

2. **When a user queries data**:
   - Supabase automatically filters results based on RLS policies
   - Users can ONLY see rows where the policy condition is true
   - For example, a delegate can only see `voucher_claims` where their `user_id` matches

3. **Backend API (Service Role)**:
   - Uses `supabaseAdmin` client which bypasses RLS
   - Has its own authentication middleware (`authenticate` middleware)
   - Validates user identity via JWT tokens
   - Filters data server-side based on `req.user.userId`

## Security Guarantees

✅ **Data Isolation**: Each user can ONLY see their own data
✅ **No Cross-User Access**: Users cannot access other users' data
✅ **Backend Protection**: Backend API validates user identity before returning data
✅ **Service Role Only**: Sensitive operations (password reset tokens) are service role only

## Testing RLS Policies

To verify RLS is working:

1. **Login as User A**:
   ```sql
   -- Set auth context (in Supabase SQL Editor, this is automatic for authenticated users)
   SELECT * FROM activity_timeline; -- Should only return User A's activities
   ```

2. **Login as User B**:
   ```sql
   SELECT * FROM activity_timeline; -- Should only return User B's activities
   ```

3. **Via Supabase Client (Frontend)**:
   ```javascript
   // User A's session
   const { data } = await supabase
     .from('activity_timeline')
     .select('*');
   // Returns only User A's activities (automatically filtered by RLS)
   ```

## Important Notes

- **RLS is enforced at the database level** - even if frontend code has bugs, users cannot access other users' data
- **Backend API uses service role** - but has its own authentication middleware for security
- **All policies use `(select auth.uid())`** - optimized to avoid per-row re-evaluation
- **Service role can access all data** - necessary for administrative operations

## Verification Checklist

- [x] All tables have RLS enabled
- [x] All user-specific tables have policies restricting access to own data
- [x] Policies use optimized `(select auth.uid())` syntax
- [x] Service role has appropriate access for administrative operations
- [x] Sensitive tables (password_reset_tokens) are service role only
