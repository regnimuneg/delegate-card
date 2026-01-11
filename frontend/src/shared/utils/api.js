/**
 * API Client for NIMUN Card System
 * Handles all API requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    }
};

export default api;

