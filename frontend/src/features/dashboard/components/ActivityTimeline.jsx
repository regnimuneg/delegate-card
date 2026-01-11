import { Card } from '../../../shared/components';
import './ActivityTimeline.css';

// Mock activity data
const MOCK_ACTIVITIES = [
    {
        id: 1,
        type: 'attendance',
        title: 'Session Check-in',
        description: 'DISEC - Opening Session',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: 'location',
        points: null
    },
    {
        id: 2,
        type: 'food',
        title: 'Lunch Claimed',
        description: 'Main Hall Cafeteria',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        icon: 'food',
        points: null
    },
    {
        id: 3,
        type: 'game',
        title: 'Quiz Completed',
        description: 'UN History Trivia',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        icon: 'game',
        points: 50
    },
    {
        id: 4,
        type: 'attendance',
        title: 'Registration',
        description: 'Conference Check-in',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        icon: 'check',
        points: null
    }
];

/**
 * Format relative time
 */
function formatRelativeTime(date) {
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
 * ActivityTimeline Component
 * Displays history of delegate activities (attendance, food, games)
 */
export function ActivityTimeline({ activities = MOCK_ACTIVITIES }) {
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
                {activities.map((activity, index) => (
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
                            <p className="activity-timeline-description">{activity.description}</p>
                            {activity.points && (
                                <span className="activity-timeline-points">+{activity.points} pts</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActivityTimeline;
