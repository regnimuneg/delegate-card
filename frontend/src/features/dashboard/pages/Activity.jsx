import { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { Navbar, Footer } from '../../../shared/components/layout';
import { api } from '../../../shared/utils/api';
import './Activity.css';

/**
 * Format date for display
 */
function formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return dateObj.toLocaleDateString('en-US', options);
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
 * Format food title professionally
 */
function formatFoodTitle(title) {
    const lowerTitle = title.toLowerCase();

    // Extract meal type
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
 * Format food description professionally
 */
function formatFoodDescription(description) {
    if (!description) return '';

    // Clean up common patterns
    return description
        .replace(/food\s*tracking[:\s]*/gi, '')
        .replace(/for\s+sessions\./gi, '')
        .replace(/sessions\./gi, '')
        .replace(/day(\d+)/gi, 'Day $1')
        .replace(/conf_day(\d+)/gi, 'Conference Day $1')
        .replace(/_/g, ' ')
        .trim();
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
        timestamp: new Date(activity.created_at),
        icon: getIconForType(activity.activity_type),
        points: activity.points || null
    };
}

/**
 * Activity Page
 * Shows full history of all delegate activities
 */
export function Activity() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('activity');
    const [filter, setFilter] = useState('all');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const response = await api.getActivityTimeline(100);
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
                setError('Failed to load activities');
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user]);

    if (!user) {
        return null;
    }

    const filteredActivities = filter === 'all'
        ? activities
        : activities.filter(a => a.type === filter);

    const activityCounts = {
        all: activities.length,
        attendance: activities.filter(a => a.type === 'attendance').length,
        food: activities.filter(a => a.type === 'food').length,
        game: activities.filter(a => a.type === 'game' || a.type === 'award').length,
        voucher: activities.filter(a => a.type === 'voucher').length
    };

    return (
        <div className="activity-page">
            <Navbar
                user={user}
                onLogout={logout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="activity-main">
                <div className="activity-container">
                    {/* Header */}
                    <div className="activity-header">
                        <h1>Activity History</h1>
                        <p>Your complete conference activity log</p>
                    </div>

                    {/* Filters */}
                    <div className="activity-filters">
                        <button
                            className={`activity-filter ${filter === 'all' ? 'activity-filter--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({activityCounts.all})
                        </button>
                        <button
                            className={`activity-filter ${filter === 'attendance' ? 'activity-filter--active' : ''}`}
                            onClick={() => setFilter('attendance')}
                        >
                            Attendance ({activityCounts.attendance})
                        </button>
                        <button
                            className={`activity-filter ${filter === 'food' ? 'activity-filter--active' : ''}`}
                            onClick={() => setFilter('food')}
                        >
                            Food ({activityCounts.food})
                        </button>
                        <button
                            className={`activity-filter ${filter === 'game' ? 'activity-filter--active' : ''}`}
                            onClick={() => setFilter('game')}
                        >
                            Games ({activityCounts.game})
                        </button>
                        <button
                            className={`activity-filter ${filter === 'voucher' ? 'activity-filter--active' : ''}`}
                            onClick={() => setFilter('voucher')}
                        >
                            Vouchers ({activityCounts.voucher})
                        </button>
                    </div>

                    {/* Activity List */}
                    <div className="activity-list">
                        {filteredActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`activity-item activity-item--${activity.type}`}
                            >
                                <div className="activity-item-icon">
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
                                <div className="activity-item-content">
                                    <div className="activity-item-header">
                                        <span className="activity-item-title">{activity.title}</span>
                                        {activity.points && (
                                            <span className="activity-item-points">+{activity.points} pts</span>
                                        )}
                                    </div>
                                    {activity.description && activity.description !== activity.title && (
                                        <p className="activity-item-description">{activity.description}</p>
                                    )}
                                    <span className="activity-item-time">{formatDate(activity.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {loading && (
                        <div className="activity-empty">
                            <p>Loading activities...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="activity-empty">
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && filteredActivities.length === 0 && (
                        <div className="activity-empty">
                            <p>No activities found for this filter</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Activity;

