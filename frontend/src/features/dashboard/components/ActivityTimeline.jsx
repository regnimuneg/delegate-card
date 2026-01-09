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
        icon: '📍',
        points: null
    },
    {
        id: 2,
        type: 'food',
        title: 'Lunch Claimed',
        description: 'Main Hall Cafeteria',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        icon: '🍽️',
        points: null
    },
    {
        id: 3,
        type: 'game',
        title: 'Quiz Completed',
        description: 'UN History Trivia',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        icon: '🎮',
        points: 50
    },
    {
        id: 4,
        type: 'attendance',
        title: 'Registration',
        description: 'Conference Check-in',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        icon: '✅',
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
                    <span className="activity-timeline-empty-icon">📋</span>
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
                            {activity.icon}
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
