import { useState } from 'react';
import { Button } from '../Button';
import './Navbar.css';

/**
 * Navbar Component
 * Responsive navigation with hamburger menu on mobile
 */
export function Navbar({ user, onLogout, activeTab, onTabChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleTabClick = (tab) => {
        onTabChange(tab);
        setIsMenuOpen(false); // Close menu on mobile
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                {/* Brand */}
                <div className="navbar-brand">
                    <img src="/logo24.png" alt="NIMUN Logo" className="navbar-logo" />
                    <span className="navbar-brand-text">NIMUN</span>
                    <span className="navbar-brand-year">'26</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="navbar-nav">
                    <button
                        className={`navbar-nav-item ${activeTab === 'home' ? 'navbar-nav-item--active' : ''}`}
                        onClick={() => handleTabClick('home')}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Home</span>
                    </button>
                    <button
                        className={`navbar-nav-item ${activeTab === 'attendance' ? 'navbar-nav-item--active' : ''}`}
                        onClick={() => handleTabClick('attendance')}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        <span>Attendance</span>
                    </button>
                    <button
                        className={`navbar-nav-item ${activeTab === 'food' ? 'navbar-nav-item--active' : ''}`}
                        onClick={() => handleTabClick('food')}
                    >
                        <svg className="navbar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                            <path d="M7 2v20"></path>
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                        </svg>
                        <span>Food</span>
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
                        className={`navbar-mobile-item ${activeTab === 'home' ? 'navbar-mobile-item--active' : ''}`}
                        onClick={() => handleTabClick('home')}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Home</span>
                    </button>
                    <button
                        className={`navbar-mobile-item ${activeTab === 'attendance' ? 'navbar-mobile-item--active' : ''}`}
                        onClick={() => handleTabClick('attendance')}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        <span>Attendance</span>
                    </button>
                    <button
                        className={`navbar-mobile-item ${activeTab === 'food' ? 'navbar-mobile-item--active' : ''}`}
                        onClick={() => handleTabClick('food')}
                    >
                        <svg className="navbar-mobile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                            <path d="M7 2v20"></path>
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                        </svg>
                        <span>Food</span>
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
