/**
 * API Client for NIMUN Card System
 * Handles all API requests to the backend
 */

// Use environment variable if set, otherwise detect from current hostname
// This allows mobile devices to connect to the backend on the same network
function getApiBaseUrl() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Get the current hostname (works for both localhost and network IP)
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // In production (Vercel), backend is on Render (different domain)
    // In development, use port 3000 for backend
    if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('192.168.')) {
        return `${protocol}//${hostname}:3000/api`;
    }
    
    // Production: should have VITE_API_URL set, but fallback to same domain
    // This won't work in production, so VITE_API_URL must be set
    return `${protocol}//${hostname}/api`;
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
    return localStorage.getItem('nimun_token');
}

/**
 * Set auth token in localStorage
 */
function setAuthToken(token) {
    localStorage.setItem('nimun_token', token);
}

/**
 * Remove auth token from localStorage
 */
function removeAuthToken() {
    localStorage.removeItem('nimun_token');
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 (unauthorized) - clear token and redirect to login
            if (response.status === 401) {
                removeAuthToken();
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * API Methods
 */
export const api = {
    // Authentication
    async login(email, password) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        if (response.success && response.token) {
            setAuthToken(response.token);
        }
        return response;
    },

    async validateClaimToken(token) {
        return apiRequest('/auth/claim/validate', {
            method: 'POST',
            body: { token }
        });
    },

    async claimAccount(token, password) {
        const response = await apiRequest('/auth/claim/complete', {
            method: 'POST',
            body: { token, password }
        });
        if (response.success && response.token) {
            setAuthToken(response.token);
        }
        return response;
    },

    async getCurrentUser() {
        return apiRequest('/auth/me');
    },

    logout() {
        removeAuthToken();
    },

    // Vouchers
    async getVouchers() {
        return apiRequest('/vouchers');
    },

    async claimVoucher(voucherId) {
        return apiRequest(`/vouchers/${voucherId}/claim`, {
            method: 'POST'
        });
    },

    // Rewards
    async activateReward(rewardType) {
        return apiRequest('/rewards/activate', {
            method: 'POST',
            body: { rewardType }
        });
    },

    async verifyRewardToken(token) {
        return apiRequest(`/rewards/verify/${token}`);
    },

    // Dashboard
    async getAttendance(limit = 50) {
        return apiRequest(`/dashboard/attendance?limit=${limit}`);
    },

    async getFoodHistory(limit = 50) {
        return apiRequest(`/dashboard/food?limit=${limit}`);
    },

    async getActivityTimeline(limit = 50) {
        return apiRequest(`/dashboard/activity?limit=${limit}`);
    },

    // Profile
    async updateProfilePhoto(photoUrl) {
        return apiRequest('/profile/photo', {
            method: 'PUT',
            body: { photoUrl }
        });
    },

    // Password Reset
    async requestPasswordReset(email) {
        return apiRequest('/auth/password/reset/request', {
            method: 'POST',
            body: { email }
        });
    },

    async verifyResetToken(token) {
        return apiRequest('/auth/password/reset/verify', {
            method: 'POST',
            body: { token }
        });
    },

    async resetPassword(token, password) {
        return apiRequest('/auth/password/reset', {
            method: 'POST',
            body: { token, password }
        });
    },

    // Analytics
    async getUserVoucherUsage(delegateId) {
        return apiRequest(`/analytics/vouchers/user/${delegateId}`);
    },

    async getVendorUsage(vendorName) {
        return apiRequest(`/analytics/vouchers/vendor/${encodeURIComponent(vendorName)}`);
    },

    async getVoucherSummary() {
        return apiRequest('/analytics/vouchers/summary');
    }
};

export default api;

