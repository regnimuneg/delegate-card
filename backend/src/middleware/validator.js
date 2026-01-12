import { body, param, validationResult } from 'express-validator';

/**
 * Validation result handler
 */
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}

/**
 * Login validation rules
 */
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Claim token validation rules
 */
export const validateClaimToken = [
    body('token')
        .notEmpty()
        .trim()
        .matches(/^CLAIM-[A-Z0-9]{6}$/)
        .withMessage('Invalid claim token format'),
    handleValidationErrors
];

/**
 * Claim account validation rules
 */
export const validateClaimAccount = [
    body('token')
        .notEmpty()
        .trim()
        .matches(/^CLAIM-[A-Z0-9]{6}$/)
        .withMessage('Invalid claim token format'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

/**
 * Voucher claim validation rules
 * Note: voucherId comes from URL params, not body
 */
export const validateVoucherClaim = [
    param('id')
        .isUUID()
        .withMessage('Valid voucher ID is required'),
    handleValidationErrors
];

/**
 * Reward activation validation rules
 */
export const validateRewardActivation = [
    body('rewardType')
        .isIn(['lunch', 'dinner', 'snack', 'merch'])
        .withMessage('Invalid reward type'),
    handleValidationErrors
];

/**
 * Request password reset validation rules
 */
export const validatePasswordResetRequest = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    handleValidationErrors
];

/**
 * Reset password validation rules
 */
export const validatePasswordReset = [
    body('token')
        .notEmpty()
        .trim()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

