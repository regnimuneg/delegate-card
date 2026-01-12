# Production Security Checklist

## ✅ Security Measures Implemented

### 1. Security Headers (Helmet.js)
- Added helmet.js to set secure HTTP headers
- Prevents XSS, clickjacking, and other attacks

### 2. Rate Limiting
- Added express-rate-limit to prevent brute force attacks
- **Optimized for conference scenarios (~200 concurrent users)**
- Login endpoint: 300 attempts per 15 minutes per IP (configurable via LOGIN_RATE_LIMIT)
- Password reset: 3 attempts per hour per IP (configurable via PASSWORD_RESET_RATE_LIMIT)
- General API: 2000 requests per 15 minutes per IP (configurable via API_RATE_LIMIT)
- **Note**: Limits are per IP, so users on the same network share the limit

### 3. CORS Configuration
- Production: Only allows specific origins from CORS_ORIGIN env var
- Development: Allows all origins (for mobile testing)
- Credentials enabled for authenticated requests

### 4. JWT Secret Validation
- Requires JWT_SECRET to be at least 32 characters in production
- Fails to start if JWT_SECRET is missing or weak

### 5. Environment Variable Validation
- Validates all required environment variables on startup
- Fails fast if critical variables are missing

### 6. Secure Logging
- Removed sensitive data from console.log statements
- Production logs only show necessary information
- Error messages don't expose sensitive details

### 7. Error Handling
- Generic error messages for users
- Detailed errors only logged server-side
- No stack traces exposed to clients

### 8. Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role required for admin operations

### 9. Password Security
- Bcrypt with 10 salt rounds
- Minimum 6 character password requirement
- Password reset tokens expire in 1 hour

### 10. Input Validation
- express-validator on all endpoints
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization

## Required Environment Variables

```env
# Required
NODE_ENV=production
JWT_SECRET=<at least 32 characters>
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>

# Required for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reg.nimun.eg@gmail.com
SMTP_PASSWORD=<your app password>
FRONTEND_URL=https://your-frontend-domain.com

# Required for production CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
PORT=3000
JWT_EXPIRES_IN=7d

# Rate Limiting (Optional - defaults are optimized for ~200 concurrent users)
# Adjust if you have more/fewer concurrent users
API_RATE_LIMIT=2000          # General API requests per 15 minutes per IP
LOGIN_RATE_LIMIT=300         # Login attempts per 15 minutes per IP
PASSWORD_RESET_RATE_LIMIT=3  # Password reset attempts per hour per IP
```

## Conference Scenario Considerations

**Important**: With ~200 concurrent users, many will share the same IP address (conference Wi-Fi). The default rate limits are optimized for this scenario:

- **Login**: 300 attempts per 15 minutes per IP
  - Allows ~1.5 login attempts per user (with retries)
  - Successful logins don't count (skipSuccessfulRequests: true)
  
- **General API**: 2000 requests per 15 minutes per IP
  - Allows ~10 requests per user average
  - Covers normal dashboard usage, voucher claims, etc.

**If you need higher limits**, adjust via environment variables:
```env
LOGIN_RATE_LIMIT=500        # Increase for more concurrent users
API_RATE_LIMIT=5000         # Increase for heavy API usage
```

**For distributed deployments** (multiple servers), consider using Redis-based rate limiting:
```javascript
import RedisStore from 'rate-limit-redis';
// Configure rate limiter with Redis store for shared state
```

## Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set CORS_ORIGIN to your frontend domain
- [ ] Set FRONTEND_URL to your frontend domain
- [ ] Configure SMTP credentials
- [ ] Verify all Supabase keys are correct
- [ ] Run database migrations (schema.sql)
- [ ] Test password reset functionality
- [ ] Verify RLS policies are active
- [ ] Set up HTTPS (required for production)
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review and test all API endpoints
- [ ] Remove any test/debug code

## Security Best Practices

1. **Never commit .env files** - Use environment variables in your hosting platform
2. **Use HTTPS** - All traffic must be encrypted
3. **Regular updates** - Keep dependencies updated
4. **Monitor logs** - Watch for suspicious activity
5. **Backup database** - Regular automated backups
6. **Limit access** - Only necessary personnel should have access
7. **Review logs** - Regularly review access logs
8. **Test security** - Regular security audits
