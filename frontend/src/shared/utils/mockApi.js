const MOCK_TOKEN = 'nimun-local-mock-token';
const USER_STORAGE_KEY = 'nimun_mock_user';
const VOUCHER_STORAGE_KEY = 'nimun_mock_voucher_usage';

export const MOCK_CREDENTIALS = {
    email: 'delegate@nimun.local',
    password: 'demo123'
};

const defaultUser = {
    id: 'HRC-01',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    email: MOCK_CREDENTIALS.email,
    firstName: 'Sarah',
    lastName: 'Ibrahim',
    name: 'Sarah Ibrahim',
    phoneNumber: '+20 100 123 4567',
    council: 'Human Rights Council',
    qrCode: 'NIMUN-2026-HRC-01',
    status: 'active',
    photo: null
};

const vouchers = [
    { id: 'coffee-corner', name: 'Coffee Corner', description: 'Free specialty coffee or hot beverage', icon: 'coffee', limit: 3, staticCode: 'NIMUN-COFFEE' },
    { id: 'snack-station', name: 'Snack Station', description: 'Complimentary snack pack', icon: 'snack', limit: 2, staticCode: 'NIMUN-SNACK' },
    { id: 'merch-shop', name: 'NIMUN Merch Shop', description: '20% off conference merchandise', icon: 'merch', limit: 1, staticCode: 'NIMUN20' },
    { id: 'photo-booth', name: 'Photo Booth', description: 'Professional delegate photo session', icon: 'photo', limit: null, staticCode: 'NIMUN-PHOTO' }
];

const activities = [
    { id: 'activity-1', activity_type: 'voucher', title: 'Voucher Claimed: Coffee Corner', description: 'Specialty coffee benefit activated', created_at: '2026-02-02T14:20:00.000Z' },
    { id: 'activity-2', activity_type: 'award', title: 'Outstanding Delegate', description: 'Awarded for excellent committee participation', created_at: '2026-02-02T12:00:00.000Z', points: 100 },
    { id: 'activity-3', activity_type: 'food', title: 'Conference Day 3 Lunch', description: 'Lunch redeemed at the Main Hall', created_at: '2026-02-02T11:30:00.000Z' },
    { id: 'activity-4', activity_type: 'attendance', title: 'Conference Day 3', description: 'Check-in', created_at: '2026-02-02T08:45:00.000Z' },
    { id: 'activity-5', activity_type: 'attendance', title: 'Conference Day 2', description: 'Check-out', created_at: '2026-02-01T17:15:00.000Z' },
    { id: 'activity-6', activity_type: 'game', title: 'Delegate Challenge', description: 'Completed the diplomacy quiz', created_at: '2026-02-01T15:10:00.000Z', points: 50 },
    { id: 'activity-7', activity_type: 'food', title: 'Conference Day 2 Breakfast', description: 'Breakfast redeemed', created_at: '2026-02-01T08:15:00.000Z' },
    { id: 'activity-8', activity_type: 'attendance', title: 'Opening Ceremony', description: 'Check-in', created_at: '2026-01-30T16:00:00.000Z' }
];

function pause() {
    return new Promise(resolve => setTimeout(resolve, 150));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || defaultUser;
    } catch {
        return defaultUser;
    }
}

function requireSession() {
    if (localStorage.getItem('nimun_token') !== MOCK_TOKEN) {
        throw new Error('Your local demo session has expired. Please sign in again.');
    }
}

function getUsage() {
    try {
        return JSON.parse(localStorage.getItem(VOUCHER_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

export const mockApi = {
    async login(email, password) {
        await pause();
        if (email.toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
            throw new Error('Use delegate@nimun.local with password demo123');
        }
        localStorage.setItem('nimun_token', MOCK_TOKEN);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
        return { success: true, token: MOCK_TOKEN, user: getUser(), userType: 'delegate' };
    },

    async getCurrentUser() {
        await pause();
        requireSession();
        return { success: true, user: getUser(), userType: 'delegate' };
    },

    logout() {
        localStorage.removeItem('nimun_token');
    },

    async validateClaimToken(token) {
        await pause();
        if (token.toUpperCase() !== 'CLAIM-DEMO') return { success: false, error: 'Use claim token CLAIM-DEMO' };
        return { success: true, userType: 'delegate', delegate: defaultUser };
    },

    async claimAccount(token) {
        const validation = await this.validateClaimToken(token);
        if (!validation.success) return validation;
        localStorage.setItem('nimun_token', MOCK_TOKEN);
        return { success: true, token: MOCK_TOKEN, user: getUser(), userType: 'delegate' };
    },

    async getVouchers() {
        await pause();
        requireSession();
        const usage = getUsage();
        return {
            success: true,
            vouchers: vouchers.map(voucher => {
                const used = usage[voucher.id] || 0;
                const remaining = voucher.limit === null ? null : Math.max(0, voucher.limit - used);
                return { ...voucher, used, remaining, isExhausted: voucher.limit !== null && remaining === 0, canClaim: voucher.limit === null || remaining > 0 };
            })
        };
    },

    async claimVoucher(voucherId) {
        await pause();
        requireSession();
        const voucher = vouchers.find(item => item.id === voucherId);
        if (!voucher) return { success: false, error: 'Voucher not found' };
        const usage = getUsage();
        if (voucher.limit !== null && (usage[voucherId] || 0) >= voucher.limit) return { success: false, error: 'Voucher limit reached' };
        usage[voucherId] = (usage[voucherId] || 0) + 1;
        localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(usage));
        return {
            success: true,
            claim: {
                id: `mock-claim-${Date.now()}`,
                voucherId,
                qrToken: `NIMUN-MOCK-${voucherId}-${Date.now()}`,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                status: 'active',
                staticCode: voucher.staticCode
            }
        };
    },

    async getAttendance() { requireSession(); return { success: true, records: [] }; },
    async getFoodHistory() { requireSession(); return { success: true, records: [] }; },
    async getAttendanceStats() { await pause(); requireSession(); return { success: true, daysAttended: 7, totalDays: 8, attendanceRate: 88, awards: 'Outstanding Delegate' }; },
    async getActivityTimeline(limit = 50) { await pause(); requireSession(); return { success: true, activities: activities.slice(0, limit) }; },

    async updateProfilePhoto(photoUrl) {
        await pause();
        requireSession();
        const user = { ...getUser(), photo: photoUrl };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return { success: true, photoUrl };
    },

    async activateReward(rewardType) { requireSession(); return { success: true, token: `mock-reward-${rewardType}` }; },
    async verifyRewardToken() { return { success: true, valid: true }; },
    async requestPasswordReset() { await pause(); return { success: true, message: 'Mock reset email sent' }; },
    async verifyResetToken(token) { await pause(); return { success: token === 'RESET-DEMO', error: token === 'RESET-DEMO' ? undefined : 'Use RESET-DEMO' }; },
    async resetPassword() { await pause(); return { success: true }; },
    async getMyAnalytics() { requireSession(); return { success: true, analytics: {} }; },
    async getUserVoucherUsage() { requireSession(); return { success: true, usage: [] }; },
    async getVendorUsage() { requireSession(); return { success: true, usage: [] }; },
    async getVoucherSummary() { requireSession(); return { success: true, summary: [] }; },
    async getAllUsersAnalytics() { requireSession(); return { success: true, users: [] }; },
    async getAllVendorsAnalytics() { requireSession(); return { success: true, vendors: [] }; }
};
