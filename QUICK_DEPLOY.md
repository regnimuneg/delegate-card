# Quick Deployment Reference

## Platform Setup

✅ **Supabase** (Database) - Already configured
✅ **Render** (Backend API) - Deploy here
✅ **Vercel** (Frontend) - Deploy here

## Quick Start

### 1. Render (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build: `npm install`
   - Start: `npm start`
   - Root: `backend`
5. Add all env vars (see below)
6. Deploy

**Backend URL**: `https://your-service.onrender.com`

### 2. Vercel (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Add New → Project
3. Import GitHub repo
4. Settings:
   - Framework: Vite
   - Root: `frontend`
   - Build: `npm run build`
5. Add env var: `VITE_API_URL=https://your-service.onrender.com/api`
6. Deploy

**Frontend URL**: `https://your-project.vercel.app`

## Environment Variables

### Render (Backend) - Required:
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<32+ chars>
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
CORS_ORIGIN=https://your-project.vercel.app
FRONTEND_URL=https://your-project.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=reg.nimun.eg@gmail.com
SMTP_PASSWORD=<app-password>
```

### Vercel (Frontend) - Required:
```env
VITE_API_URL=https://your-service.onrender.com/api
```

## After Deployment

1. ✅ Test: `https://your-service.onrender.com/health`
2. ✅ Test: `https://your-project.vercel.app`
3. ✅ Update backend `CORS_ORIGIN` with Vercel URL
4. ✅ Test login flow
5. ✅ Test password reset

## Custom Domains (Optional)

- **Backend**: `api.yourdomain.com` (Render)
- **Frontend**: `app.yourdomain.com` (Vercel)
- Update `CORS_ORIGIN` and `FRONTEND_URL` accordingly

## Full Guides

- **Backend**: See `backend/DEPLOYMENT_RENDER.md`
- **Frontend**: See `frontend/DEPLOYMENT_VERCEL.md`
- **Complete**: See `DEPLOYMENT_GUIDE.md`
