import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../../../shared/components';
import './Login.css';

/**
 * Login Page
 * For returning delegates who have already claimed their account
 */
export function Login() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page page-center">
            <div className="login-container animate-slide-up">
                {/* Logo/Brand Header */}
                <div className="login-brand">
                    <div className="login-logo">
                        <span className="login-logo-text">NIMUN</span>
                        <span className="login-logo-year">'26</span>
                    </div>
                    <p className="login-tagline">Delegate Portal</p>
                </div>

                {/* Login Card */}
                <Card variant="elevated" padding="large" className="login-card">
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to access your delegate dashboard</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />

                        {error && (
                            <div className="login-error">
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
                            Sign In
                        </Button>
                    </form>

                    <div className="login-divider">
                        <span>or</span>
                    </div>

                    <div className="login-claim-prompt">
                        <p>First time here?</p>
                        <Link to="/claim" className="login-claim-link">
                            Claim your account with your token
                        </Link>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <div className="login-demo">
                    <p>Demo: sarah.ibrahim@example.com / demo123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
