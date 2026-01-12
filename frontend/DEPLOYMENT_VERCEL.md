# Deploying Frontend to Vercel

## Prerequisites
- GitHub repository with your frontend code
- Vercel account (free tier available)

## Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository containing your frontend code

## Step 2: Configure Project

### Framework Presets:
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (if frontend is in a subdirectory)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables:
Add all required environment variables:

```env
# API URL (your Render backend)
VITE_API_URL=https://your-service-name.onrender.com/api

# Optional: Override API detection
# If not set, frontend will auto-detect from hostname
```

## Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Install dependencies
   - Build your application
   - Deploy to production
3. Your app will be available at: `https://your-project-name.vercel.app`

## Step 4: Update Backend CORS

Update your Render backend environment variable:
```env
CORS_ORIGIN=https://your-project-name.vercel.app
FRONTEND_URL=https://your-project-name.vercel.app
```

## Custom Domain (Recommended)

1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed
5. Update backend `CORS_ORIGIN` and `FRONTEND_URL` to match

## Environment Variables for Different Environments

### Production:
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Preview (for PRs):
Vercel automatically creates preview deployments. You can use the same backend or a staging backend.

## Important Notes

### Build Configuration:
- Vercel auto-detects Vite projects
- Ensure `vite.config.js` is properly configured
- Check build logs if deployment fails

### API URL Detection:
The frontend auto-detects API URL from hostname. For production, you may want to set `VITE_API_URL` explicitly.

### Image Assets:
- Place images in `public/` folder
- Reference as `/image.jpg` (not `./image.jpg`)
- Slideshow images should be in `public/slideshowimages/`

## Monitoring

- View deployment logs in Vercel dashboard
- Set up analytics (optional)
- Monitor build times and errors

## Troubleshooting

### Build fails:
- Check build logs for errors
- Verify all dependencies are in `package.json`
- Ensure Node version is compatible (Vercel uses Node 18+)

### API connection errors:
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend is running and accessible

### Images not loading:
- Verify images are in `public/` folder
- Check image paths in code
- Ensure file names match exactly (case-sensitive)
