import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'voucher_active_claims';

/**
 * Get storage key for a specific delegate
 */
const getStorageKey = (delegateId) => {
    return delegateId ? `${STORAGE_KEY}_${delegateId}` : STORAGE_KEY;
};

/**
 * Load claims from localStorage
 */
const loadClaimsFromStorage = (delegateId) => {
    try {
        const key = getStorageKey(delegateId);
        const stored = localStorage.getItem(key);
        if (!stored) return [];

        const claims = JSON.parse(stored);
        const now = Date.now();

        // Filter out expired claims
        return claims.filter(claim => claim.expiresAt > now);
    } catch (error) {
        console.error('Failed to load active claims from storage:', error);
        return [];
    }
};

/**
 * Save claims to localStorage
 */
const saveClaimsToStorage = (claims, delegateId) => {
    try {
        const key = getStorageKey(delegateId);
        localStorage.setItem(key, JSON.stringify(claims));
    } catch (error) {
        console.error('Failed to save active claims to storage:', error);
    }
};

/**
 * Hook to manage active voucher claims with timers
 * Stores claims in state and localStorage, automatically expires them
 * Claims persist across page reloads, navigation, and logout
 * 
 * @param {string} delegateId - Optional delegate ID to namespace storage
 */
export function useActiveClaims(delegateId = null) {
    const [activeClaims, setActiveClaims] = useState(() => loadClaimsFromStorage(delegateId));

    // Save to localStorage whenever claims change
    useEffect(() => {
        saveClaimsToStorage(activeClaims, delegateId);
    }, [activeClaims, delegateId]);

    // Add a new claim
    const addClaim = useCallback((claim) => {
        setActiveClaims(prev => {
            // Remove any existing claim for the same vendor
            const filtered = prev.filter(c => c.vendorId !== claim.vendorId);
            return [...filtered, claim];
        });
    }, []);

    // Remove expired claims
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setActiveClaims(prev => {
                const filtered = prev.filter(claim => claim.expiresAt > now);
                // Only update if something changed
                return filtered.length !== prev.length ? filtered : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Get active claim for a specific voucher
    const getActiveClaim = useCallback((voucherId) => {
        const now = Date.now();
        return activeClaims.find(c => c.vendorId === voucherId && c.expiresAt > now);
    }, [activeClaims]);

    // Remove a specific claim (for manual dismiss)
    const removeClaim = useCallback((voucherId) => {
        setActiveClaims(prev => prev.filter(c => c.vendorId !== voucherId));
    }, []);

    return {
        activeClaims,
        addClaim,
        getActiveClaim,
        removeClaim
    };
}
