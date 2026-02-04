import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../Button';
import './Navbar.css';

/**
 * Navbar Component
 * Responsive navigation with hamburger menu on mobile
 */
export function Navbar({ onLogout, activeTab, onTabChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isProfilePage = location.pathname === '/profile';
    const isActivityPage = location.pathname === '/activity';

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleTabClick = (tab) => {
        onTabChange(tab);
        setIsMenuOpen(false); // Close menu on mobile
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const handleActivityClick = () => {
        navigate('/activity');
        setIsMenuOpen(false);
    };

    const handleHomeClick = () => {
        if (isProfilePage || isActivityPage) {
            navigate('/dashboard');
        } else {
            handleTabClick('home');
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                {/* Brand */}
                <div className="navbar-brand" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                    <img src="/logo24.png" alt="NIMUN Logo" className="navbar-logo" />
                    <span className="navbar-brand-text">NIMUN'26</span>
                    <span className="navbar-brand-subtitle">Delegate Portal</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="navbar-nav">
                    <button
                        className={`navbar-nav-item ${activeTab === 'home' && !isProfilePage && !isActivityPage ? 'navbar-nav-item--active' : ''}`}
                        onClick={handleHomeClick}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Home</span>
                    </button>
                    <button
                        className={`navbar-nav-item ${isActivityPage ? 'navbar-nav-item--active' : ''}`}
                        onClick={handleActivityClick}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span>Activity</span>
                    </button>
                    <button
                        className={`navbar-nav-item ${isProfilePage ? 'navbar-nav-item--active' : ''}`}
                        onClick={handleProfileClick}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                    </button>
                </nav>

                {/* Desktop Sign Out */}
                <div className="navbar-actions">
                    <Button variant="ghost" size="small" onClick={onLogout}>
                        Sign Out
                    </Button>
                </div>

                {/* Mobile Hamburger */}
                <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'navbar-hamburger-line--open' : ''}`}></span>
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'navbar-hamburger-line--open' : ''}`}></span>
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'navbar-hamburger-line--open' : ''}`}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="navbar-mobile-menu">
                    <button
                        className={`navbar-mobile-item ${activeTab === 'home' && !isProfilePage && !isActivityPage ? 'navbar-mobile-item--active' : ''}`}
                        onClick={handleHomeClick}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Home</span>
                    </button>
                    <button
                        className={`navbar-mobile-item ${isActivityPage ? 'navbar-mobile-item--active' : ''}`}
                        onClick={handleActivityClick}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span>Activity</span>
                    </button>
                    <button
                        className={`navbar-mobile-item ${isProfilePage ? 'navbar-mobile-item--active' : ''}`}
                        onClick={handleProfileClick}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                    </button>
                    <div className="navbar-mobile-divider"></div>
                    <button className="navbar-mobile-item navbar-mobile-item--logout" onClick={onLogout}>
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </header>
    );
}

export default Navbar;
