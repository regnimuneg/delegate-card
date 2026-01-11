import { verifyToken, extractTokenFromHeader } from '../utils/auth.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req, res, next) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(req, res, next) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }
        next();
    } catch (error) {
        next();
    }
}

