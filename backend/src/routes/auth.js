import express from 'express';
import {
    getDelegateByEmail,
    getDelegateByClaimToken,
    updateDelegate,
    createActivityEntry
} from '../config/database.js';
import {
    hashPassword,
    comparePassword,
    generateToken,
    generateClaimToken,
    generateQRSlug
} from '../utils/auth.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
    validateLogin,
    validateClaimToken,
    validateClaimAccount
} from '../middleware/validator.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', validateLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Get delegate by email
        const delegate = await getDelegateByEmail(email);

        if (!delegate) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if account is claimed
        if (delegate.status === 'unclaimed') {
            return res.status(401).json({
                success: false,
                error: 'Account not yet claimed. Please use your claim token first.'
            });
        }

        // Verify password
        const passwordMatch = await comparePassword(password, delegate.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        // Note: This would require updating the users table
        // For now, we'll just generate the token

        // Generate JWT token
        const token = generateToken({
            id: delegate.id,
            email: delegate.email,
            userType: 'delegate',
            qrSlug: delegate.qr_slug
        });

        // Return user data (without sensitive info)
        const userData = {
            id: delegate.id,
            email: delegate.email,
            firstName: delegate.first_name,
            lastName: delegate.last_name,
            dateOfBirth: delegate.date_of_birth,
            photo: delegate.photo_url,
            committee: delegate.committee,
            council: delegate.council,
            qrSlug: delegate.qr_slug,
            sessionsAttended: delegate.sessions_attended || 0,
            daysAttended: delegate.days_attended || 0,
            awards: delegate.awards || 0
        };

        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/claim/validate
 * Validate a claim token
 */
router.post('/claim/validate', validateClaimToken, async (req, res, next) => {
    try {
        const { token } = req.body;

        const delegate = await getDelegateByClaimToken(token);

        if (!delegate) {
            return res.status(404).json({
                success: false,
                error: 'Invalid claim token'
            });
        }

        if (delegate.status === 'active') {
            return res.status(400).json({
                success: false,
                error: 'This account has already been claimed'
            });
        }

        // Return delegate info (without sensitive data)
        const delegateData = {
            id: delegate.users.id,
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            email: delegate.users.email,
            committee: delegate.committee,
            council: delegate.council
        };

        res.json({
            success: true,
            delegate: delegateData
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/claim/complete
 * Complete account claiming with password
 */
router.post('/claim/complete', validateClaimAccount, async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const delegate = await getDelegateByClaimToken(token);

        if (!delegate) {
            return res.status(404).json({
                success: false,
                error: 'Invalid claim token'
            });
        }

        if (delegate.status === 'active') {
            return res.status(400).json({
                success: false,
                error: 'This account has already been claimed'
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Update delegate
        await updateDelegate(delegate.id, {
            status: 'active',
            claim_token_used: true
        });

        // Update user password
        // Note: This requires updating the users table
        // For Supabase, you might need to use the admin client
        const { supabaseAdmin } = await import('../db/supabase.js');
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', delegate.id);

        if (updateError) throw updateError;

        // Create activity entry
        await createActivityEntry(delegate.id, {
            activity_type: 'other',
            title: 'Account Claimed',
            description: 'Account successfully claimed and activated'
        });

        // Generate JWT token
        const jwtToken = generateToken({
            id: delegate.id,
            email: delegate.users.email,
            userType: 'delegate',
            qrSlug: delegate.qr_slug
        });

        // Return user data
        const userData = {
            id: delegate.id,
            email: delegate.users.email,
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            dateOfBirth: delegate.users.date_of_birth,
            photo: delegate.users.photo_url,
            committee: delegate.committee,
            council: delegate.council,
            qrSlug: delegate.qr_slug,
            sessionsAttended: delegate.sessions_attended || 0,
            daysAttended: delegate.days_attended || 0,
            awards: delegate.awards || 0
        };

        res.json({
            success: true,
            token: jwtToken,
            user: userData
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const { getDelegateById } = await import('../config/database.js');
        const delegate = await getDelegateById(req.user.id);

        if (!delegate) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userData = {
            id: delegate.id,
            email: delegate.users.email,
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            dateOfBirth: delegate.users.date_of_birth,
            photo: delegate.users.photo_url,
            committee: delegate.committee,
            council: delegate.council,
            qrSlug: delegate.qr_slug,
            sessionsAttended: delegate.sessions_attended || 0,
            daysAttended: delegate.days_attended || 0,
            awards: delegate.awards || 0
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        next(error);
    }
});

export default router;

