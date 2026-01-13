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
 * Transform database activity to frontend format
 */
function transformActivity(activity) {
    return {
        id: activity.id,
        type: activity.activity_type,
        title: activity.title,
        description: activity.description || '',
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
                    const transformed = response.activities.map(transformActivity);
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
                                    <p className="activity-item-description">{activity.description || activity.title}</p>
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

