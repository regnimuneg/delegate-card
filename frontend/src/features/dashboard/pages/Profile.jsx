import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../auth';
import { api } from '../../../shared/utils/api';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import { Navbar, Footer } from '../../../shared/components/layout';
import { Button } from '../../../shared/components';
import './Profile.css';

/**
 * Profile Page
 * Allows delegates to view and edit their profile information
 */
export function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({
        daysAttended: 0,
        totalDays: 9,
        attendanceRate: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.getAttendanceStats();
                if (response.success) {
                    setStats({
                        daysAttended: response.daysAttended || 0,
                        totalDays: response.totalDays || 9,
                        attendanceRate: response.attendanceRate || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch attendance stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (!user) {
        return null;
    }

    // QR code format: IC'26-{delegateId} (e.g., "IC'26-HRC-01")
    const delegateId = user.id;
    const qrCodeValue = `${delegateId}`;

    return (
        <div className="profile-page">
            <Navbar
                user={user}
                onLogout={logout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="profile-main">
                <div className="profile-container">
                    {/* Header */}
                    <div className="profile-header">
                        <h1>My Profile</h1>
                        <p>Manage your delegate information</p>
                    </div>

                    {/* Profile Content - Bento Grid on Desktop */}
                    <div className="profile-content">
                        {/* Photo Section - Left column, spans 2 rows on desktop */}
                        <section className="profile-section profile-section--photo">
                            <h2 className="profile-section-title">Profile Photo</h2>
                            <p className="profile-section-desc">
                                Upload a photo to personalize your delegate card
                            </p>
                            <div className="profile-photo-section">
                                <ProfilePhotoUpload />
                            </div>
                        </section>

                        {/* QR Code Section - Right column top on desktop */}
                        <section className="profile-section profile-section--qr">
                            <h2 className="profile-section-title">Your QR Code</h2>
                            <p className="profile-section-desc">
                                Used for attendance, meals, and activities
                            </p>
                            <div className="profile-qr-container">
                                <div className="profile-qr-wrapper">
                                    <QRCodeSVG
                                        value={qrCodeValue}
                                        size={160}
                                        bgColor="#FFFFFF"
                                        fgColor="#0037C0"
                                        level="M"
                                    />
                                </div>
                                <code className="profile-qr-code">{delegateId}</code>
                            </div>
                        </section>

                        {/* Stats Section - Right column bottom on desktop */}
                        <section className="profile-section profile-section--stats">
                            <h2 className="profile-section-title">Conference Stats</h2>
                            <div className="profile-stats-grid">
                                <div className="profile-stat">
                                    <span className="profile-stat-value">{stats.daysAttended}</span>
                                    <span className="profile-stat-label">Days Attended</span>
                                </div>
                                <div className="profile-stat">
                                    <span className="profile-stat-value">{stats.attendanceRate}%</span>
                                    <span className="profile-stat-label">Attendance Rate</span>
                                </div>
                                <div className="profile-stat profile-stat--full">
                                    <span className="profile-stat-label">Awards</span>
                                    {stats.awards ? (
                                        <span className="profile-stat-award">{stats.awards}</span>
                                    ) : (
                                        <span className="profile-stat-none">No awards yet</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Personal Info Section - Full width on desktop */}
                        <section className="profile-section profile-section--info">
                            <h2 className="profile-section-title">Personal Information</h2>
                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Full Name</label>
                                    <div className="profile-info-value">
                                        {user.firstName} {user.lastName}
                                    </div>
                                </div>
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Email</label>
                                    <div className="profile-info-value">{user.email}</div>
                                </div>
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Phone Number</label>
                                    <div className="profile-info-value">
                                        {user.phoneNumber || 'Not set'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Conference Info Section - Full width on desktop */}
                        <section className="profile-section profile-section--conference">
                            <h2 className="profile-section-title">Conference Details</h2>
                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Delegate ID</label>
                                    <div className="profile-info-value profile-info-value--mono">
                                        {user.id}
                                    </div>
                                </div>
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Council</label>
                                    <div className="profile-info-value">{user.council}</div>
                                </div>
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Status</label>
                                    <div className="profile-info-badge">
                                        <span className="profile-status-dot"></span>
                                        Active
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="profile-actions">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Profile;
