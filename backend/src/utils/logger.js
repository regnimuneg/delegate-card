/**
 * Secure logging utility for production
 * Removes sensitive data and only logs in development
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Secure log - only logs in development, sanitizes sensitive data
 */
export function log(message, data = null) {
    if (isDevelopment) {
        if (data) {
            console.log(message, sanitizeData(data));
        } else {
            console.log(message);
        }
    }
}

/**
 * Secure error log - always logs errors but sanitizes sensitive data
 */
export function logError(message, error = null) {
    if (error) {
        const sanitizedError = {
            message: error.message || 'Unknown error',
            code: error.code,
            // Don't log stack traces in production
            stack: isDevelopment ? error.stack : undefined
        };
        console.error(message, sanitizedError);
    } else {
        console.error(message);
    }
}

/**
 * Sanitize data to remove sensitive information
 */
function sanitizeData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveKeys = ['password', 'password_hash', 'token', 'secret', 'api_key', 'email'];
    const sanitized = { ...data };

    for (const key in sanitized) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
}

/**
 * Log authentication attempts (sanitized)
 */
export function logAuth(message, data = null) {
    if (data) {
        const sanitized = { ...data };
        if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email);
        if (sanitized.password) sanitized.password = '***REDACTED***';
        log(message, sanitized);
    } else {
        log(message);
    }
}

/**
 * Sanitize email (show only first 3 chars and domain)
 */
function sanitizeEmail(email) {
    if (!email || !email.includes('@')) return '***REDACTED***';
    const [local, domain] = email.split('@');
    if (local.length <= 3) return '***@' + domain;
    return local.substring(0, 3) + '***@' + domain;
}
