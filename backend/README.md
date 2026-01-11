# NIMUN Card Backend API

Backend API for the NIMUN Delegate Card System, built with Node.js, Express, and Supabase (PostgreSQL).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- `JWT_SECRET` - Secret key for JWT token signing (use a strong random string)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

### 3. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `src/db/schema.sql` in your Supabase SQL Editor
3. This will create all necessary tables, indexes, and RLS policies

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/claim/validate` - Validate a claim token
- `POST /api/auth/claim/complete` - Complete account claiming
- `GET /api/auth/me` - Get current user info (requires auth)

### Vouchers

- `GET /api/vouchers` - Get all vouchers for delegate (requires auth)
- `POST /api/vouchers/:id/claim` - Claim a voucher (requires auth)

### Rewards

- `POST /api/rewards/activate` - Activate a reward (generate QR) (requires auth)
- `GET /api/rewards/verify/:token` - Verify a reward QR token

### Dashboard

- `GET /api/dashboard/attendance` - Get attendance records (requires auth)
- `GET /api/dashboard/food` - Get food history (requires auth)
- `GET /api/dashboard/activity` - Get activity timeline (requires auth)

## Database Schema

The database schema is designed to be shared with the Delegate Tracking System. Key tables:

- `users` - Base user information (delegates and members)
- `delegates` - Delegate-specific data (councils, QR slugs, claim tokens)
- `members` - Member-specific data (committees, roles)
- `vouchers` - Available vouchers
- `voucher_claims` - Voucher redemption records
- `attendance_records` - Session attendance tracking
- `food_history` - Meal redemption history
- `activity_timeline` - User activity feed
- `reward_activations` - Dynamic reward QR codes

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Security Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- Claim tokens are one-time use and marked as used after account claiming
- JWT tokens expire after 7 days (configurable)
- Row Level Security (RLS) is enabled on all tables in Supabase

## Development

The backend uses ES modules. Make sure your `package.json` has `"type": "module"`.

For development with auto-reload, use:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Consider using a process manager like PM2

