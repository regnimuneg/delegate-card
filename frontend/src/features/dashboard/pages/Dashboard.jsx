import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { DelegateCard } from '../components/DelegateCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { AttendanceHistory } from '../components/AttendanceHistory';
import { FoodHistory } from '../components/FoodHistory';
import { VoucherList, ActiveClaimDisplay } from '../../vouchers';
import { VoucherRedemptionCard } from '../../vouchers/components/VoucherRedemptionCard';
import { useActiveClaims } from '../../vouchers/hooks/useActiveClaims';
import { Navbar, Footer } from '../../../shared/components/layout';
import { PageHeader, Sticker } from '../../../shared/components';
import './Dashboard.css';
import './Dashboard-additions.css';

const scheduleGroups = [
    {
        label: 'Sessions',
        items: [
            { key: 'session-1', title: 'Session #1', date: 'June 27th', isoDate: '2026-06-27' },
            { key: 'session-2', title: 'Session #2', date: 'June 28th', isoDate: '2026-06-28' },
            { key: 'session-3', title: 'Session #3', date: 'June 29th', isoDate: '2026-06-29' },
            { key: 'session-4', title: 'Session #4', date: 'June 30th', isoDate: '2026-06-30' }
        ]
    },
    {
        label: 'Performance',
        items: [
            { key: 'performance', title: 'Performance Day', date: 'July 1st', isoDate: '2026-07-01' }
        ]
    },
    {
        label: 'Opening',
        items: [
            { key: 'opening', title: 'Opening', date: 'July 3rd', isoDate: '2026-07-03' }
        ]
    },
    {
        label: 'Conference',
        items: [
            { key: 'conference-1', title: 'Conference Day #1', date: 'July 4th', isoDate: '2026-07-04' },
            { key: 'conference-2', title: 'Conference Day #2', date: 'July 5th', isoDate: '2026-07-05' },
            { key: 'conference-3', title: 'Conference Day #3', date: 'July 6th', isoDate: '2026-07-06' }
        ]
    }
];

/**
 * Dashboard Page
 * Main delegate portal with tabs for different views
 */
export function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeClaim, setActiveClaim] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'attendance', 'food'
    const { activeClaims, addClaim } = useActiveClaims(user?.id);

    // Handle successful voucher claim
    const handleClaimSuccess = (claim) => {
        console.log('Voucher claimed:', claim);
        addClaim(claim);  // Store in activeClaims
        setActiveClaim(claim);  // Show popup
    };

    const handleDismissClaim = () => {
        // Just hide the popup, claim stays active
        setActiveClaim(null);
    };

    const handleClaimClick = (claim) => {
        // Reopen an active claim
        setActiveClaim(claim);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-page jn-app-page">
            {/* Navbar */}
            <Navbar
                user={user}
                onLogout={logout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Main Content */}
            <main className="dashboard-main jn-page-main">
                <div className="dashboard-container">
                    <PageHeader
                        eyebrow={`Delegate · ${user.id}`}
                        title={activeTab === 'attendance' ? 'Attendance' : activeTab === 'food' ? 'Meal History' : `Welcome, ${user.firstName}`}
                        subtitle={activeTab === 'attendance' ? 'Every session, all in one place' : activeTab === 'food' ? 'Meals and refreshments claimed' : null}
                        sticker={activeTab === 'food' ? 'megaphone' : null}
                    />
                    {/* Home Tab */}
                    {activeTab === 'home' && (
                        <>
                            {/* Voucher Redemption Card - Center of Attention */}
                            {activeClaim && (
                                <VoucherRedemptionCard
                                    claim={activeClaim}
                                    onDismiss={handleDismissClaim}
                                />
                            )}

                            {/* Bento Grid Layout */}
                            <div className="bento-grid">
                                {/* Delegate Card - Left Aligned */}
                                <section className="bento-item bento-item--card animate-slide-up">
                                    <Sticker src="/element_07_x1472_y63_w230_h190.png" className="dashboard-box-sticker dashboard-box-sticker--card" />
                                    <DelegateCard delegate={user} />
                                </section>

                                {/* Conference Info */}
                                <section className="bento-item bento-item--info animate-slide-up">
                                    <Sticker name="hourglass" className="dashboard-box-sticker dashboard-box-sticker--schedule" />
                                    {(() => {
                                        const now = new Date();
                                        const confStart = new Date('2026-06-27T00:00:00');
                                        const confEnd = new Date('2026-07-06T23:59:59');
                                        const isInConference = now >= confStart && now <= confEnd;
                                        
                                        const year = now.getFullYear();
                                        const month = String(now.getMonth() + 1).padStart(2, '0');
                                        const day = String(now.getDate()).padStart(2, '0');
                                        const todayKey = `${year}-${month}-${day}`;

                                        const activeItem = scheduleGroups
                                            .flatMap((group) => group.items)
                                            .find((item) => item.isoDate === todayKey);

                                        return (
                                            <>
                                                <div className="dashboard-info-header">
                                                    <h3 className="dashboard-info-title">Schedule</h3>
                                                    {isInConference && activeItem && (
                                                        <span className="dashboard-current-day">{activeItem.title}</span>
                                                    )}
                                                </div>
                                                <div className="dashboard-timeline">
                                                    {scheduleGroups.map((group) => (
                                                        <div className="dashboard-timeline-group" key={group.label}>
                                                            <span className="dashboard-timeline-group-label">{group.label}</span>
                                                            <div className="dashboard-timeline-items">
                                                                {group.items.map((item) => (
                                                                    <div
                                                                        className={`dashboard-timeline-item ${activeItem?.key === item.key ? 'dashboard-timeline-item--active' : ''}`}
                                                                        key={item.key}
                                                                    >
                                                                        <span className="dashboard-timeline-day">{item.title}</span>
                                                                        <span className="dashboard-timeline-date">{item.date}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </section>

                                {/* Conference Activity - Right column under schedule */}
                                <section className="bento-item bento-item--activity animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <Sticker src="/element_10_x329_y263_w159_h180.png" className="dashboard-box-sticker dashboard-box-sticker--activity" />
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

                                {/* Available Benefits - Full Width */}
                                <section className="bento-item bento-item--vouchers animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <Sticker src="/element_19_x367_y491_w196_h226.png" className="dashboard-box-sticker dashboard-box-sticker--vouchers" />
                                    <div className="dashboard-benefits-header">
                                        <div>
                                            <h3 className="dashboard-benefits-title">Available Benefits Today</h3>
                                            <p className="dashboard-benefits-subtitle">Use your delegate card to activate these benefits</p>
                                        </div>
                                    </div>
                                    <VoucherList
                                        delegateId={user.id}
                                        userName={`${user.firstName} ${user.lastName}`}
                                        onClaimSuccess={handleClaimSuccess}
                                        activeClaims={activeClaims}
                                        onClaimClick={handleClaimClick}
                                    />
                                </section>
                            </div>
                        </>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <section className="dashboard-section dashboard-tab-content animate-fade-in">
                            <Sticker name="microphone" className="dashboard-box-sticker dashboard-box-sticker--tab-left" />
                            <AttendanceHistory />
                        </section>
                    )}

                    {/* Food Tab */}
                    {activeTab === 'food' && (
                        <section className="dashboard-section dashboard-tab-content animate-fade-in">
                            <Sticker name="megaphone" className="dashboard-box-sticker dashboard-box-sticker--tab-right" />
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
