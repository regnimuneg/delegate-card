import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Rate limit configuration - can be overridden via environment variables
// These are optimized for conference scenarios with ~200 concurrent users
// Many users may share the same IP address (conference Wi-Fi)
const API_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT) || (isDevelopment ? 1000 : 2000);
const LOGIN_RATE_LIMIT = parseInt(process.env.LOGIN_RATE_LIMIT) || (isDevelopment ? 100 : 300);
const PASSWORD_RESET_RATE_LIMIT = parseInt(process.env.PASSWORD_RESET_RATE_LIMIT) || (isDevelopment ? 10 : 3);

/**
 * General API rate limiter
 * Optimized for conference with ~200 concurrent users
 * Many users may share the same IP (conference Wi-Fi)
 * 2000 requests per 15 minutes per IP (allows ~10 requests per user)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: API_RATE_LIMIT, // Configurable via API_RATE_LIMIT env var
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Login rate limiter - prevent brute force attacks
 * Optimized for conference with ~200 concurrent users
 * Many users may share the same IP (conference Wi-Fi)
 * 300 attempts per 15 minutes per IP (allows ~1.5 attempts per user + retries)
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: LOGIN_RATE_LIMIT, // Configurable via LOGIN_RATE_LIMIT env var
    message: {
        success: false,
        error: 'Too many login attempts, please try again later.'
    },
    skipSuccessfulRequests: true, // Don't count successful logins
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * 3 attempts per hour
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: PASSWORD_RESET_RATE_LIMIT, // Configurable via PASSWORD_RESET_RATE_LIMIT env var
    message: {
        success: false,
        error: 'Too many password reset attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
