import { createContext, useContext, useState, useEffect } from 'react';

// Mock delegate data for development
const MOCK_DELEGATES = {
    'NIMUN-2026-001': {
        id: 'uuid-delegate-001',
        qrSlug: 'NIMUN-2026-001',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@example.com',
        photo: null,
        committee: 'DISEC',
        council: 'General Assembly',
        claimToken: 'CLAIM-ABC123',
        password: null, // Not yet claimed
        status: 'unclaimed'
    },
    'NIMUN-2026-002': {
        id: 'uuid-delegate-002',
        qrSlug: 'NIMUN-2026-002',
        firstName: 'Sarah',
        lastName: 'Ibrahim',
        email: 'sarah.ibrahim@example.com',
        photo: null,
        committee: 'SOCHUM',
        council: 'General Assembly',
        claimToken: 'CLAIM-XYZ789',
        password: 'demo123', // Already claimed
        status: 'active'
    }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('nimun_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('nimun_user');
            }
        }
        setIsLoading(false);
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

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find delegate by email
        const delegate = Object.values(MOCK_DELEGATES).find(
            d => d.email.toLowerCase() === email.toLowerCase()
        );

        if (!delegate) {
            setIsLoading(false);
            return { success: false, error: 'No account found with this email' };
        }

        if (delegate.status === 'unclaimed') {
            setIsLoading(false);
            return { success: false, error: 'Account not yet claimed. Please use your claim token first.' };
        }

        if (delegate.password !== password) {
            setIsLoading(false);
            return { success: false, error: 'Invalid password' };
        }

        // Success - set user (without sensitive data)
        const { password: _, claimToken: __, ...safeUser } = delegate;
        setUser(safeUser);
        setIsLoading(false);
        return { success: true };
    };

    /**
     * Validate a claim token
     * @returns {Promise<{success: boolean, delegate?: object, error?: string}>}
     */
    const validateClaimToken = async (token) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const delegate = Object.values(MOCK_DELEGATES).find(
            d => d.claimToken === token.toUpperCase()
        );

        setIsLoading(false);

        if (!delegate) {
            return { success: false, error: 'Invalid claim token' };
        }

        if (delegate.status === 'active') {
            return { success: false, error: 'This account has already been claimed' };
        }

        const { password: _, claimToken: __, ...safeDelegate } = delegate;
        return { success: true, delegate: safeDelegate };
    };

    /**
     * Complete account claiming with password setup
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const claimAccount = async (token, password) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const delegateKey = Object.keys(MOCK_DELEGATES).find(
            key => MOCK_DELEGATES[key].claimToken === token.toUpperCase()
        );

        if (!delegateKey) {
            setIsLoading(false);
            return { success: false, error: 'Invalid claim token' };
        }

        // Update mock data (in real app, this would be an API call)
        MOCK_DELEGATES[delegateKey].password = password;
        MOCK_DELEGATES[delegateKey].status = 'active';

        const delegate = MOCK_DELEGATES[delegateKey];
        const { password: _, claimToken: __, ...safeUser } = delegate;

        setUser(safeUser);
        setIsLoading(false);
        return { success: true };
    };

    /**
     * Logout and clear session
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('nimun_user');
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
