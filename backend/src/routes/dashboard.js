import express from 'express';
import {
    getAttendanceRecords,
    getFoodHistory,
    getActivityTimeline,
    getAttendanceStats
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
        // req.user.id is the council-based delegate ID (e.g., HRC-01)
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
        // req.user.id is the council-based delegate ID (e.g., HRC-01)
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
        // req.user.userId is the UUID from users table
        const activities = await getActivityTimeline(req.user.userId, limit);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/stats
 * Get attendance statistics for delegate
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        // req.user.id is the council-based delegate ID (e.g., HRC-01)
        const stats = await getAttendanceStats(req.user.id);

        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        next(error);
    }
});

export default router;

