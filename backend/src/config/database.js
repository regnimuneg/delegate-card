import { supabase, supabaseAdmin } from '../db/supabase.js';

/**
 * Database helper functions
 */

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        // Try a simple query to verify connection
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        if (error) {
            // Check for specific error types
            if (error.message.includes('relation "users" does not exist') || 
                error.message.includes("Could not find the table 'public.users'")) {
                return { 
                    success: false, 
                    error: 'Database schema not found!\n\n' +
                           '   📋 Action required:\n' +
                           '   1. Go to Supabase Dashboard → SQL Editor\n' +
                           '   2. Open: backend/src/db/schema.sql\n' +
                           '   3. Copy the entire file content\n' +
                           '   4. Paste in SQL Editor and click "Run"\n' +
                           '   5. Wait for "Success. No rows returned" message\n\n' +
                           '   This will create all required tables (users, delegates, vouchers, etc.)'
                };
            }
            if (error.message.includes('JWT')) {
                return { 
                    success: false, 
                    error: 'Invalid API key. Check SUPABASE_ANON_KEY in .env file.' 
                };
            }
            if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND')) {
                return { 
                    success: false, 
                    error: 'Cannot connect to Supabase. Check SUPABASE_URL in .env file (should start with https://).' 
                };
            }
            throw error;
        }
        
        return { success: true };
    } catch (error) {
        // Handle connection errors
        if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND')) {
            return { 
                success: false, 
                error: `Cannot resolve Supabase hostname. Check SUPABASE_URL in .env file.\n   Current: ${process.env.SUPABASE_URL || 'Not set'}\n   Should be: https://xxxxx.supabase.co` 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Unknown database connection error' 
        };
    }
}

/**
 * Get delegate by ID (council-based ID like HRC-01)
 */
export async function getDelegateById(delegateId) {
    const { data, error } = await supabaseAdmin
        .from('delegates')
        .select(`
            *,
            users:users!delegates_user_id_fkey (
                id,
                email,
                first_name,
                last_name,
                date_of_birth,
                photo_url
            )
        `)
        .eq('id', delegateId)
        .maybeSingle(); // Use maybeSingle() to handle no results gracefully

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
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (userError) {
        return null;
    }
    
    if (!user) {
        return null;
    }

    const { data: delegate, error: delegateError } = await supabaseAdmin
        .from('delegates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

    if (delegateError) {
        throw delegateError;
    }
    
    if (!delegate) {
        return null;
    }

    return {
        ...user,
        ...delegate
    };
}


/**
 * Get member by email
 */
export async function getMemberByEmail(email) {
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('user_type', 'member')
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (userError) {
        return null;
    }
    
    if (!user) {
        return null;
    }

    const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

    if (memberError) {
        throw memberError;
    }
    
    if (!member) {
        return null;
    }

    return {
        ...user,
        ...member
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
            users:users!delegates_user_id_fkey (
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
 * Get attendance statistics for a delegate
 * Calculates days attended and attendance rate from delegates table
 */
export async function getAttendanceStats(delegateId) {
    const { data: delegate, error } = await supabaseAdmin
        .from('delegates')
        .select(`
            opening_ceremony_attended,
            day1_session_attended,
            day2_session_attended,
            day3_session_attended,
            day4_session_attended,
            conf_day1_attended,
            conf_day2_attended,
            conf_day3_attended
        `)
        .eq('id', delegateId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!delegate) {
        return {
            daysAttended: 0,
            totalDays: 9,
            attendanceRate: 0
        };
    }

    // Count attended days (9 total: 4 session days + 1 opening + 3 conference days)
    const daysAttended = [
        delegate.opening_ceremony_attended,
        delegate.day1_session_attended,
        delegate.day2_session_attended,
        delegate.day3_session_attended,
        delegate.day4_session_attended,
        delegate.conf_day1_attended,
        delegate.conf_day2_attended,
        delegate.conf_day3_attended
    ].filter(Boolean).length;

    const totalDays = 9; // 4 session days + 1 opening + 3 conference days
    const attendanceRate = Math.round((daysAttended / totalDays) * 100);

    return {
        daysAttended,
        totalDays,
        attendanceRate
    };
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
                name,
                qr_code,
                users:users!delegates_user_id_fkey (
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
    getAttendanceStats,
    getMemberByEmail,
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

