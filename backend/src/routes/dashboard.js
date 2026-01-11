import express from 'express';
import {
    getAttendanceRecords,
    getFoodHistory,
    getActivityTimeline
} from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/attendance
 * Get attendance history for delegate
 */
router.get('/attendance', authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const records = await getAttendanceRecords(req.user.id, limit);

        res.json({
            success: true,
            records
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/food
 * Get food history for delegate
 */
router.get('/food', authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const records = await getFoodHistory(req.user.id, limit);

        res.json({
            success: true,
            records
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/activity
 * Get activity timeline for delegate
 */
router.get('/activity', authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = await getActivityTimeline(req.user.id, limit);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        next(error);
    }
});

export default router;

