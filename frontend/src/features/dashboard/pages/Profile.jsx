import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../auth';
import { api } from '../../../shared/utils/api';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import { Navbar, Footer } from '../../../shared/components/layout';
import { Button, PageHeader, CouncilPills, SectionTitle, Sticker } from '../../../shared/components';
import './Profile.css';

const PersonIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const QrIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></svg>;
const ChartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></svg>;

export function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({ daysAttended: 0, totalDays: 8, attendanceRate: 0, awards: null });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.getAttendanceStats();
                if (response.success) {
                    const startDate = new Date('2026-01-25');
                    const daysElapsed = Math.max(1, Math.min(Math.ceil((Date.now() - startDate.getTime()) / 86400000), 8));
                    const daysAttended = response.daysAttended || 0;
                    setStats({
                        daysAttended,
                        totalDays: response.totalDays || 8,
                        attendanceRate: Math.round((daysAttended / daysElapsed) * 100),
                        awards: response.awards || null
                    });
                }
            } catch (error) {
                console.error('Failed to fetch attendance stats:', error);
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (!user) return null;

    return (
        <div className="profile-page jn-app-page">
            <Navbar user={user} onLogout={logout} activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="profile-main jn-page-main">
                <PageHeader title="My Profile" />

                <div className="profile-content">
                    <section className="profile-section profile-section--photo">
                        <SectionTitle icon={<PersonIcon />} title="Profile Photo" subtitle="Personalize your delegate card" />
                        <ProfilePhotoUpload />
                    </section>

                    <section className="profile-section profile-section--qr">
                        <SectionTitle icon={<QrIcon />} title="Your QR Code" subtitle="For attendance, meals, and activities" tone="blue" />
                        <div className="profile-qr-container">
                            <div className="profile-qr-wrapper">
                                <QRCodeSVG value={`${user.id}`} size={190} bgColor="#FFFFFF" fgColor="#0753C8" level="M" />
                            </div>
                            <code className="profile-qr-code">{user.id}</code>
                            <p>Show this QR code at check-in and activity points throughout the conference.</p>
                        </div>
                    </section>

                    <section className="profile-section profile-section--stats">
                        <SectionTitle icon={<ChartIcon />} title="Conference Stats" tone="pink" />
                        <div className="profile-stats-grid">
                            <div className="profile-stat"><span className="profile-stat-value">{stats.daysAttended}</span><span className="profile-stat-label">Days Attended</span></div>
                            <div className="profile-stat"><span className="profile-stat-value">{stats.attendanceRate}%</span><span className="profile-stat-label">Attendance Rate</span></div>
                            <div className="profile-stat profile-stat--full">
                                <span className="profile-stat-trophy">★</span>
                                <div><span className="profile-stat-label">Awards</span><span className={stats.awards ? 'profile-stat-award' : 'profile-stat-none'}>{stats.awards || 'No awards yet'}</span></div>
                            </div>
                        </div>
                    </section>

                    <section className="profile-section profile-section--info">
                        <SectionTitle icon={<PersonIcon />} title="Personal Information" />
                        <div className="profile-info-grid">
                            <div className="profile-info-item"><span className="profile-info-symbol">◎</span><div><span className="profile-info-label">Full Name</span><span className="profile-info-value">{user.firstName} {user.lastName}</span></div></div>
                            <div className="profile-info-item"><span className="profile-info-symbol">✉</span><div><span className="profile-info-label">Email</span><span className="profile-info-value">{user.email}</span></div></div>
                            <div className="profile-info-item"><span className="profile-info-symbol">☎</span><div><span className="profile-info-label">Phone Number</span><span className="profile-info-value">{user.phoneNumber || 'Not set'}</span></div></div>
                        </div>
                    </section>

                    <section className="profile-section profile-section--conference">
                        <div className="profile-conference-item"><span>Delegate ID</span><strong>{user.id}</strong></div>
                        <div className="profile-conference-item"><span>Council</span><strong>{user.council}</strong></div>
                        <div className="profile-conference-item"><span>Status</span><strong className="profile-info-badge"><i />Active</strong></div>
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                    </section>
                </div>
                <Sticker name="megaphone-black" className="profile-sticker-megaphone" />
                <Sticker name="handshake-black" className="profile-sticker-handshake" />
            </main>
            <Footer />
        </div>
    );
}

export default Profile;
