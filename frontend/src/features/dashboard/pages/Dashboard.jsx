import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { DelegateCard } from '../components/DelegateCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { AttendanceHistory } from '../components/AttendanceHistory';
import { FoodHistory } from '../components/FoodHistory';
// TODO: Uncomment when real voucher data is available
// import { VoucherList, ActiveClaimDisplay } from '../../vouchers';
// import { VoucherRedemptionCard } from '../../vouchers/components/VoucherRedemptionCard';
import { Navbar, Footer } from '../../../shared/components/layout';
import './Dashboard.css';
import './Dashboard-additions.css';

/**
 * Dashboard Page
 * Main delegate portal with tabs for different views
 */
export function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // TODO: Uncomment when real voucher data is available
    // const [activeClaim, setActiveClaim] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'attendance', 'food'

    // TODO: Uncomment when real voucher data is available
    // // Handle successful voucher claim
    // const handleClaimSuccess = (claimData) => {
    //     setActiveClaim(claimData);
    // };

    // // Dismiss the active claim display
    // const handleDismissClaim = () => {
    //     setActiveClaim(null);
    // };

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

                            {/* TODO: Uncomment when real voucher data is available */}
                            {/* Voucher Redemption Card - Center of Attention */}
                            {/* {activeClaim && (
                                <VoucherRedemptionCard
                                        claim={activeClaim}
                                        onDismiss={handleDismissClaim}
                                    />
                            )} */}

                            {/* Bento Grid Layout */}
                            <div className="bento-grid">
                                {/* Delegate Card - Left Aligned */}
                                <section className="bento-item bento-item--card animate-slide-up">
                                    <DelegateCard delegate={user} />
                                </section>

                                {/* Conference Info */}
                                <section className="bento-item bento-item--info animate-slide-up">
                                    {(() => {
                                        const now = new Date();
                                        const confStart = new Date('2026-01-25');
                                        const confEnd = new Date('2026-02-02');
                                        const isInConference = now >= confStart && now <= confEnd;
                                        const daysDiff = isInConference ? Math.floor((now - confStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

                                        // Determine which phase is active
                                        // Sessions: Jan 25-28 (days 1-4)
                                        // Opening: Jan 30 (day 6)
                                        // Conference: Jan 31-Feb 2 (days 7-9)
                                        const phases = [
                                            { start: 1, end: 4, label: 'sessions' },
                                            { start: 6, end: 6, label: 'opening' },
                                            { start: 7, end: 9, label: 'conference' }
                                        ];
                                        const activePhase = phases.find(p => daysDiff >= p.start && daysDiff <= p.end)?.label;

                                        return (
                                            <>
                                                <div className="dashboard-info-header">
                                                    <h3 className="dashboard-info-title">Schedule</h3>
                                                    {isInConference && (
                                                        <span className="dashboard-current-day">Day {daysDiff}</span>
                                                    )}
                                                </div>
                                                <div className="dashboard-timeline">
                                                    {/* Sessions Group */}
                                                    <div className="dashboard-timeline-group">
                                                        <span className="dashboard-timeline-group-label">Sessions</span>
                                                        <div className="dashboard-timeline-items">
                                                            <div className={`dashboard-timeline-item ${activePhase === 'sessions' && daysDiff === 1 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 1</span>
                                                                <span className="dashboard-timeline-date">25 Jan</span>
                                                            </div>
                                                            <div className={`dashboard-timeline-item ${activePhase === 'sessions' && daysDiff === 2 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 2</span>
                                                                <span className="dashboard-timeline-date">26 Jan</span>
                                                            </div>
                                                            <div className={`dashboard-timeline-item ${activePhase === 'sessions' && daysDiff === 3 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 3</span>
                                                                <span className="dashboard-timeline-date">27 Jan</span>
                                                            </div>
                                                            <div className={`dashboard-timeline-item ${activePhase === 'sessions' && daysDiff === 4 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 4</span>
                                                                <span className="dashboard-timeline-date">28 Jan</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Opening Ceremony */}
                                                    <div className="dashboard-timeline-group">
                                                        <span className="dashboard-timeline-group-label">Opening Ceremony</span>
                                                        <div className="dashboard-timeline-items">
                                                            <div className={`dashboard-timeline-item ${activePhase === 'opening' ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Ceremony</span>
                                                                <span className="dashboard-timeline-date">30 Jan</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Conference Days */}
                                                    <div className="dashboard-timeline-group">
                                                        <span className="dashboard-timeline-group-label">Conference</span>
                                                        <div className="dashboard-timeline-items">
                                                            <div className={`dashboard-timeline-item ${activePhase === 'conference' && daysDiff === 7 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 1</span>
                                                                <span className="dashboard-timeline-date">31 Jan</span>
                                                            </div>
                                                            <div className={`dashboard-timeline-item ${activePhase === 'conference' && daysDiff === 8 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 2</span>
                                                                <span className="dashboard-timeline-date">1 Feb</span>
                                                            </div>
                                                            <div className={`dashboard-timeline-item ${activePhase === 'conference' && daysDiff === 9 ? 'dashboard-timeline-item--active' : ''}`}>
                                                                <span className="dashboard-timeline-day">Day 3</span>
                                                                <span className="dashboard-timeline-date">2 Feb</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </section>

                                {/* Conference Activity - Right column under schedule */}
                                <section className="bento-item bento-item--activity animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <div className="dashboard-activity-header">
                                        <h3 className="dashboard-activity-title">Recent Activity</h3>
                                        <button
                                            className="dashboard-activity-view-all"
                                            onClick={() => navigate('/activity')}
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <ActivityTimeline limit={8} />
                                </section>

                                {/* TODO: Uncomment when real voucher data is available */}
                                {/* Available Benefits - Full Width */}
                                {/* <section className="bento-item bento-item--vouchers animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <div className="dashboard-benefits-header">
                                        <div>
                                            <h3 className="dashboard-benefits-title">Available Benefits Today</h3>
                                            <p className="dashboard-benefits-subtitle">Use your delegate card to activate these benefits</p>
                                        </div>
                                    </div>
                                    <VoucherList
                                        delegateId={user.id}
                                        onClaimSuccess={handleClaimSuccess}
                                    />
                                </section> */}
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

