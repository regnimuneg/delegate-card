import express from 'express';
import {
    getVouchersForUser,
    getVouchersForDelegate,
    createVoucherClaim,
    createActivityEntry
} from '../config/database.js';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { validateVoucherClaim } from '../middleware/validator.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * GET /api/vouchers
 * Get all vouchers for the authenticated user (delegate or member)
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const vouchers = await getVouchersForUser(req.user.id, req.user.userType);

        res.json({
            success: true,
            vouchers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/vouchers/:id/claim
 * Claim a voucher
 */
router.post('/:id/claim', authenticate, validateVoucherClaim, async (req, res, next) => {
    try {
        const { id: voucherId } = req.params;
        const userId = req.user.id;
        const userType = req.user.userType || 'delegate';

        console.log('🎫 Claim request:', { voucherId, userId, userType, user: req.user });

        // Get vouchers to check if this one exists and is claimable
        const vouchers = await getVouchersForUser(userId, userType);
        const voucher = vouchers.find(v => v.id === voucherId);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                error: 'Voucher not found'
            });
        }

        // Check for existing active claim (MULTI-DEVICE PREVENTION)
        const queryColumn = userType === 'member' ? 'member_id' : 'delegate_id';
        const { data: existingClaim } = await supabaseAdmin
            .from('voucher_claims')
            .select('*')
            .eq(queryColumn, userId)
            .eq('voucher_id', voucherId)
            .eq('status', 'active')
            .gt('qr_expires_at', new Date().toISOString())
            .maybeSingle();

        if (existingClaim) {
            console.log('✅ Returning existing active claim:', existingClaim.id);
            // Return existing claim instead of creating a new one
            return res.json({
                success: true,
                claim: {
                    id: existingClaim.id,
                    voucherId: existingClaim.voucher_id,
                    qrToken: existingClaim.qr_token,
                    expiresAt: existingClaim.qr_expires_at,
                    status: existingClaim.status,
                    staticCode: voucher.static_code || null
                },
                message: 'Voucher already activated on another device'
            });
        }

        if (!voucher.canClaim) {
            return res.status(400).json({
                success: false,
                error: 'Voucher limit reached or not available'
            });
        }

        // CRITICAL: Double-check usage limit at database level (race condition protection)
        if (voucher.usage_limit !== null) {
            const { data: allUserClaims, error: countError } = await supabaseAdmin
                .from('voucher_claims')
                .select('id')
                .eq(queryColumn, userId)
                .eq('voucher_id', voucherId);

            if (countError) {
                console.error('❌ Error counting claims:', countError);
                throw countError;
            }

            const claimCount = allUserClaims?.length || 0;

            if (claimCount >= voucher.usage_limit) {
                console.log(`❌ Usage limit exceeded: ${claimCount}/${voucher.usage_limit}`);
                return res.status(400).json({
                    success: false,
                    error: 'You have already used this voucher the maximum number of times'
                });
            }
        }

        // Generate QR token
        let qrToken;
        if (voucher.static_code) {
            qrToken = voucher.static_code;
        } else {
            qrToken = crypto.randomBytes(32).toString('hex');
        }

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes - Voucher stays valid for this period

        // Create voucher claim
        const claim = await createVoucherClaim(
            userId,
            voucherId,
            qrToken,
            expiresAt,
            userType
        );

        // Create activity entry (use userId from JWT)
        await createActivityEntry(req.user.userId, {
            activity_type: 'voucher',
            title: `Voucher Claimed: ${voucher.name}`,
            description: voucher.description || '',
            metadata: {
                voucher_id: voucherId,
                voucher_name: voucher.name
            }
        });

        res.json({
            success: true,
            claim: {
                id: claim.id,
                voucherId: claim.voucher_id,
                qrToken: claim.qr_token,
                expiresAt: claim.qr_expires_at,
                status: claim.status,
                staticCode: voucher.static_code || null
            }
        });
    } catch (error) {
        console.error('❌ Claim error:', error);
        next(error);
    }
});

export default router;
