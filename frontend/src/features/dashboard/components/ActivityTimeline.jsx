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
 * Transform database activity to frontend format
 */
function transformActivity(activity) {
    return {
        id: activity.id,
        type: activity.activity_type,
        title: activity.title,
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
                const response = await api.getActivityTimeline(limit);
                if (response.success && response.activities) {
                    const transformed = response.activities.map(transformActivity);
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActivityTimeline;
