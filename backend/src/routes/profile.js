import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabaseAdmin } from '../db/supabase.js';

const router = express.Router();

/**
 * PUT /api/profile/photo
 * Update user profile photo URL
 */
router.put('/photo', authenticate, async (req, res, next) => {
    try {
        const { photoUrl } = req.body;
        const userId = req.user.userId; // UUID from users table

        // Allow clearing the photo when photoUrl is null
        if (photoUrl === null) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ photo_url: null })
                .eq('id', userId)
                .select('photo_url')
                .single();

            if (error) throw error;

            return res.json({
                success: true,
                photoUrl: null
            });
        }

        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                error: 'Photo URL is required'
            });
        }

        // Validate URL format
        try {
            new URL(photoUrl);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid photo URL format'
            });
        }

        // Update user photo_url
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ photo_url: photoUrl })
            .eq('id', userId)
            .select('photo_url')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            photoUrl: data.photo_url
        });
    } catch (error) {
        next(error);
    }
});

export default router;

