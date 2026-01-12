import { logError } from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Error handling middleware
 * Never exposes sensitive information to clients
 */
export function errorHandler(err, req, res, next) {
    // Log error with full details (server-side only)
    logError('Request error', {
        path: req.path,
        method: req.method,
        error: err
    });

    // Supabase errors - don't expose details
    if (err.code && err.code.startsWith('PGRST')) {
        return res.status(400).json({
            success: false,
            error: 'Database error occurred'
        });
    }

    // Validation errors - safe to expose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message || 'Validation error'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    // Default error - generic message in production
    const status = err.status || 500;
    const message = isProduction 
        ? 'An error occurred processing your request'
        : (err.message || 'Internal server error');

    res.status(status).json({
        success: false,
        error: message
    });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
}

