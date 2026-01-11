/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Supabase errors
    if (err.code && err.code.startsWith('PGRST')) {
        return res.status(400).json({
            success: false,
            error: 'Database error',
            message: err.message
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
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

