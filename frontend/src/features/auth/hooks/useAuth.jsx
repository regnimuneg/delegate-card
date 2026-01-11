import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../shared/utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('nimun_token');
            if (token) {
                try {
                    const response = await api.getCurrentUser();
                    if (response.success && response.user) {
                        setUser(response.user);
                    } else {
                        // Invalid token, clear it
                        api.logout();
                    }
                } catch (error) {
                    // Token invalid or expired
                    api.logout();
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    // Persist user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('nimun_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('nimun_user');
        }
    }, [user]);

    /**
     * Login with email/password
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.login(email, password);
            if (response.success && response.user) {
                setUser(response.user);
                setIsLoading(false);
                return { success: true };
            } else {
                setIsLoading(false);
                return { success: false, error: response.error || 'Login failed' };
            }
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    /**
     * Validate a claim token
     * @returns {Promise<{success: boolean, delegate?: object, error?: string}>}
     */
    const validateClaimToken = async (token) => {
        setIsLoading(true);
        try {
            const response = await api.validateClaimToken(token);
            setIsLoading(false);
            return response;
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: error.message || 'Invalid claim token' };
        }
    };

    /**
     * Complete account claiming with password setup
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const claimAccount = async (token, password) => {
        setIsLoading(true);
        try {
            const response = await api.claimAccount(token, password);
            if (response.success && response.user) {
                setUser(response.user);
                setIsLoading(false);
                return { success: true };
            } else {
                setIsLoading(false);
                return { success: false, error: response.error || 'Account claiming failed' };
            }
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: error.message || 'Account claiming failed' };
        }
    };

    /**
     * Logout and clear session
     */
    const logout = () => {
        setUser(null);
        api.logout();
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        validateClaimToken,
        claimAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
