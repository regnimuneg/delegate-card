import { useState, useCallback } from 'react';

/**
 * Mock vendors with voucher offerings
 * limitPerDelegate: null = unlimited, number = max uses per delegate
 */
const MOCK_VENDORS = [
    {
        id: 'vendor-coffee',
        name: 'Coffee Corner',
        icon: 'C',
        description: 'Free specialty coffee or hot beverage',
        category: 'beverage',
        limitPerDelegate: 3,
    },
    {
        id: 'vendor-snacks',
        name: 'Snack Station',
        icon: 'S',
        description: 'Complimentary snack pack',
        category: 'food',
        limitPerDelegate: 2,
    },
    {
        id: 'vendor-merch',
        name: 'NIMUN Merch Shop',
        icon: 'M',
        description: 'Conference merchandise discount (20% off)',
        category: 'merchandise',
        limitPerDelegate: 1,
    },
    {
        id: 'vendor-photo',
        name: 'Photo Booth',
        icon: 'P',
        description: 'Professional delegate photo session',
        category: 'services',
        limitPerDelegate: null, // Unlimited
    },
    {
        id: 'vendor-lounge',
        name: 'VIP Lounge Access',
        icon: 'V',
        description: 'Access to exclusive delegate lounge',
        category: 'access',
        limitPerDelegate: null, // Unlimited
    },
];

/**
 * useVouchers Hook
 * Manages voucher data, usage tracking, and claiming for delegates
 */
export function useVouchers(delegateId) {
    // Track usage per vendor for this delegate
    const [usageMap, setUsageMap] = useState(() => {
        // Load from localStorage or start fresh
        const stored = localStorage.getItem(`nimun_vouchers_${delegateId}`);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return {};
            }
        }
        // Mock some initial usage for demo
        return {
            'vendor-coffee': { usedCount: 1, lastUsedAt: '2026-01-05T10:30:00Z' },
            'vendor-snacks': { usedCount: 1, lastUsedAt: '2026-01-05T12:00:00Z' },
        };
    });

    const [isLoading, setIsLoading] = useState(false);
    const [claimingVendorId, setClaimingVendorId] = useState(null);

    /**
     * Get remaining usages for a vendor
     * Returns: { remaining: number | null, limit: number | null, used: number }
     */
    const getRemainingUsage = useCallback((vendorId) => {
        const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
        if (!vendor) return { remaining: 0, limit: 0, used: 0 };

        const usage = usageMap[vendorId] || { usedCount: 0 };

        if (vendor.limitPerDelegate === null) {
            // Unlimited
            return { remaining: null, limit: null, used: usage.usedCount };
        }

        const remaining = Math.max(0, vendor.limitPerDelegate - usage.usedCount);
        return {
            remaining,
            limit: vendor.limitPerDelegate,
            used: usage.usedCount,
        };
    }, [usageMap]);

    /**
     * Get all available vouchers with their usage info
     */
    const getAvailableVouchers = useCallback(() => {
        return MOCK_VENDORS.map(vendor => {
            const usageInfo = getRemainingUsage(vendor.id);
            const isExhausted = usageInfo.remaining === 0 && usageInfo.limit !== null;

            return {
                ...vendor,
                ...usageInfo,
                isExhausted,
                canClaim: !isExhausted,
            };
        });
    }, [getRemainingUsage]);

    /**
     * Claim a voucher from a vendor
     * Returns: { success: boolean, error?: string }
     */
    const claimVoucher = useCallback(async (vendorId) => {
        const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
        if (!vendor) {
            return { success: false, error: 'Vendor not found' };
        }

        const usageInfo = getRemainingUsage(vendorId);
        if (usageInfo.remaining === 0 && usageInfo.limit !== null) {
            return { success: false, error: 'You have reached the usage limit for this voucher' };
        }

        setClaimingVendorId(vendorId);
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update usage
        const newUsageMap = {
            ...usageMap,
            [vendorId]: {
                usedCount: (usageMap[vendorId]?.usedCount || 0) + 1,
                lastUsedAt: new Date().toISOString(),
            },
        };

        setUsageMap(newUsageMap);
        localStorage.setItem(`nimun_vouchers_${delegateId}`, JSON.stringify(newUsageMap));

        setIsLoading(false);
        setClaimingVendorId(null);

        return { success: true };
    }, [delegateId, usageMap, getRemainingUsage]);

    return {
        vouchers: getAvailableVouchers(),
        isLoading,
        claimingVendorId,
        claimVoucher,
        getRemainingUsage,
    };
}

export default useVouchers;
