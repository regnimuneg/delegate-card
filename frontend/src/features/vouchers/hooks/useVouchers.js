import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/utils/api';

/**
 * useVouchers Hook
 * Manages voucher data, usage tracking, and claiming for delegates
 */
export function useVouchers(delegateId) {
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [claimingVendorId, setClaimingVendorId] = useState(null);

    // Load vouchers from API
    useEffect(() => {
        const loadVouchers = async () => {
            if (!delegateId) return;

            setIsLoading(true);
            try {
                const response = await api.getVouchers();
                if (response.success && response.vouchers) {
                    setVouchers(response.vouchers);
                }
            } catch (error) {
                console.error('Failed to load vouchers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadVouchers();
    }, [delegateId]);

    /**
     * Get remaining usages for a voucher
     * Returns: { remaining: number | null, limit: number | null, used: number }
     */
    const getRemainingUsage = useCallback((voucherId) => {
        const voucher = vouchers.find(v => v.id === voucherId);
        if (!voucher) return { remaining: 0, limit: 0, used: 0 };

        return {
            remaining: voucher.remaining,
            limit: voucher.limit,
            used: voucher.used || 0,
        };
    }, [vouchers]);

    /**
     * Claim a voucher
     * Returns: { success: boolean, error?: string, claim?: object }
     */
    const claimVoucher = useCallback(async (voucherId) => {
        const voucher = vouchers.find(v => v.id === voucherId);
        if (!voucher || !voucher.canClaim) {
            return { success: false, error: 'Voucher cannot be claimed' };
        }

        setClaimingVendorId(voucherId);
        setIsLoading(true);

        try {
            const response = await api.claimVoucher(voucherId);
            if (response.success && response.claim) {
                // Reload vouchers to get updated usage
                const vouchersResponse = await api.getVouchers();
                if (vouchersResponse.success && vouchersResponse.vouchers) {
                    setVouchers(vouchersResponse.vouchers);
                }
                setIsLoading(false);
                setClaimingVendorId(null);
                return { success: true, claim: response.claim };
            } else {
                setIsLoading(false);
                setClaimingVendorId(null);
                return { success: false, error: response.error || 'Failed to claim voucher' };
            }
        } catch (error) {
            console.error('Claim voucher error:', error);
            setIsLoading(false);
            setClaimingVendorId(null);
            return { success: false, error: error.message || 'Failed to claim voucher' };
        }
    }, [vouchers]);

    return {
        vouchers,
        isLoading,
        claimingVendorId,
        claimVoucher,
        getRemainingUsage,
    };
}

export default useVouchers;
