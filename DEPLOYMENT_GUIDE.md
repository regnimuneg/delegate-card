# Complete Deployment Guide
## Supabase (Database) + Render (Backend) + Vercel (Frontend)

This guide covers deploying the NIMUN Card system across three platforms.

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Vercel    │─────▶│    Render    │─────▶│  Supabase  │
│  (Frontend) │      │   (Backend)  │      │  (Database) │
└─────────────┘      └──────────────┘      └─────────────┘
```

## Deployment Steps

### 1. Supabase (Database) ✅ Already Set Up

Your database is already on Supabase. Just ensure:
- [ ] Schema is deployed (`backend/src/db/schema.sql`)
- [ ] RLS policies are active
- [ ] Environment variables are ready

### 2. Render (Backend API)

See `backend/DEPLOYMENT_RENDER.md` for detailed instructions.

**Quick Steps:**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

**Backend URL**: `https://your-service-name.onrender.com`

### 3. Vercel (Frontend)

See `frontend/DEPLOYMENT_VERCEL.md` for detailed instructions.

**Quick Steps:**
1. Push code to GitHub
2. Import project to Vercel
3. Configure as Vite project
4. Set environment variables
5. Deploy

**Frontend URL**: `https://your-project-name.vercel.app`

## Environment Variables Summary

### Supabase (Already Configured)
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### Render (Backend) - Set in Render Dashboard

```env
NODE_ENV=production
PORT=10000

# JWT
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# Supabase (same as above)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_ROLE_KEY=<your-key>

# CORS (your Vercel URL)
CORS_ORIGIN=https://your-project-name.vercel.app

# Frontend URL
FRONTEND_URL=https://your-project-name.vercel.app

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reg.nimun.eg@gmail.com
SMTP_PASSWORD=<your-app-password>

# Rate Limiting (optional)
API_RATE_LIMIT=2000
LOGIN_RATE_LIMIT=300
PASSWORD_RESET_RATE_LIMIT=3
```

### Vercel (Frontend) - Set in Vercel Dashboard

```env
VITE_API_URL=https://your-service-name.onrender.com/api
```

## Deployment Checklist

### Pre-Deployment:
- [ ] All code pushed to GitHub
- [ ] Database schema deployed to Supabase
- [ ] Tested locally with production-like config
- [ ] Generated strong JWT_SECRET

### Render (Backend):
- [ ] Service created and connected to GitHub
- [ ] All environment variables set
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Service is running and healthy
- [ ] Test `/health` endpoint

### Vercel (Frontend):
- [ ] Project imported from GitHub
- [ ] Framework preset: Vite
- [ ] Environment variables set
- [ ] Build successful
- [ ] Frontend accessible

### Post-Deployment:
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test voucher claiming
- [ ] Verify CORS is working
- [ ] Check all API endpoints
- [ ] Test on mobile devices
- [ ] Set up custom domains (optional)

## Testing After Deployment

### 1. Health Checks:
```bash
# Backend
curl https://your-service-name.onrender.com/health

# Database
curl https://your-service-name.onrender.com/health/db
```

### 2. Test Login:
- Go to your Vercel frontend URL
- Try logging in with test credentials
- Verify JWT token is received

### 3. Test API:
```bash
# Login
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Custom Domains Setup

### Backend (Render):
1. Go to service settings → Custom Domains
2. Add domain: `api.yourdomain.com`
3. Update DNS as instructed
4. Update `CORS_ORIGIN` and `FRONTEND_URL` in Render env vars

### Frontend (Vercel):
1. Go to project settings → Domains
2. Add domain: `app.yourdomain.com` or `yourdomain.com`
3. Update DNS as instructed
4. Update `CORS_ORIGIN` in Render backend env vars

## Cost Estimate

### Free Tier (All Platforms):
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Render**: Free tier (services spin down after inactivity)
- **Vercel**: Free tier (unlimited bandwidth, 100GB)

### For Production (Recommended):
- **Supabase**: Pro plan ($25/month) for better performance
- **Render**: Starter plan ($7/month) to keep service always on
- **Vercel**: Free tier is usually sufficient

## Troubleshooting

### Backend won't start:
- Check Render logs
- Verify all environment variables
- Ensure `package.json` has correct scripts

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend is running (not spun down)

### Database connection errors:
- Verify Supabase credentials
- Check if Supabase project is active
- Ensure RLS policies allow service role access

### CORS errors:
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check for trailing slashes
- Ensure credentials are enabled

## Monitoring

### Render:
- View logs in dashboard
- Set up alerts
- Monitor response times

### Vercel:
- View deployment logs
- Check analytics
- Monitor build times

### Supabase:
- View database logs
- Monitor query performance
- Check RLS policy violations

## Security Reminders

1. ✅ Never commit `.env` files
2. ✅ Use strong JWT_SECRET (32+ characters)
3. ✅ Enable HTTPS (automatic on all platforms)
4. ✅ Keep dependencies updated
5. ✅ Monitor logs for suspicious activity
6. ✅ Regular backups (Supabase has automatic backups)

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
