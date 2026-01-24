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
 * Includes both activity_timeline entries AND check-in/check-out from participant data
 */
router.get('/activity', authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        // req.user.userId is the UUID from users table
        const activities = await getActivityTimeline(req.user.userId, limit);

        // Also get check-in/check-out times from participant data
        const { getDelegateById, getMemberById } = await import('../config/database.js');

        let participant = null;
        if (req.user.userType === 'member' || req.user.userType === 'executive' || req.user.userType === 'high board') {
            participant = await getMemberById(req.user.id);
        } else {
            participant = await getDelegateById(req.user.id);
        }

        // Build check-in/check-out activities from actual timestamps
        const checkInOutActivities = [];
        if (participant) {
            const sessions = [
                { key: 'opening_ceremony', name: 'Opening Ceremony' },
                { key: 'day1', name: 'Day 1 Session' },
                { key: 'day2', name: 'Day 2 Session' },
                { key: 'day3', name: 'Day 3 Session' },
                { key: 'day4', name: 'Day 4 Session' },
                { key: 'conf_day1', name: 'Conference Day 1' },
                { key: 'conf_day2', name: 'Conference Day 2' },
                { key: 'conf_day3', name: 'Conference Day 3' }
            ];

            sessions.forEach(session => {
                const checkinField = session.key === 'opening_ceremony'
                    ? 'opening_ceremony_checkin'
                    : `${session.key}_checkin`;
                const checkoutField = session.key === 'opening_ceremony'
                    ? 'opening_ceremony_checkout'
                    : `${session.key}_checkout`;

                // Add check-in entry if exists
                if (participant[checkinField]) {
                    checkInOutActivities.push({
                        id: `checkin-${session.key}`,
                        activity_type: 'attendance',
                        title: session.name,
                        description: 'Check-in',
                        created_at: participant[checkinField]
                    });
                }

                // Add check-out entry if exists
                if (participant[checkoutField]) {
                    checkInOutActivities.push({
                        id: `checkout-${session.key}`,
                        activity_type: 'attendance',
                        title: session.name,
                        description: 'Check-out',
                        created_at: participant[checkoutField]
                    });
                }
            });
        }

        // Filter out attendance entries from activity_timeline since we're getting those from participant data
        const filteredActivities = activities.filter(a => a.activity_type !== 'attendance');

        // Combine and sort all activities
        const allActivities = [...filteredActivities, ...checkInOutActivities];
        allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Limit results
        const limitedActivities = allActivities.slice(0, limit);

        res.json({
            success: true,
            activities: limitedActivities
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
        // req.user.id is the council-based delegate ID or committee-based member ID
        const stats = await getAttendanceStats(req.user.id, req.user.userType);

        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        next(error);
    }
});

export default router;

