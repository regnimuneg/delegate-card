# Deploying Backend to Render

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)

## Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your backend code

## Step 2: Configure Service

### Basic Settings:
- **Name**: `nimun-card-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: `backend` (if backend is in a subdirectory)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables:
Add all required environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000

# JWT Configuration
JWT_SECRET=<generate-strong-secret-32-chars>
JWT_EXPIRES_IN=7d

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# CORS Configuration
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Frontend URL
FRONTEND_URL=https://your-vercel-app.vercel.app

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reg.nimun.eg@gmail.com
SMTP_PASSWORD=<your-gmail-app-password>

# Rate Limiting (Optional)
API_RATE_LIMIT=2000
LOGIN_RATE_LIMIT=300
PASSWORD_RESET_RATE_LIMIT=3
```

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build your application
   - Start the server
3. Your API will be available at: `https://your-service-name.onrender.com`

## Step 4: Update Frontend Configuration

Update your frontend `.env` or Vercel environment variables:
```env
VITE_API_URL=https://your-service-name.onrender.com/api
```

## Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Consider upgrading to paid plan for production

### Health Checks:
- Render automatically pings your service
- Ensure `/health` endpoint responds quickly
- Consider adding a cron job to keep service warm (optional)

### Custom Domain (Optional):
1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

## Monitoring

- View logs in Render dashboard
- Set up alerts for service failures
- Monitor response times

## Troubleshooting

### Service won't start:
- Check build logs for errors
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script

### Database connection errors:
- Verify Supabase URL and keys
- Check if Supabase project is active
- Ensure RLS policies are configured

### CORS errors:
- Verify `CORS_ORIGIN` matches your Vercel domain exactly
- Check if frontend is using correct API URL
