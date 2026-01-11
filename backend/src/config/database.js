import { supabase, supabaseAdmin } from '../db/supabase.js';

/**
 * Database helper functions
 */

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Database connection error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get delegate by ID
 */
export async function getDelegateById(delegateId) {
    const { data, error } = await supabaseAdmin
        .from('delegates')
        .select(`
            *,
            users:users!delegates_id_fkey (
                id,
                email,
                first_name,
                last_name,
                date_of_birth,
                photo_url
            )
        `)
        .eq('id', delegateId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get delegate by email
 */
export async function getDelegateByEmail(email) {
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('user_type', 'delegate')
        .single();

    if (userError || !user) return null;

    const { data: delegate, error: delegateError } = await supabaseAdmin
        .from('delegates')
        .select('*')
        .eq('id', user.id)
        .single();

    if (delegateError) throw delegateError;

    return {
        ...user,
        ...delegate
    };
}

/**
 * Get delegate by claim token
 */
export async function getDelegateByClaimToken(token) {
    const { data, error } = await supabaseAdmin
        .from('delegates')
        .select(`
            *,
            users:users!delegates_id_fkey (
                id,
                email,
                first_name,
                last_name,
                date_of_birth,
                photo_url
            )
        `)
        .eq('claim_token', token.toUpperCase())
        .eq('claim_token_used', false)
        .single();

    if (error) return null;
    return data;
}

/**
 * Create new delegate
 */
export async function createDelegate(delegateData) {
    const { data, error } = await supabaseAdmin
        .from('delegates')
        .insert(delegateData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update delegate
 */
export async function updateDelegate(delegateId, updates) {
    const { data, error } = await supabaseAdmin
        .from('delegates')
        .update(updates)
        .eq('id', delegateId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get vouchers for delegate
 */
export async function getVouchersForDelegate(delegateId) {
    // Get all active vouchers
    const { data: vouchers, error: vouchersError } = await supabaseAdmin
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (vouchersError) throw vouchersError;

    // Get delegate's claims
    const { data: claims, error: claimsError } = await supabaseAdmin
        .from('voucher_claims')
        .select('*')
        .eq('delegate_id', delegateId)
        .order('claimed_at', { ascending: false });

    if (claimsError) throw claimsError;

    // Combine vouchers with claim data
    return vouchers.map(voucher => {
        const delegateClaims = claims.filter(c => c.voucher_id === voucher.id);
        const used = delegateClaims.length;
        const remaining = voucher.usage_limit ? voucher.usage_limit - used : null;

        return {
            ...voucher,
            used,
            remaining,
            limit: voucher.usage_limit,
            isExhausted: voucher.usage_limit ? remaining <= 0 : false,
            canClaim: voucher.usage_limit ? remaining > 0 : true
        };
    });
}

/**
 * Create voucher claim
 */
export async function createVoucherClaim(delegateId, voucherId, qrToken, expiresAt) {
    const { data, error } = await supabaseAdmin
        .from('voucher_claims')
        .insert({
            delegate_id: delegateId,
            voucher_id: voucherId,
            qr_token: qrToken,
            qr_expires_at: expiresAt,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get attendance records for delegate
 */
export async function getAttendanceRecords(delegateId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('attendance_records')
        .select('*')
        .eq('delegate_id', delegateId)
        .order('session_date', { ascending: false })
        .order('check_in_time', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Get food history for delegate
 */
export async function getFoodHistory(delegateId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('food_history')
        .select('*')
        .eq('delegate_id', delegateId)
        .order('claimed_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Get activity timeline for user
 */
export async function getActivityTimeline(userId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('activity_timeline')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Create activity timeline entry
 */
export async function createActivityEntry(userId, activityData) {
    const { data, error } = await supabaseAdmin
        .from('activity_timeline')
        .insert({
            user_id: userId,
            ...activityData
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create reward activation
 */
export async function createRewardActivation(delegateId, rewardData) {
    const { data, error } = await supabaseAdmin
        .from('reward_activations')
        .insert({
            delegate_id: delegateId,
            ...rewardData
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get active reward activation by QR token
 */
export async function getRewardActivationByToken(qrToken) {
    const { data, error } = await supabaseAdmin
        .from('reward_activations')
        .select(`
            *,
            delegates:delegates!reward_activations_delegate_id_fkey (
                id,
                qr_slug,
                users:users!delegates_id_fkey (
                    first_name,
                    last_name
                )
            )
        `)
        .eq('qr_token', qrToken)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error) return null;
    return data;
}

export default {
    testConnection,
    getDelegateById,
    getDelegateByEmail,
    getDelegateByClaimToken,
    createDelegate,
    updateDelegate,
    getVouchersForDelegate,
    createVoucherClaim,
    getAttendanceRecords,
    getFoodHistory,
    getActivityTimeline,
    createActivityEntry,
    createRewardActivation,
    getRewardActivationByToken
};

