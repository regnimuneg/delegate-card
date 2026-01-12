import express from 'express';
import {
    getDelegateByEmail,
    getMemberByEmail,
    getAdminByEmail,
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
    validateClaimAccount,
    validatePasswordResetRequest,
    validatePasswordReset
} from '../middleware/validator.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', validateLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', { email: email?.toLowerCase() });

        // Try to get delegate first
        let user = await getDelegateByEmail(email);
        let userType = 'delegate';
        
        console.log('👤 Delegate lookup result:', user ? 'Found' : 'Not found');

        // If not a delegate, try member
        if (!user) {
            user = await getMemberByEmail(email);
            userType = 'member';
            console.log('👤 Member lookup result:', user ? 'Found' : 'Not found');
        }

        // If not a member, try admin
        if (!user) {
            user = await getAdminByEmail(email);
            userType = 'admin';
            console.log('👤 Admin lookup result:', user ? 'Found' : 'Not found');
        }

        // If still not found, invalid credentials
        if (!user) {
            console.log('❌ User not found for email:', email?.toLowerCase());
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        console.log('✅ User found:', { id: user.id, userType, email: user.email });

        // Check if delegate account is claimed (members don't have this status)
        if (userType === 'delegate' && user.status === 'unclaimed') {
            return res.status(401).json({
                success: false,
                error: 'Account not yet claimed. Please use your claim token first.'
            });
        }

        // Verify password
        console.log('🔑 Verifying password...');
        const passwordMatch = await comparePassword(password, user.password_hash);
        console.log('🔑 Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ Password mismatch for user:', user.email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        console.log('✅ Password verified successfully');

        // Generate JWT token
        // Note: For delegates/members, user.id is the council/committee ID (HRC-01, EX-05, etc.)
        // For admins, user.id is the UUID from users table
        const token = generateToken({
            id: userType === 'admin' ? user.id : user.id, // UUID for admin, council/committee ID for others
            userId: user.user_id || user.id, // UUID from users table
            email: user.email,
            userType: userType
        });

        // Return user data based on type
        let userData;
        if (userType === 'delegate') {
            userData = {
                id: user.id, // Council-based ID (e.g., HRC-01)
                userId: user.user_id, // UUID
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                name: user.name,
                dateOfBirth: user.date_of_birth,
                photo: user.photo_url,
                council: user.council,
                qrCode: user.qr_code,
                status: user.status
            };
        } else if (userType === 'member') {
            // Member
            userData = {
                id: user.id, // Committee-based ID (e.g., EX-05)
                userId: user.user_id, // UUID
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                name: user.name,
                phoneNumber: user.phone_number,
                role: user.role,
                committee: user.committee
            };
        } else {
            // Admin
            userData = {
                id: user.id, // UUID
                userId: user.id, // UUID (same as id for admins)
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: 'admin'
            };
        }

        res.json({
            success: true,
            token,
            user: userData,
            userType
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
            id: delegate.id, // Council-based ID
            userId: delegate.users.id, // UUID
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            name: delegate.name,
            email: delegate.users.email,
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
        const { supabaseAdmin } = await import('../db/supabase.js');
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', delegate.user_id); // Use user_id, not delegate.id

        if (updateError) throw updateError;

        // Create activity entry
        await createActivityEntry(delegate.user_id, { // Use user_id for activity timeline
            activity_type: 'other',
            title: 'Account Claimed',
            description: 'Account successfully claimed and activated'
        });

        // Generate JWT token
        const jwtToken = generateToken({
            id: delegate.id, // Council-based ID
            userId: delegate.user_id, // UUID
            email: delegate.users.email,
            userType: 'delegate',
            qrCode: delegate.qr_code
        });

        // Return user data
        const userData = {
            id: delegate.id, // Council-based ID
            userId: delegate.user_id, // UUID
            email: delegate.users.email,
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            name: delegate.name,
            dateOfBirth: delegate.users.date_of_birth,
            photo: delegate.users.photo_url,
            council: delegate.council,
            qrCode: delegate.qr_code,
            status: delegate.status
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
        // req.user.id is the council-based ID (e.g., HRC-01)
        const delegate = await getDelegateById(req.user.id);

        if (!delegate) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userData = {
            id: delegate.id, // Council-based ID
            userId: delegate.user_id, // UUID
            email: delegate.users.email,
            firstName: delegate.users.first_name,
            lastName: delegate.users.last_name,
            name: delegate.name,
            dateOfBirth: delegate.users.date_of_birth,
            photo: delegate.users.photo_url,
            council: delegate.council,
            qrCode: delegate.qr_code,
            status: delegate.status
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/password/reset/request
 * Request password reset - sends email with reset token
 */
router.post('/password/reset/request', validatePasswordResetRequest, async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user by email (check delegates, members, admins)
        let user = await getDelegateByEmail(email);
        let userType = 'delegate';
        
        if (!user) {
            user = await getMemberByEmail(email);
            userType = 'member';
        }
        
        if (!user) {
            user = await getAdminByEmail(email);
            userType = 'admin';
        }

        // Always return success (don't reveal if email exists)
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save reset token to database
        const { supabaseAdmin } = await import('../db/supabase.js');
        const { error: insertError } = await supabaseAdmin
            .from('password_reset_tokens')
            .insert({
                user_id: user.user_id || user.id, // UUID
                token: resetToken,
                expires_at: expiresAt.toISOString()
            });

        if (insertError) {
            console.error('Error creating reset token:', insertError);
            return res.status(500).json({
                success: false,
                error: 'Failed to create reset token'
            });
        }

        // Send email
        try {
            await sendPasswordResetEmail(
                user.email,
                resetToken,
                user.first_name || 'Delegate'
            );
        } catch (emailError) {
            console.error('Error sending reset email:', emailError);
            // Still return success to user (don't reveal email issues)
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/password/reset/verify
 * Verify password reset token
 */
router.post('/password/reset/verify', async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Reset token is required'
            });
        }

        const { supabaseAdmin } = await import('../db/supabase.js');
        
        // Find token
        const { data: resetToken, error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('*, users(*)')
            .eq('token', token)
            .eq('used', false)
            .single();

        if (tokenError || !resetToken) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Check if token is expired
        const now = new Date();
        const expiresAt = new Date(resetToken.expires_at);
        
        if (now > expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Reset token has expired'
            });
        }

        res.json({
            success: true,
            message: 'Reset token is valid'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/password/reset
 * Reset password with token
 */
router.post('/password/reset', validatePasswordReset, async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const { supabaseAdmin } = await import('../db/supabase.js');
        
        // Find token
        const { data: resetToken, error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('*, users(*)')
            .eq('token', token)
            .eq('used', false)
            .single();

        if (tokenError || !resetToken) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Check if token is expired
        const now = new Date();
        const expiresAt = new Date(resetToken.expires_at);
        
        if (now > expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Reset token has expired'
            });
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update user password
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', resetToken.user_id);

        if (updateError) {
            throw updateError;
        }

        // Mark token as used
        await supabaseAdmin
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('id', resetToken.id);

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;

