# NIMUN Card System - Setup Guide

Complete setup guide for the NIMUN Delegate Card System with backend API and frontend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to be fully provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy and paste the entire contents of `backend/src/db/schema.sql`
5. Click **Run** to execute the schema

### 3. Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secret!)

3. Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

4. Fill in your `.env` file:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_very_strong_random_secret_key_here
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

**Important:** Generate a strong JWT_SECRET. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3000`

Test it:
- Health check: http://localhost:3000/health
- Database check: http://localhost:3000/health/db

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

## Database Schema Overview

The database is designed to be shared with the Delegate Tracking System:

### Core Tables

- **users** - Base user information (delegates and members)
- **delegates** - Delegate-specific data (councils, QR slugs, claim tokens)
- **members** - Member-specific data (committees, roles)

### Feature Tables

- **vouchers** - Available vouchers for delegates
- **voucher_claims** - Voucher redemption records
- **attendance_records** - Session attendance tracking
- **food_history** - Meal redemption history
- **activity_timeline** - User activity feed
- **reward_activations** - Dynamic reward QR codes

## Creating Test Data

### Create a Delegate (via Supabase SQL Editor)

```sql
-- Insert a test user
INSERT INTO users (email, password_hash, first_name, last_name, user_type)
VALUES (
    'test@example.com',
    '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash a password
    'Test',
    'User',
    'delegate'
) RETURNING id;

-- Insert delegate data (replace 'user-id-here' with the ID from above)
INSERT INTO delegates (id, qr_slug, claim_token, council, committee, status)
VALUES (
    'user-id-here',
    'NIMUN-2026-0001',
    'CLAIM-TEST1',
    'General Assembly',
    'DISEC',
    'unclaimed'
);
```

### Hash a Password (for testing)

You can use Node.js to hash a password:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(hash => console.log(hash))"
```

Or use an online bcrypt generator: https://bcrypt-generator.com/

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/claim/validate` - Validate claim token
- `POST /api/auth/claim/complete` - Complete account claiming
- `GET /api/auth/me` - Get current user (requires auth)

### Vouchers
- `GET /api/vouchers` - Get all vouchers (requires auth)
- `POST /api/vouchers/:id/claim` - Claim a voucher (requires auth)

### Rewards
- `POST /api/rewards/activate` - Activate reward (requires auth)
- `GET /api/rewards/verify/:token` - Verify reward QR token

### Dashboard
- `GET /api/dashboard/attendance` - Get attendance records (requires auth)
- `GET /api/dashboard/food` - Get food history (requires auth)
- `GET /api/dashboard/activity` - Get activity timeline (requires auth)

## Testing the API

### Test Login (after creating a delegate)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

### Test with Token

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Troubleshooting

### Backend Issues

1. **Database connection fails**
   - Check your Supabase URL and keys in `.env`
   - Verify the schema was run successfully
   - Check Supabase project is active

2. **JWT errors**
   - Make sure JWT_SECRET is set and strong
   - Check token expiration settings

3. **CORS errors**
   - Verify CORS_ORIGIN matches your frontend URL
   - Check backend is running on correct port

### Frontend Issues

1. **API calls fail**
   - Check VITE_API_URL in frontend `.env`
   - Verify backend is running
   - Check browser console for errors

2. **Authentication not working**
   - Clear localStorage: `localStorage.clear()`
   - Check token is being saved correctly
   - Verify JWT_SECRET matches between frontend/backend

## Next Steps

1. Create more test delegates in the database
2. Add vouchers to the `vouchers` table
3. Test the full flow: claim account → login → claim vouchers → activate rewards
4. Set up production environment variables
5. Deploy backend and frontend

## Production Deployment

### Backend
- Use environment variables for all secrets
- Set `NODE_ENV=production`
- Use a process manager (PM2, systemd, etc.)
- Set up proper CORS origins
- Use HTTPS

### Frontend
- Build: `npm run build`
- Deploy the `dist` folder to your hosting service
- Set production API URL in environment variables

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets in production
- Keep Supabase service role key secret
- Enable Row Level Security (RLS) policies in Supabase
- Use HTTPS in production
- Regularly rotate secrets

## Support

For issues or questions, check:
- Backend logs: Check console output
- Frontend logs: Check browser console
- Supabase logs: Check Supabase dashboard → Logs

