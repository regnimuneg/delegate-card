import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabaseAdmin } from '../db/supabase.js';

const router = express.Router();

/**
 * GET /api/analytics/user/me
 * Get current user's voucher analytics
 * Users can view their own data
 */
router.get('/user/me', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        
        // Use the user's delegate ID
        const delegateId = user.id;
        
        // Get all voucher claims for this delegate
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                voucher_id,
                claimed_at,
                redeemed_at,
                status,
                vouchers (
                    id,
                    name,
                    vendor_name,
                    icon
                )
            `)
            .eq('delegate_id', delegateId)
            .order('claimed_at', { ascending: false });

        if (claimsError) throw claimsError;

        // Aggregate statistics
        const totalClaims = claims.length;
        const totalRedeemed = claims.filter(c => c.status === 'redeemed').length;
        const totalActive = claims.filter(c => c.status === 'active').length;
        const totalExpired = claims.filter(c => c.status === 'expired').length;

        // Group by vendor
        const vendorUsage = {};
        claims.forEach(claim => {
            if (claim.vouchers && claim.vouchers.vendor_name) {
                const vendor = claim.vouchers.vendor_name;
                if (!vendorUsage[vendor]) {
                    vendorUsage[vendor] = {
                        vendorName: vendor,
                        totalClaims: 0,
                        totalRedeemed: 0,
                        vouchers: []
                    };
                }
                vendorUsage[vendor].totalClaims++;
                if (claim.status === 'redeemed') {
                    vendorUsage[vendor].totalRedeemed++;
                }
                if (!vendorUsage[vendor].vouchers.find(v => v.id === claim.vouchers.id)) {
                    vendorUsage[vendor].vouchers.push({
                        id: claim.vouchers.id,
                        name: claim.vouchers.name,
                        icon: claim.vouchers.icon
                    });
                }
            }
        });

        res.json({
            success: true,
            summary: {
                totalClaims,
                totalRedeemed,
                totalActive,
                totalExpired
            },
            vendorUsage: Object.values(vendorUsage),
            claims: claims.map(claim => ({
                id: claim.id,
                voucherId: claim.voucher_id,
                voucherName: claim.vouchers?.name,
                vendorName: claim.vouchers?.vendor_name,
                claimedAt: claim.claimed_at,
                redeemedAt: claim.redeemed_at,
                status: claim.status
            }))
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/vouchers/user/:delegateId
 * Get total voucher usage for a specific user
 * Admin only or own data
 */
router.get('/vouchers/user/:delegateId', authenticate, async (req, res, next) => {
    try {
        const { delegateId } = req.params;
        const user = req.user;

        // Check if user is requesting their own data or is admin
        if (user.userType !== 'admin' && user.id !== delegateId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Get all voucher claims for this delegate
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                voucher_id,
                claimed_at,
                redeemed_at,
                status,
                vouchers (
                    id,
                    name,
                    vendor_name,
                    icon
                )
            `)
            .eq('delegate_id', delegateId)
            .order('claimed_at', { ascending: false });

        if (claimsError) throw claimsError;

        // Aggregate statistics
        const totalClaims = claims.length;
        const totalRedeemed = claims.filter(c => c.status === 'redeemed').length;
        const totalActive = claims.filter(c => c.status === 'active').length;
        const totalExpired = claims.filter(c => c.status === 'expired').length;

        // Group by vendor
        const vendorUsage = {};
        claims.forEach(claim => {
            if (claim.vouchers && claim.vouchers.vendor_name) {
                const vendor = claim.vouchers.vendor_name;
                if (!vendorUsage[vendor]) {
                    vendorUsage[vendor] = {
                        vendorName: vendor,
                        totalClaims: 0,
                        totalRedeemed: 0,
                        vouchers: []
                    };
                }
                vendorUsage[vendor].totalClaims++;
                if (claim.status === 'redeemed') {
                    vendorUsage[vendor].totalRedeemed++;
                }
                if (!vendorUsage[vendor].vouchers.find(v => v.id === claim.vouchers.id)) {
                    vendorUsage[vendor].vouchers.push({
                        id: claim.vouchers.id,
                        name: claim.vouchers.name,
                        icon: claim.vouchers.icon
                    });
                }
            }
        });

        res.json({
            success: true,
            delegateId,
            summary: {
                totalClaims,
                totalRedeemed,
                totalActive,
                totalExpired
            },
            vendorUsage: Object.values(vendorUsage),
            claims: claims.map(claim => ({
                id: claim.id,
                voucherId: claim.voucher_id,
                voucherName: claim.vouchers?.name,
                vendorName: claim.vouchers?.vendor_name,
                claimedAt: claim.claimed_at,
                redeemedAt: claim.redeemed_at,
                status: claim.status
            }))
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/vouchers/vendor/:vendorName
 * Get total usage for a specific vendor
 * Admin only
 */
router.get('/vouchers/vendor/:vendorName', authenticate, async (req, res, next) => {
    try {
        const { vendorName } = req.params;
        const user = req.user;

        // Admin only
        if (user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get all vouchers for this vendor
        const { data: vouchers, error: vouchersError } = await supabaseAdmin
            .from('vouchers')
            .select('id, name, vendor_name, icon')
            .eq('vendor_name', vendorName)
            .eq('is_active', true);

        if (vouchersError) throw vouchersError;

        if (!vouchers || vouchers.length === 0) {
            return res.json({
                success: true,
                vendorName,
                totalUsage: 0,
                vouchers: [],
                usageByVoucher: []
            });
        }

        const voucherIds = vouchers.map(v => v.id);

        // Get all claims for these vouchers
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                voucher_id,
                delegate_id,
                claimed_at,
                redeemed_at,
                status
            `)
            .in('voucher_id', voucherIds)
            .order('claimed_at', { ascending: false });

        // Get delegate info separately
        const delegateIds = [...new Set(claims.map(c => c.delegate_id))];
        const { data: delegates, error: delegatesError } = await supabaseAdmin
            .from('delegates')
            .select('id, name, council')
            .in('id', delegateIds);

        if (delegatesError) throw delegatesError;

        const delegateMap = {};
        delegates.forEach(d => {
            delegateMap[d.id] = d;
        });

        if (claimsError) throw claimsError;

        // Aggregate statistics
        const totalUsage = claims.length;
        const totalRedeemed = claims.filter(c => c.status === 'redeemed').length;
        const totalActive = claims.filter(c => c.status === 'active').length;

        // Group by voucher
        const usageByVoucher = {};
        vouchers.forEach(voucher => {
            usageByVoucher[voucher.id] = {
                voucherId: voucher.id,
                voucherName: voucher.name,
                icon: voucher.icon,
                totalClaims: 0,
                totalRedeemed: 0,
                totalActive: 0
            };
        });

        claims.forEach(claim => {
            if (usageByVoucher[claim.voucher_id]) {
                usageByVoucher[claim.voucher_id].totalClaims++;
                if (claim.status === 'redeemed') {
                    usageByVoucher[claim.voucher_id].totalRedeemed++;
                }
                if (claim.status === 'active') {
                    usageByVoucher[claim.voucher_id].totalActive++;
                }
            }
        });

        // Group by delegate
        const usageByDelegate = {};
        claims.forEach(claim => {
            const delegateId = claim.delegate_id;
            const delegate = delegateMap[delegateId];
            if (!usageByDelegate[delegateId]) {
                usageByDelegate[delegateId] = {
                    delegateId,
                    delegateName: delegate?.name,
                    council: delegate?.council,
                    totalClaims: 0,
                    totalRedeemed: 0
                };
            }
            usageByDelegate[delegateId].totalClaims++;
            if (claim.status === 'redeemed') {
                usageByDelegate[delegateId].totalRedeemed++;
            }
        });

        res.json({
            success: true,
            vendorName,
            summary: {
                totalUsage,
                totalRedeemed,
                totalActive,
                uniqueUsers: Object.keys(usageByDelegate).length
            },
            vouchers: vouchers.map(v => ({
                id: v.id,
                name: v.name,
                icon: v.icon
            })),
            usageByVoucher: Object.values(usageByVoucher),
            usageByDelegate: Object.values(usageByDelegate),
            recentClaims: claims.slice(0, 50).map(claim => {
                const delegate = delegateMap[claim.delegate_id];
                return {
                    id: claim.id,
                    voucherId: claim.voucher_id,
                    delegateId: claim.delegate_id,
                    delegateName: delegate?.name,
                    council: delegate?.council,
                    claimedAt: claim.claimed_at,
                    redeemedAt: claim.redeemed_at,
                status: claim.status
                };
            })
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/vouchers/summary
 * Get overall voucher usage summary
 * Admin only
 */
router.get('/vouchers/summary', authenticate, async (req, res, next) => {
    try {
        const user = req.user;

        // Admin only
        if (user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get all voucher claims
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                voucher_id,
                delegate_id,
                status,
                vouchers (
                    id,
                    name,
                    vendor_name
                )
            `);

        if (claimsError) throw claimsError;

        // Aggregate by vendor
        const vendorStats = {};
        const voucherStats = {};
        const delegateStats = {};

        claims.forEach(claim => {
            const vendorName = claim.vouchers?.vendor_name || 'Unknown';
            const voucherId = claim.voucher_id;
            const delegateId = claim.delegate_id;

            // Vendor stats
            if (!vendorStats[vendorName]) {
                vendorStats[vendorName] = {
                    vendorName,
                    totalUsage: 0,
                    totalRedeemed: 0,
                    uniqueVouchers: new Set(),
                    uniqueUsers: new Set()
                };
            }
            vendorStats[vendorName].totalUsage++;
            if (claim.status === 'redeemed') {
                vendorStats[vendorName].totalRedeemed++;
            }
            if (voucherId) vendorStats[vendorName].uniqueVouchers.add(voucherId);
            if (delegateId) vendorStats[vendorName].uniqueUsers.add(delegateId);

            // Voucher stats
            if (!voucherStats[voucherId]) {
                voucherStats[voucherId] = {
                    voucherId,
                    voucherName: claim.vouchers?.name || 'Unknown',
                    vendorName,
                    totalUsage: 0,
                    totalRedeemed: 0,
                    uniqueUsers: new Set()
                };
            }
            voucherStats[voucherId].totalUsage++;
            if (claim.status === 'redeemed') {
                voucherStats[voucherId].totalRedeemed++;
            }
            if (delegateId) voucherStats[voucherId].uniqueUsers.add(delegateId);

            // Delegate stats
            if (!delegateStats[delegateId]) {
                delegateStats[delegateId] = {
                    delegateId,
                    totalUsage: 0,
                    totalRedeemed: 0
                };
            }
            delegateStats[delegateId].totalUsage++;
            if (claim.status === 'redeemed') {
                delegateStats[delegateId].totalRedeemed++;
            }
        });

        // Convert Sets to counts
        Object.values(vendorStats).forEach(stat => {
            stat.uniqueVouchers = stat.uniqueVouchers.size;
            stat.uniqueUsers = stat.uniqueUsers.size;
        });

        Object.values(voucherStats).forEach(stat => {
            stat.uniqueUsers = stat.uniqueUsers.size;
        });

        res.json({
            success: true,
            summary: {
                totalClaims: claims.length,
                totalRedeemed: claims.filter(c => c.status === 'redeemed').length,
                totalActive: claims.filter(c => c.status === 'active').length,
                uniqueVendors: Object.keys(vendorStats).length,
                uniqueVouchers: Object.keys(voucherStats).length,
                uniqueUsers: Object.keys(delegateStats).length
            },
            vendorStats: Object.values(vendorStats).sort((a, b) => b.totalUsage - a.totalUsage),
            voucherStats: Object.values(voucherStats).sort((a, b) => b.totalUsage - a.totalUsage),
            topUsers: Object.values(delegateStats)
                .sort((a, b) => b.totalUsage - a.totalUsage)
                .slice(0, 20)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/users
 * Get analytics for all users
 * Admin only
 */
router.get('/users', authenticate, async (req, res, next) => {
    try {
        const user = req.user;

        // Admin only
        if (user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get all delegates
        const { data: delegates, error: delegatesError } = await supabaseAdmin
            .from('delegates')
            .select('id, name, council, email, users(email, first_name, last_name)')
            .order('name', { ascending: true });

        if (delegatesError) throw delegatesError;

        // Get all voucher claims
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                delegate_id,
                status,
                claimed_at,
                redeemed_at,
                vouchers (
                    vendor_name
                )
            `);

        if (claimsError) throw claimsError;

        // Calculate stats per user
        const userStats = delegates.map(delegate => {
            const userClaims = claims.filter(c => c.delegate_id === delegate.id);
            const vendorUsage = {};
            
            userClaims.forEach(claim => {
                const vendorName = claim.vouchers?.vendor_name || 'Unknown';
                if (!vendorUsage[vendorName]) {
                    vendorUsage[vendorName] = {
                        vendorName,
                        totalClaims: 0,
                        totalRedeemed: 0
                    };
                }
                vendorUsage[vendorName].totalClaims++;
                if (claim.status === 'redeemed') {
                    vendorUsage[vendorName].totalRedeemed++;
                }
            });

            return {
                delegateId: delegate.id,
                name: delegate.name,
                council: delegate.council,
                email: delegate.users?.email || delegate.email,
                summary: {
                    totalClaims: userClaims.length,
                    totalRedeemed: userClaims.filter(c => c.status === 'redeemed').length,
                    totalActive: userClaims.filter(c => c.status === 'active').length,
                    totalExpired: userClaims.filter(c => c.status === 'expired').length
                },
                vendorUsage: Object.values(vendorUsage)
            };
        });

        res.json({
            success: true,
            totalUsers: userStats.length,
            users: userStats.sort((a, b) => b.summary.totalClaims - a.summary.totalClaims)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/vendors
 * Get analytics for all vendors
 * Admin only
 */
router.get('/vendors', authenticate, async (req, res, next) => {
    try {
        const user = req.user;

        // Admin only
        if (user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get all unique vendors from vouchers
        const { data: vouchers, error: vouchersError } = await supabaseAdmin
            .from('vouchers')
            .select('id, name, vendor_name, icon, is_active')
            .eq('is_active', true);

        if (vouchersError) throw vouchersError;

        // Get all voucher claims
        const { data: claims, error: claimsError } = await supabaseAdmin
            .from('voucher_claims')
            .select(`
                id,
                voucher_id,
                delegate_id,
                status,
                claimed_at,
                redeemed_at,
                vouchers (
                    vendor_name
                )
            `);

        if (claimsError) throw claimsError;

        // Group vouchers by vendor
        const vendorMap = {};
        vouchers.forEach(voucher => {
            const vendorName = voucher.vendor_name;
            if (!vendorMap[vendorName]) {
                vendorMap[vendorName] = {
                    vendorName,
                    vouchers: [],
                    totalUsage: 0,
                    totalRedeemed: 0,
                    totalActive: 0,
                    uniqueUsers: new Set(),
                    uniqueVouchers: new Set()
                };
            }
            vendorMap[vendorName].vouchers.push({
                id: voucher.id,
                name: voucher.name,
                icon: voucher.icon
            });
            vendorMap[vendorName].uniqueVouchers.add(voucher.id);
        });

        // Calculate stats from claims
        claims.forEach(claim => {
            const vendorName = claim.vouchers?.vendor_name || 'Unknown';
            if (vendorMap[vendorName]) {
                vendorMap[vendorName].totalUsage++;
                if (claim.status === 'redeemed') {
                    vendorMap[vendorName].totalRedeemed++;
                }
                if (claim.status === 'active') {
                    vendorMap[vendorName].totalActive++;
                }
                if (claim.delegate_id) {
                    vendorMap[vendorName].uniqueUsers.add(claim.delegate_id);
                }
            }
        });

        // Convert Sets to counts
        const vendorStats = Object.values(vendorMap).map(vendor => ({
            ...vendor,
            uniqueUsers: vendor.uniqueUsers.size,
            uniqueVouchers: vendor.uniqueVouchers.size
        }));

        res.json({
            success: true,
            totalVendors: vendorStats.length,
            vendors: vendorStats.sort((a, b) => b.totalUsage - a.totalUsage)
        });
    } catch (error) {
        next(error);
    }
});

export default router;

