import { useState } from 'react';
import { useAuth } from '../../auth';
import { Navbar, Footer } from '../../../shared/components/layout';
import './Activity.css';

// Full activity history mock data
const ALL_ACTIVITIES = [
    {
        id: 1,
        type: 'attendance',
        title: 'Session Check-in',
        description: 'DISEC - Opening Session',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'location',
        points: null
    },
    {
        id: 2,
        type: 'food',
        title: 'Lunch Claimed',
        description: 'Main Hall Cafeteria',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: 'food',
        points: null
    },
    {
        id: 3,
        type: 'game',
        title: 'Quiz Completed',
        description: 'UN History Trivia',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: 'game',
        points: 50
    },
    {
        id: 4,
        type: 'attendance',
        title: 'Registration',
        description: 'Conference Check-in',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        icon: 'check',
        points: null
    },
    {
        id: 5,
        type: 'food',
        title: 'Dinner Claimed',
        description: 'Grand Ballroom',
        timestamp: new Date(Date.now() - 52 * 60 * 60 * 1000),
        icon: 'food',
        points: null
    },
    {
        id: 6,
        type: 'attendance',
        title: 'Opening Ceremony',
        description: 'Main Auditorium',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        icon: 'location',
        points: null
    },
    {
        id: 7,
        type: 'game',
        title: 'Trivia Night',
        description: 'Team Competition',
        timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
        icon: 'game',
        points: 75
    },
    {
        id: 8,
        type: 'food',
        title: 'Breakfast Claimed',
        description: 'Delegate Lounge',
        timestamp: new Date(Date.now() - 100 * 60 * 60 * 1000),
        icon: 'food',
        points: null
    }
];

/**
 * Format date for display
 */
function formatDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Activity Page
 * Shows full history of all delegate activities
 */
export function Activity() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('activity');
    const [filter, setFilter] = useState('all');

    if (!user) {
        return null;
    }

    const filteredActivities = filter === 'all' 
        ? ALL_ACTIVITIES 
        : ALL_ACTIVITIES.filter(a => a.type === filter);

    const activityCounts = {
        all: ALL_ACTIVITIES.length,
        attendance: ALL_ACTIVITIES.filter(a => a.type === 'attendance').length,
        food: ALL_ACTIVITIES.filter(a => a.type === 'food').length,
        game: ALL_ACTIVITIES.filter(a => a.type === 'game').length
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
                                    <p className="activity-item-description">{activity.description}</p>
                                    <span className="activity-item-time">{formatDate(activity.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredActivities.length === 0 && (
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

