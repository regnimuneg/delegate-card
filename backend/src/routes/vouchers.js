import express from 'express';
import {
    getVouchersForDelegate,
    createVoucherClaim,
    createActivityEntry
} from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateVoucherClaim } from '../middleware/validator.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * GET /api/vouchers
 * Get all vouchers for the authenticated delegate
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const vouchers = await getVouchersForDelegate(req.user.id);

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
        const delegateId = req.user.id;
        
        // Get vouchers to check if this one exists and is claimable
        const vouchers = await getVouchersForDelegate(delegateId);
        const voucher = vouchers.find(v => v.id === voucherId);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                error: 'Voucher not found'
            });
        }

        if (!voucher.canClaim) {
            return res.status(400).json({
                success: false,
                error: 'Voucher limit reached or not available'
            });
        }

        // Generate QR token
        const qrToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create voucher claim
        const claim = await createVoucherClaim(
            delegateId,
            voucherId,
            qrToken,
            expiresAt
        );

        // Create activity entry (use userId from JWT, not delegateId)
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
                status: claim.status
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;

