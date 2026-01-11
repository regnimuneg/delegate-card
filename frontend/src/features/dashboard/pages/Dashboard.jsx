import { useState } from 'react';
import { useAuth } from '../../auth';
import { DelegateCard } from '../components/DelegateCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { AttendanceHistory } from '../components/AttendanceHistory';
import { FoodHistory } from '../components/FoodHistory';
import { VoucherList, ActiveClaimDisplay } from '../../vouchers';
import { Navbar, Footer } from '../../../shared/components/layout';
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
            {/* Navbar */}
            <Navbar
                user={user}
                onLogout={logout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

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

                            {/* Bento Grid Layout */}
                            <div className="bento-grid">
                                {/* Delegate Card - Left Aligned */}
                                <section className="bento-item bento-item--card animate-slide-up">
                                    <DelegateCard delegate={user} />
                                </section>

                                {/* Stats */}
                                <section className="bento-item bento-item--stats animate-slide-up">
                                    <h3 className="dashboard-stats-title">Your Stats</h3>
                                    <div className="dashboard-stats-grid">
                                        <div className="dashboard-stat">
                                            <svg className="dashboard-stat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="20" x2="12" y2="10"></line>
                                                <line x1="18" y1="20" x2="18" y2="4"></line>
                                                <line x1="6" y1="20" x2="6" y2="16"></line>
                                            </svg>
                                            <span className="dashboard-stat-value">{user.sessionsAttended || 0}</span>
                                            <span className="dashboard-stat-label">Sessions</span>
                                        </div>
                                        <div className="dashboard-stat">
                                            <svg className="dashboard-stat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            <span className="dashboard-stat-value">{user.daysAttended || 0}</span>
                                            <span className="dashboard-stat-label">Days</span>
                                        </div>
                                        <div className="dashboard-stat">
                                            <svg className="dashboard-stat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                                <path d="M4 22h16"></path>
                                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                            </svg>
                                            <span className="dashboard-stat-value">{user.awards || 0}</span>
                                            <span className="dashboard-stat-label">Awards</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Vouchers - Full Width */}
                                <section className="bento-item bento-item--vouchers animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <VoucherList
                                        delegateId={user.id}
                                        onClaimSuccess={handleClaimSuccess}
                                    />
                                </section>

                                {/* Activity - Full Width */}
                                <section className="bento-item bento-item--activity animate-slide-up" style={{ animationDelay: '200ms' }}>
                                    <ActivityTimeline />
                                </section>
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
            <Footer />
        </div>
    );
}

export default Dashboard;

