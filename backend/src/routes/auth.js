import express from 'express';
import {
    getDelegateByEmail,
    getMemberByEmail,
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
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { log, logError, logAuth } from '../utils/logger.js';
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
                name: `${user.first_name} ${user.last_name}`,
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
                name: `${user.first_name} ${user.last_name}`,
                phoneNumber: user.phone_number,
                role: user.role,
                committee: user.committee,
                photo: user.photo_url
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
 * Validate a claim token (works for both delegates and members)
 */
router.post('/claim/validate', validateClaimToken, async (req, res, next) => {
    try {
        const { token } = req.body;

        // Import the new function that checks both tables
        const { getByClaimToken } = await import('../config/database.js');
        const result = await getByClaimToken(token);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Invalid claim token'
            });
        }

        const { type, data } = result;

        // Check if already claimed
        if (data.claim_token_used) {
            return res.status(400).json({
                success: false,
                error: 'This account has already been claimed'
            });
        }

        // Return user info based on type
        let userData;
        if (type === 'delegate') {
            userData = {
                id: data.id,
                userId: data.users.id,
                firstName: data.users.first_name,
                lastName: data.users.last_name,
                name: `${data.users.first_name} ${data.users.last_name}`,
                email: data.users.email,
                council: data.council
            };
        } else {
            // Member
            userData = {
                id: data.id,
                userId: data.users.id,
                firstName: data.users.first_name,
                lastName: data.users.last_name,
                name: `${data.users.first_name} ${data.users.last_name}`,
                email: data.users.email,
                committee: data.committee,
                role: data.role
            };
        }

        res.json({
            success: true,
            userType: type,
            delegate: userData // Keep 'delegate' key for backward compatibility
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/claim/complete
 * Complete account claiming with password (works for both delegates and members)
 */
router.post('/claim/complete', validateClaimAccount, async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Import the new function that checks both tables
        const { getByClaimToken } = await import('../config/database.js');
        const result = await getByClaimToken(token);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Invalid claim token'
            });
        }

        const { type, data } = result;

        // Check if already claimed
        if (data.claim_token_used) {
            return res.status(400).json({
                success: false,
                error: 'This account has already been claimed'
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Update the appropriate table
        const { supabaseAdmin } = await import('../db/supabase.js');

        if (type === 'delegate') {
            await updateDelegate(data.id, {
                status: 'active',
                claim_token_used: true
            });
        } else {
            // Update member
            const { error: memberUpdateError } = await supabaseAdmin
                .from('members')
                .update({ claim_token_used: true })
                .eq('id', data.id);
            if (memberUpdateError) throw memberUpdateError;
        }

        // Update user password
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', data.user_id);

        if (updateError) throw updateError;

        // Create activity entry
        await createActivityEntry(data.user_id, {
            activity_type: 'other',
            title: 'Account Claimed',
            description: 'Account successfully claimed and activated'
        });

        // Generate JWT token
        const jwtToken = generateToken({
            id: data.id,
            userId: data.user_id,
            email: data.users.email,
            userType: type,
            qrCode: type === 'delegate' ? data.qr_code : undefined
        });

        // Return user data based on type
        let userData;
        if (type === 'delegate') {
            userData = {
                id: data.id,
                userId: data.user_id,
                email: data.users.email,
                firstName: data.users.first_name,
                lastName: data.users.last_name,
                name: `${data.users.first_name} ${data.users.last_name}`,
                photo: data.users.photo_url,
                council: data.council,
                qrCode: data.qr_code,
                status: 'active'
            };
        } else {
            userData = {
                id: data.id,
                userId: data.user_id,
                email: data.users.email,
                firstName: data.users.first_name,
                lastName: data.users.last_name,
                name: `${data.users.first_name} ${data.users.last_name}`,
                photo: data.users.photo_url,
                committee: data.committee,
                role: data.role
            };
        }

        res.json({
            success: true,
            token: jwtToken,
            user: userData,
            userType: type
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
        const { getDelegateById, getMemberById } = await import('../config/database.js');

        // Check user type
        const userType = req.user.userType; // 'delegate', 'member', etc.

        let userData;

        if (userType === 'member') {
            const member = await getMemberById(req.user.id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            userData = {
                id: member.id, // Committee-based ID
                userId: member.user_id, // UUID
                email: member.users.email,
                firstName: member.users.first_name,
                lastName: member.users.last_name,
                name: `${member.users.first_name} ${member.users.last_name}`,
                phoneNumber: member.users.phone_number,
                role: member.role,
                committee: member.committee,
                photo: member.users.photo_url,
                status: 'active' // Members are always active if they can login
            };
        } else {
            // Default to delegate
            // req.user.id is the council-based ID (e.g., HRC-01)
            const delegate = await getDelegateById(req.user.id);

            if (!delegate) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            userData = {
                id: delegate.id, // Council-based ID
                userId: delegate.user_id, // UUID
                email: delegate.users.email,
                firstName: delegate.users.first_name,
                lastName: delegate.users.last_name,
                name: `${delegate.users.first_name} ${delegate.users.last_name}`,
                photo: delegate.users.photo_url,
                council: delegate.council,
                qrCode: delegate.qr_code,
                status: delegate.status
            };
        }

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
router.post('/password/reset/request', passwordResetLimiter, validatePasswordResetRequest, async (req, res, next) => {
    try {
        const { email } = req.body;

        console.log('🔑 Password reset requested for:', email);

        // For password reset, we just need to find the user by email
        // No need to filter by user_type - any registered user can reset their password
        const { supabaseAdmin } = await import('../db/supabase.js');

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (userError) {
            console.error('❌ Database error looking up user:', userError);
        }

        console.log('👤 User lookup result:', user ? `Found user ID: ${user.id}` : 'Not found');

        // Return error if email is not registered
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Email not registered. Please check your email address or contact support.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save reset token to database
        // Note: supabaseAdmin is already imported above

        // Invalidate any existing unused tokens for this user (optional - allows unlimited requests)
        // This ensures only the most recent reset link works
        await supabaseAdmin
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('user_id', user.user_id || user.id)
            .eq('used', false);

        // Insert new token
        const { error: insertError } = await supabaseAdmin
            .from('password_reset_tokens')
            .insert({
                user_id: user.user_id || user.id, // UUID
                token: resetToken,
                expires_at: expiresAt.toISOString()
            });

        if (insertError) {
            logError('Error creating reset token', insertError);
            return res.status(500).json({
                success: false,
                error: 'Failed to process password reset request'
            });
        }

        // Send email
        try {
            await sendPasswordResetEmail(
                user.email,
                resetToken,
                user.first_name || 'Delegate'
            );
            log('✅ Password reset email sent', { email: user.email });
        } catch (emailError) {
            logError('Error sending reset email', emailError);
            // Still return success to user (don't reveal email issues)
        }

        res.json({
            success: true,
            message: 'Password reset link has been sent to your email address.'
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

