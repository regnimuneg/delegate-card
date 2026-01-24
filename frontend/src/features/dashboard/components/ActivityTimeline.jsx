import { useState, useEffect } from 'react';
import { Card } from '../../../shared/components';
import { api } from '../../../shared/utils/api';
import { useAuth } from '../../auth';
import './ActivityTimeline.css';

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return `${diffDays} days ago`;
    }
}

/**
 * Map activity type to icon
 */
function getIconForType(activityType) {
    switch (activityType) {
        case 'attendance':
            return 'location';
        case 'food':
            return 'food';
        case 'game':
        case 'award':
            return 'game';
        case 'voucher':
            return 'check';
        default:
            return 'check';
    }
}

/**
 * Format attendance title professionally
 */
function formatAttendanceTitle(title) {
    // Map common attendance title patterns to professional names
    const titleMap = {
        'sessions.day1': 'Day 1 Session',
        'sessions.day2': 'Day 2 Session',
        'sessions.day3': 'Day 3 Session',
        'sessions.day4': 'Day 4 Session',
        'sessions.opening': 'Opening Ceremony',
        'sessions.conf_day1': 'Conference Day 1',
        'sessions.conf_day2': 'Conference Day 2',
        'sessions.conf_day3': 'Conference Day 3',
        'day1_session': 'Day 1 Session',
        'day2_session': 'Day 2 Session',
        'day3_session': 'Day 3 Session',
        'day4_session': 'Day 4 Session',
        'opening_ceremony': 'Opening Ceremony',
        'conf_day1': 'Conference Day 1',
        'conf_day2': 'Conference Day 2',
        'conf_day3': 'Conference Day 3',
    };

    // Check if title matches any pattern
    for (const [pattern, formatted] of Object.entries(titleMap)) {
        if (title.toLowerCase().includes(pattern.toLowerCase())) {
            return formatted;
        }
    }

    // Fallback: clean up common patterns
    return title
        .replace(/sessions\./gi, '')
        .replace(/attendance/gi, '')
        .replace(/day(\d+)/gi, 'Day $1')
        .replace(/conf_day(\d+)/gi, 'Conference Day $1')
        .replace(/opening/gi, 'Opening Ceremony')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Format food title professionally
 */
function formatFoodTitle(title) {
    // Common food-related patterns
    const lowerTitle = title.toLowerCase();

    // Extract meal type and day
    let mealType = '';
    if (lowerTitle.includes('breakfast')) mealType = 'Breakfast';
    else if (lowerTitle.includes('lunch')) mealType = 'Lunch';
    else if (lowerTitle.includes('dinner')) mealType = 'Dinner';
    else if (lowerTitle.includes('snack')) mealType = 'Snack';
    else if (lowerTitle.includes('food')) mealType = 'Meal';

    // Extract day
    let dayPart = '';
    const dayMatch = lowerTitle.match(/day\s*(\d+)/i) || lowerTitle.match(/sessions\.day(\d+)/i);
    const confMatch = lowerTitle.match(/conf_?day\s*(\d+)/i) || lowerTitle.match(/sessions\.conf_?day(\d+)/i);
    const openingMatch = lowerTitle.includes('opening');

    if (confMatch) {
        dayPart = `Conference Day ${confMatch[1]}`;
    } else if (dayMatch) {
        dayPart = `Day ${dayMatch[1]}`;
    } else if (openingMatch) {
        dayPart = 'Opening Ceremony';
    }

    // Build formatted title
    if (mealType && dayPart) {
        return `${dayPart} ${mealType}`;
    } else if (mealType) {
        return mealType;
    } else if (dayPart) {
        return dayPart;
    }

    // Fallback: clean up the title
    return title
        .replace(/sessions\./gi, '')
        .replace(/food\s*tracking[:\s]*/gi, '')
        .replace(/for\s+/gi, '')
        .replace(/day(\d+)/gi, 'Day $1')
        .replace(/conf_day(\d+)/gi, 'Conference Day $1')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Get attendance field key from title for deduplication
 */
function getAttendanceFieldKey(title) {
    // Extract the attendance field identifier from title
    const patterns = [
        { pattern: /day1|sessions\.day1/i, key: 'day1_session' },
        { pattern: /day2|sessions\.day2/i, key: 'day2_session' },
        { pattern: /day3|sessions\.day3/i, key: 'day3_session' },
        { pattern: /day4|sessions\.day4/i, key: 'day4_session' },
        { pattern: /opening|sessions\.opening/i, key: 'opening_ceremony' },
        { pattern: /conf_day1|sessions\.conf_day1/i, key: 'conf_day1' },
        { pattern: /conf_day2|sessions\.conf_day2/i, key: 'conf_day2' },
        { pattern: /conf_day3|sessions\.conf_day3/i, key: 'conf_day3' },
    ];

    for (const { pattern, key } of patterns) {
        if (pattern.test(title)) {
            return key;
        }
    }

    return null;
}

/**
 * Check if activity indicates "Not Attended"
 * Checks the original description from database before transformation
 */
function isNotAttended(activity) {
    if (activity.activity_type !== 'attendance') return false;
    const desc = (activity.description || '').toLowerCase();
    return desc.includes('marked attended as false') ||
        desc.includes('attended as false');
}

/**
 * Check if activity is a check-in or check-out (not a status change)
 */
function isCheckInOrOut(activity) {
    if (activity.activity_type !== 'attendance') return false;
    const desc = (activity.description || '').toLowerCase();
    return desc.includes('check-in') || desc.includes('checkin') ||
        desc.includes('check-out') || desc.includes('checkout') ||
        desc.includes('checked in') || desc.includes('checked out');
}

/**
 * Filter attendance entries:
 * - Keep ALL check-in and check-out entries
 * - For status changes (marked attended), keep only latest per day and filter out "Not Attended"
 */
function filterAttendanceEntries(activities) {
    const statusMap = new Map(); // For deduplicating status changes
    const result = [];

    activities.forEach(activity => {
        if (activity.activity_type !== 'attendance') {
            // Keep all non-attendance activities
            result.push(activity);
        } else if (isCheckInOrOut(activity)) {
            // Keep ALL check-in and check-out entries
            result.push(activity);
        } else {
            // For status changes, deduplicate by field
            const fieldKey = getAttendanceFieldKey(activity.title);
            if (fieldKey) {
                const existing = statusMap.get(fieldKey);
                if (!existing || new Date(activity.created_at) > new Date(existing.created_at)) {
                    statusMap.set(fieldKey, activity);
                }
            } else {
                result.push(activity);
            }
        }
    });

    // Add deduplicated status changes, filtering out "Not Attended"
    statusMap.forEach(activity => {
        if (!isNotAttended(activity)) {
            result.push(activity);
        }
    });

    // Sort by timestamp (most recent first)
    return result.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
}

/**
 * Format attendance description professionally
 * Shows check-in/check-out with time
 */
function formatAttendanceDescription(description, timestamp) {
    if (!description) return '';

    const lowerDesc = description.toLowerCase();

    // Format the time from timestamp if available
    let timeStr = '';
    if (timestamp) {
        const date = new Date(timestamp);
        timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Check for check-in
    if (lowerDesc.includes('check-in') || lowerDesc.includes('checkin') || lowerDesc.includes('checked in')) {
        return timeStr ? `Check in at ${timeStr}` : 'Checked in';
    }

    // Check for check-out
    if (lowerDesc.includes('check-out') || lowerDesc.includes('checkout') || lowerDesc.includes('checked out')) {
        return timeStr ? `Check out at ${timeStr}` : 'Checked out';
    }

    // Check for attendance marked
    if (lowerDesc.includes('marked attended as true') || lowerDesc.includes('attended as true')) {
        return timeStr ? `Marked present at ${timeStr}` : 'Marked as present';
    }
    if (lowerDesc.includes('marked attended as false') || lowerDesc.includes('attended as false')) {
        return 'Not Attended';
    }

    return description;
}

/**
 * Format food description professionally
 */
function formatFoodDescription(description) {
    if (!description) return 'Meal redeemed';

    // Clean up common patterns
    const cleaned = description
        .replace(/food\s*tracking[:\s]*/gi, '')
        .replace(/for\s+sessions\./gi, '')
        .replace(/sessions\./gi, '')
        .replace(/day(\d+)/gi, 'Day $1')
        .replace(/conf_day(\d+)/gi, 'Conference Day $1')
        .replace(/_/g, ' ')
        .trim();

    return cleaned || 'Meal redeemed';
}

/**
 * Transform database activity to frontend format
 */
function transformActivity(activity) {
    const isAttendance = activity.activity_type === 'attendance';
    const isFood = activity.activity_type === 'food';

    let formattedTitle = activity.title;
    let formattedDescription = activity.description || '';

    if (isAttendance) {
        formattedTitle = formatAttendanceTitle(activity.title);
        formattedDescription = formatAttendanceDescription(activity.description, activity.created_at);
    } else if (isFood) {
        formattedTitle = formatFoodTitle(activity.title);
        formattedDescription = formatFoodDescription(activity.description);
    }

    return {
        id: activity.id,
        type: activity.activity_type,
        title: formattedTitle,
        description: formattedDescription,
        timestamp: activity.created_at,
        icon: getIconForType(activity.activity_type)
    };
}

/**
 * ActivityTimeline Component
 * Displays history of delegate activities (attendance, food, games)
 * @param {number} limit - Maximum number of activities to show (default: 5)
 * @param {Array} activities - Optional pre-fetched activities (if not provided, will fetch)
 */
export function ActivityTimeline({ activities: propActivities, limit = 5 }) {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(!propActivities);

    useEffect(() => {
        // If activities are provided as prop, use them
        if (propActivities) {
            setActivities(propActivities);
            setLoading(false);
            return;
        }

        // Otherwise, fetch from API
        const fetchActivities = async () => {
            if (!user) return;

            setLoading(true);

            try {
                const response = await api.getActivityTimeline(limit * 3); // Fetch more to account for deduplication
                if (response.success && response.activities) {
                    // First deduplicate (checking original descriptions), then transform
                    const deduplicated = filterAttendanceEntries(response.activities);
                    const transformed = deduplicated.map(transformActivity);
                    setActivities(transformed);
                } else {
                    setActivities([]);
                }
            } catch (err) {
                console.error('Failed to fetch activities:', err);
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user, propActivities, limit]);

    // Apply limit
    const displayActivities = activities.slice(0, limit);
    if (activities.length === 0) {
        return (
            <Card padding="medium" className="activity-timeline-empty">
                <div className="activity-timeline-empty-content">
                    <span className="activity-timeline-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </span>
                    <p>No activities yet</p>
                    <span className="activity-timeline-empty-hint">
                        Your attendance, meals, and game scores will appear here
                    </span>
                </div>
            </Card>
        );
    }

    return (
        <div className="activity-timeline">
            <h3 className="activity-timeline-title">Recent Activity</h3>

            <div className="activity-timeline-list">
                {displayActivities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={`activity-timeline-item activity-timeline-item--${activity.type}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="activity-timeline-icon">
                            {activity.icon === 'location' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            )}
                            {activity.icon === 'food' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                    <path d="M7 2v20"></path>
                                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                                </svg>
                            )}
                            {activity.icon === 'game' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="2" width="12" height="20" rx="2"></rect>
                                    <path d="M12 18h.01"></path>
                                </svg>
                            )}
                            {activity.icon === 'check' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>
                        <div className="activity-timeline-content">
                            <div className="activity-timeline-header">
                                <span className="activity-timeline-item-title">{activity.title}</span>
                                <span className="activity-timeline-time">
                                    {formatRelativeTime(activity.timestamp)}
                                </span>
                            </div>
                            {activity.description && (
                                <p className="activity-timeline-description">{activity.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActivityTimeline;
