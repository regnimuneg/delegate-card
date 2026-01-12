import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../../shared/utils/api';
import { Button, Input, Card } from '../../../shared/components';
import './ResetPassword.css';

/**
 * Reset Password Page
 * Allows users to reset their password using a token from email
 */
export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Prevent body scrolling
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.maxHeight = '100vh';
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.maxHeight = '';
        };
    }, []);

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            setIsVerifying(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await api.verifyResetToken(token);
                if (!response.success) {
                    setError('Invalid or expired reset token. Please request a new password reset.');
                }
            } catch (err) {
                setError('Invalid or expired reset token. Please request a new password reset.');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.resetPassword(token, formData.password);
            
            if (response.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setError(response.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="reset-password-page page-center">
                <div className="reset-password-container">
                    <Card variant="elevated" padding="large">
                        <div className="reset-password-verifying">
                            <div className="reset-password-spinner"></div>
                            <p>Verifying reset token...</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="reset-password-page page-center">
                <div className="reset-password-container animate-slide-up">
                    <div className="reset-password-brand">
                        <div className="reset-password-logo">
                            <span className="reset-password-logo-text">NIMUN</span>
                            <span className="reset-password-logo-year">'26</span>
                        </div>
                    </div>

                    <Card variant="elevated" padding="large" className="reset-password-card">
                        <div className="reset-password-success">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <h1 className="reset-password-title">Password Reset Successful!</h1>
                            <p className="reset-password-message">
                                Your password has been reset successfully. Redirecting to login...
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page page-center">
            <div className="reset-password-container animate-slide-up">
                {/* Logo/Brand Header */}
                <div className="reset-password-brand">
                    <div className="reset-password-logo">
                        <span className="reset-password-logo-text">NIMUN</span>
                        <span className="reset-password-logo-year">'26</span>
                    </div>
                    <p className="reset-password-tagline">Delegate Portal</p>
                </div>

                {/* Reset Password Card */}
                <Card variant="elevated" padding="large" className="reset-password-card">
                    <h1 className="reset-password-title">Reset Your Password</h1>
                    <p className="reset-password-subtitle">
                        Enter your new password below
                    </p>

                    <form onSubmit={handleSubmit} className="reset-password-form">
                        <Input
                            label="New Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password (min. 6 characters)"
                            required
                            autoComplete="new-password"
                            autoFocus
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                            autoComplete="new-password"
                        />

                        {error && (
                            <div className="reset-password-error">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 7.5a1, 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </form>

                    <div className="reset-password-back">
                        <Link to="/" className="reset-password-back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default ResetPassword;

