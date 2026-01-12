import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Validate JWT_SECRET in production
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;

if (isProduction) {
    if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET is required in production!');
        process.exit(1);
    }
    if (JWT_SECRET.length < 32) {
        console.error('❌ JWT_SECRET must be at least 32 characters long!');
        process.exit(1);
    }
    if (JWT_SECRET === 'change-this-in-production') {
        console.error('❌ JWT_SECRET must be changed from default value!');
        process.exit(1);
    }
}

const finalJWTSecret = JWT_SECRET || 'change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload) {
    return jwt.sign(payload, finalJWTSecret, {
        expiresIn: JWT_EXPIRES_IN
    });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, finalJWTSecret);
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Generate claim token (format: CLAIM-XXXXXX)
 */
export function generateClaimToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    return `CLAIM-${randomPart}`;
}

/**
 * Generate QR slug (format: NIMUN-2026-XXX)
 */
export function generateQRSlug() {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `NIMUN-2026-${randomPart}`;
}

