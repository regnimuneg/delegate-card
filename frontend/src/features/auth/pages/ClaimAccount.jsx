import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../../../shared/components';
import './ClaimAccount.css';

/**
 * Claim Account Page
 * For new delegates activating their account with a claim token
 */
export function ClaimAccount() {
    const navigate = useNavigate();
    const { validateClaimToken, claimAccount, isLoading } = useAuth();

    const [step, setStep] = useState('token'); // 'token' | 'password'
    const [token, setToken] = useState('');
    const [delegate, setDelegate] = useState(null);
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleTokenSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token.trim()) {
            setError('Please enter your claim token');
            return;
        }

        const result = await validateClaimToken(token);

        if (result.success) {
            setDelegate(result.delegate);
            setStep('password');
        } else {
            setError(result.error);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (passwords.password !== passwords.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await claimAccount(token, passwords.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="claim-page page-center">
            <div className="claim-container animate-slide-up">
                {/* Logo/Brand Header */}
                <div className="claim-brand">
                    <div className="claim-logo">
                        <span className="claim-logo-text">NIMUN</span>
                        <span className="claim-logo-year">'26</span>
                    </div>
                    <p className="claim-tagline">Claim Your Account</p>
                </div>

                {/* Step Indicator */}
                <div className="claim-steps">
                    <div className={`claim-step ${step === 'token' ? 'active' : 'completed'}`}>
                        <span className="claim-step-number">1</span>
                        <span className="claim-step-label">Verify Token</span>
                    </div>
                    <div className="claim-step-connector" />
                    <div className={`claim-step ${step === 'password' ? 'active' : ''}`}>
                        <span className="claim-step-number">2</span>
                        <span className="claim-step-label">Set Password</span>
                    </div>
                </div>

                {/* Token Step */}
                {step === 'token' && (
                    <Card variant="elevated" padding="large" className="claim-card">
                        <h1 className="claim-title">Enter Your Token</h1>
                        <p className="claim-subtitle">
                            Enter the claim token from your delegate card or registration email
                        </p>

                        <form onSubmit={handleTokenSubmit} className="claim-form">
                            <Input
                                label="Claim Token"
                                type="text"
                                name="token"
                                value={token}
                                onChange={(e) => {
                                    setToken(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                placeholder="CLAIM-XXXXXX"
                                required
                                autoComplete="off"
                                style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />

                            {error && (
                                <div className="claim-error">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 7.5a1 1 0 100-2 1 1 0 000 2z" />
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
                                Verify Token
                            </Button>
                        </form>

                        <div className="claim-login-prompt">
                            <p>Already claimed your account?</p>
                            <Link to="/" className="claim-login-link">
                                Sign in instead
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Password Step */}
                {step === 'password' && delegate && (
                    <Card variant="elevated" padding="large" className="claim-card">
                        <div className="claim-welcome">
                            <div className="claim-welcome-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 11.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h1 className="claim-title">
                                Welcome, {delegate.firstName}!
                            </h1>
                            <p className="claim-subtitle">
                                You're joining <strong>{delegate.committee}</strong> in the {delegate.council}
                            </p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="claim-form">
                            <Input
                                label="Create Password"
                                type="password"
                                name="password"
                                value={passwords.password}
                                onChange={handlePasswordChange}
                                placeholder="At least 6 characters"
                                required
                                autoComplete="new-password"
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Re-enter your password"
                                required
                                autoComplete="new-password"
                            />

                            {error && (
                                <div className="claim-error">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1 7.5a1 1 0 100-2 1 1 0 000 2z" />
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
                                Complete Setup
                            </Button>
                        </form>

                        <button
                            className="claim-back-btn"
                            onClick={() => setStep('token')}
                            type="button"
                        >
                            ← Use a different token
                        </button>
                    </Card>
                )}

                {/* Demo Token */}
                <div className="claim-demo">
                    <p>Demo Token: CLAIM-ABC123</p>
                </div>
            </div>
        </div>
    );
}

export default ClaimAccount;
