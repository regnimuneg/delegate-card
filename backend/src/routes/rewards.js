import express from 'express';
import {
    createRewardActivation,
    getRewardActivationByToken,
    createActivityEntry
} from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRewardActivation } from '../middleware/validator.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * POST /api/rewards/activate
 * Activate a reward (generate QR code)
 */
router.post('/activate', authenticate, validateRewardActivation, async (req, res, next) => {
    try {
        const { rewardType } = req.body;
        const delegateId = req.user.id;

        // Generate QR token
        const qrToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes - Reward stays valid for this period

        // Create QR data payload
        const qrData = {
            type: 'reward',
            delegateId,
            rewardType,
            timestamp: Date.now(),
            token: qrToken,
            expiresAt: expiresAt.toISOString()
        };

        // Create reward activation
        const activation = await createRewardActivation(delegateId, {
            reward_type: rewardType,
            qr_token: qrToken,
            qr_data: qrData,
            expires_at: expiresAt
        });

        // Create activity entry (use userId from JWT, not delegateId)
        await createActivityEntry(req.user.userId, {
            activity_type: 'other',
            title: `Reward Activated: ${rewardType}`,
            description: `Generated QR code for ${rewardType} redemption`,
            metadata: {
                reward_type: rewardType,
                activation_id: activation.id
            }
        });

        res.json({
            success: true,
            activation: {
                id: activation.id,
                rewardType: activation.reward_type,
                qrToken: activation.qr_token,
                qrData: activation.qr_data,
                expiresAt: activation.expires_at
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/rewards/verify/:token
 * Verify a reward QR token (for vendors)
 */
router.get('/verify/:token', optionalAuth, async (req, res, next) => {
    try {
        const { token } = req.params;

        const activation = await getRewardActivationByToken(token);

        if (!activation) {
            return res.status(404).json({
                success: false,
                error: 'Invalid or expired QR token'
            });
        }

        // Check if expired
        if (new Date(activation.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'QR token has expired'
            });
        }

        res.json({
            success: true,
            activation: {
                id: activation.id,
                rewardType: activation.reward_type,
                delegate: {
                    id: activation.delegates.id,
                    name: activation.delegates.users
                        ? `${activation.delegates.users.first_name} ${activation.delegates.users.last_name}`
                        : 'Unknown',
                    qrCode: activation.delegates.qr_code
                },
                expiresAt: activation.expires_at
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;

