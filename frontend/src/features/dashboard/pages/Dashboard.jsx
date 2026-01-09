import { useState } from 'react';
import { useAuth } from '../../auth';
import { DelegateCard } from '../components/DelegateCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { AttendanceHistory } from '../components/AttendanceHistory';
import { FoodHistory } from '../components/FoodHistory';
import { VoucherList, ActiveClaimDisplay } from '../../vouchers';
import { Button } from '../../../shared/components';
import './Dashboard.css';

/**
 * Dashboard Page
 * Main delegate portal with tabs for different views
 */
export function Dashboard() {
    const { user, logout } = useAuth();
    const [activeClaim, setActiveClaim] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'attendance', 'food'

    // Handle successful voucher claim
    const handleClaimSuccess = (claimData) => {
        setActiveClaim(claimData);
    };

    // Dismiss the active claim display
    const handleDismissClaim = () => {
        setActiveClaim(null);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-brand">
                        <img src="/logo24.png" alt="NIMUN Logo" className="dashboard-brand-logo" />
                        <span className="dashboard-brand-text">NIMUN</span>
                        <span className="dashboard-brand-year">'26</span>
                    </div>
                    <Button variant="ghost" size="small" onClick={logout}>
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="dashboard-tabs">
                <button
                    className={`dashboard-tab ${activeTab === 'home' ? 'dashboard-tab--active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    <span className="dashboard-tab-icon">🏠</span>
                    <span className="dashboard-tab-label">Home</span>
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'attendance' ? 'dashboard-tab--active' : ''}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    <span className="dashboard-tab-icon">📊</span>
                    <span className="dashboard-tab-label">Attendance</span>
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'food' ? 'dashboard-tab--active' : ''}`}
                    onClick={() => setActiveTab('food')}
                >
                    <span className="dashboard-tab-icon">🍽️</span>
                    <span className="dashboard-tab-label">Food</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Home Tab */}
                    {activeTab === 'home' && (
                        <>
                            {/* Welcome Section */}
                            <section className="dashboard-welcome animate-fade-in">
                                <h1>Welcome, {user.firstName}</h1>
                                <p>Claim your vouchers and track your conference activities</p>
                            </section>

                            {/* Active Claim Display */}
                            {activeClaim && (
                                <section className="dashboard-section dashboard-active-claim animate-slide-up">
                                    <ActiveClaimDisplay
                                        claim={activeClaim}
                                        onDismiss={handleDismissClaim}
                                    />
                                </section>
                            )}

                            {/* Compact Card & Stats Section */}
                            <div className="dashboard-compact-header">
                                {/* Delegate Card - Compact */}
                                <section className="dashboard-section dashboard-section--card animate-slide-up">
                                    <DelegateCard delegate={user} />
                                </section>

                                {/* Stats - Compact */}
                                <section className="dashboard-section dashboard-stats dashboard-section--stats animate-slide-up">
                                    <h3 className="dashboard-stats-title">Your Stats</h3>
                                    <div className="dashboard-stats-grid">
                                        <div className="dashboard-stat">
                                            <span className="dashboard-stat-icon">📊</span>
                                            <span className="dashboard-stat-value">{user.sessionsAttended || 0}</span>
                                            <span className="dashboard-stat-label">Sessions</span>
                                        </div>
                                        <div className="dashboard-stat">
                                            <span className="dashboard-stat-icon">📅</span>
                                            <span className="dashboard-stat-value">{user.daysAttended || 0}</span>
                                            <span className="dashboard-stat-label">Days</span>
                                        </div>
                                        <div className="dashboard-stat">
                                            <span className="dashboard-stat-icon">🏆</span>
                                            <span className="dashboard-stat-value">{user.awards || 0}</span>
                                            <span className="dashboard-stat-label">Awards</span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Two Column Layout */}
                            <div className="dashboard-grid">
                                {/* Left Column - Vouchers */}
                                <div className="dashboard-column">
                                    <section className="dashboard-section animate-slide-up" style={{ animationDelay: '100ms' }}>
                                        <VoucherList
                                            delegateId={user.id}
                                            onClaimSuccess={handleClaimSuccess}
                                        />
                                    </section>
                                </div>

                                {/* Right Column - Activity */}
                                <div className="dashboard-column">
                                    <section className="dashboard-section animate-slide-up" style={{ animationDelay: '200ms' }}>
                                        <ActivityTimeline />
                                    </section>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <section className="dashboard-section dashboard-tab-content animate-fade-in">
                            <AttendanceHistory />
                        </section>
                    )}

                    {/* Food Tab */}
                    {activeTab === 'food' && (
                        <section className="dashboard-section dashboard-tab-content animate-fade-in">
                            <FoodHistory />
                        </section>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>NIMUN 2026 • International Conference</p>
            </footer>
        </div>
    );
}

export default Dashboard;

