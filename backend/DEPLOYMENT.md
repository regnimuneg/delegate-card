# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.production.example` to `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (32+ characters): `openssl rand -base64 32`
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Set `FRONTEND_URL` to your frontend domain
- [ ] Configure all Supabase keys
- [ ] Configure SMTP credentials

### 2. Database Setup
- [ ] Run `schema.sql` in Supabase SQL Editor
- [ ] Verify RLS policies are active
- [ ] Test database connection
- [ ] Import initial data (if needed)

### 3. Security Verification
- [ ] Verify JWT_SECRET is strong (32+ chars)
- [ ] Verify CORS_ORIGIN is set correctly
- [ ] Test rate limiting
- [ ] Verify HTTPS is enabled
- [ ] Test password reset functionality

### 4. Build & Test
- [ ] Run `npm install` in backend
- [ ] Test all API endpoints
- [ ] Verify error handling
- [ ] Test authentication flow
- [ ] Test password reset

## Deployment Steps

### Option 1: Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name nimun-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 2: Using systemd

Create `/etc/systemd/system/nimun-api.service`:

```ini
[Unit]
Description=NIMUN Card API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable nimun-api
sudo systemctl start nimun-api
```

### Option 3: Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

Build and run:
```bash
docker build -t nimun-api .
docker run -d -p 3000:3000 --env-file .env nimun-api
```

## Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Health Checks
- `GET /health` - Basic health check
- `GET /health/db` - Database connection check

### Logs
- Application logs: Check PM2 logs or systemd journal
- Error logs: Monitor for security issues
- Access logs: Review for suspicious activity

## Security Reminders

1. **Never commit .env files**
2. **Use HTTPS in production**
3. **Keep dependencies updated**: `npm audit`
4. **Monitor logs regularly**
5. **Backup database regularly**
6. **Review access logs for anomalies**
7. **Keep JWT_SECRET secure and rotate periodically**

## Troubleshooting

### Server won't start
- Check environment variables are set
- Verify database connection
- Check JWT_SECRET is valid

### Rate limiting issues
- Adjust limits in `rateLimiter.js` if needed
- Check if legitimate users are being blocked

### CORS errors
- Verify CORS_ORIGIN matches frontend domain exactly
- Check if frontend is using correct API URL
