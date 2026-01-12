import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../shared/utils/api';
import { Button, Input, Card } from '../../../shared/components';
import './ForgotPassword.css';

// Image slideshow URLs (local images from public folder)
const slideshowImages = [
    '/slideshowimages/_NU27875.jpg',
    '/slideshowimages/CCPCJ\'26.jpg',
    '/slideshowimages/Council2.png',
    '/slideshowimages/Group.jpg',
    '/slideshowimages/henry.jpg',
    '/slideshowimages/plac.jpg',
    '/slideshowimages/plac2.jpg',
    '/slideshowimages/Press\'26.jpg',
    '/slideshowimages/salama.jpg'
];

/**
 * Forgot Password Page
 * Allows users to request a password reset email
 */
export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Image slideshow rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
        }, 2500); // Change image every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    // Allow minimal scrolling
    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.body.style.height = '100vh';
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.requestPasswordReset(email);
            
            if (response.success) {
                setMessage(response.message || 'Password reset link has been sent to your email address.');
            } else {
                setError(response.error || 'Failed to send reset email');
            }
        } catch (err) {
            // Extract error message from API response
            const errorMessage = err.message || 'Failed to send reset email. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            {/* Left Panel - Branding & Slideshow */}
            <div className="forgot-password-left-panel">
                <div className="forgot-password-slideshow">
                    {slideshowImages.map((image, index) => (
                        <div
                            key={index}
                            className={`forgot-password-slideshow-image ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                </div>
                <div className="forgot-password-left-overlay"></div>
                <div className="forgot-password-brand-content">
                    <img src="/Logo_White.png" alt="NIMUN Logo" className="forgot-password-logo-image" />
                    <div className="forgot-password-logo">
                        <span className="forgot-password-logo-text">NIMUN</span>
                        <span className="forgot-password-logo-year">'26</span>
                    </div>
                    <p className="forgot-password-tagline">RESET PASSWORD</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="forgot-password-right-panel">
                <div className="forgot-password-form-container">
                    <Card variant="elevated" padding="large" className="forgot-password-card">
                    <h1 className="forgot-password-title">Reset Password</h1>
                    <p className="forgot-password-subtitle">
                        Enter your email address and we'll send you a link to reset your password
                    </p>

                    {message && (
                        <div className="forgot-password-success" style={{ marginBottom: '1rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <p>{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="forgot-password-form">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setMessage('');
                                setError('');
                            }}
                            placeholder="your.email@example.com"
                            required
                            autoComplete="email"
                            autoFocus={!message}
                        />

                        {error && (
                            <div className="forgot-password-error">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 7.5a1, 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                <div>
                                    <p>{error}</p>
                                    {error.includes('not registered') || error.includes('Email not registered') ? (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
                                            Only registered emails can reset passwords.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {message ? 'Send Another Reset Link' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="forgot-password-back">
                        <Link to="/" className="forgot-password-back-link">
                            ← Back to Login
                        </Link>
                    </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

