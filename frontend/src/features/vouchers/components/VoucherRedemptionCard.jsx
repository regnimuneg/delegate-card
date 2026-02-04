import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../../shared/components';
import './VoucherRedemptionCard.css';

// Icon SVG mapping
const VoucherIcon = ({ type }) => {
    const icons = {
        coffee: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
        ),
        snack: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
        ),
        merch: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        photo: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
        ),
        lounge: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
                <path d="M4 18v2" />
                <path d="M20 18v2" />
                <path d="M12 4v9" />
            </svg>
        ),
        default: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        )
    };
    return icons[type] || icons.default;
};

/**
 * VoucherRedemptionCard Component
 * Displays a redemption card that looks like the delegate card
 * Center of attention when a voucher is redeemed
 * Features: countdown timer, toggle between QR and info view
 */
export function VoucherRedemptionCard({ claim, onDismiss }) {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [copied, setCopied] = useState(false);

    const vendorName = claim?.vendorName;
    const icon = claim?.icon;
    const description = claim?.description;
    const expiresAt = claim?.expiresAt;
    const staticCode = claim?.staticCode;

    // Timer effect with auto-close on expiry
    useEffect(() => {
        if (!expiresAt) return;

        const updateTimer = () => {
            const remaining = Math.max(0, expiresAt - Date.now());
            setTimeRemaining(remaining);

            // Auto-dismiss when expired (after 3 second delay)
            if (remaining <= 0) {
                setTimeout(() => {
                    if (onDismiss) {
                        onDismiss();
                    }
                }, 3000);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, onDismiss]);

    if (!claim) return null;

    const isExpired = timeRemaining <= 0;
    const isWarning = timeRemaining > 0 && timeRemaining < 60000; // Less than 1 minute

    // Format time remaining
    const formatTime = (ms) => {
        if (ms <= 0) return '00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress for timer bar (15 min = 900000ms)
    const totalDuration = 5 * 60 * 1000; // 5 minutes
    const progress = Math.min(100, (timeRemaining / totalDuration) * 100);

    // Handle copy to clipboard
    const handleCopyCode = async () => {
        if (!staticCode) return;

        try {
            await navigator.clipboard.writeText(staticCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="voucher-redemption-overlay">
            <div className="voucher-redemption-backdrop" onClick={onDismiss}></div>
            <div className="voucher-redemption-container">
                <Card variant="blue" padding="large" glow className={`voucher-redemption-card ${isExpired ? 'voucher-redemption-card--expired' : ''}`}>
                    <div className="voucher-redemption-card-inner">
                        {/* Header with NIMUN branding */}
                        <div className="voucher-redemption-card-header">
                            <span className="voucher-redemption-card-brand">NIMUN'26</span>
                            <span className="voucher-redemption-card-type">VOUCHER</span>
                            {/* User Name - for vendor verification */}
                            {claim.userName && (
                                <div className="voucher-redemption-user-name">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>{claim.userName}</span>
                                </div>
                            )}
                        </div>

                        {/* Timer Section */}
                        {!isExpired && (
                            <div className={`voucher-redemption-timer ${isWarning ? 'voucher-redemption-timer--warning' : ''}`}>
                                <div className="voucher-redemption-timer-display">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span className="voucher-redemption-timer-value">{formatTime(timeRemaining)}</span>
                                </div>
                                <div className="voucher-redemption-timer-bar">
                                    <div
                                        className="voucher-redemption-timer-bar-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="voucher-redemption-timer-label">Time remaining</span>
                            </div>
                        )}


                        {/* Content Area - Info View Only */}
                        <div className="voucher-redemption-content">
                            <div className="voucher-redemption-info">
                                <div className="voucher-redemption-info-icon">
                                    {icon && (icon.startsWith('/') || icon.startsWith('http')) ? (
                                        <img src={icon} alt={vendorName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <VoucherIcon type={icon || 'default'} />
                                    )}
                                </div>
                                <h2 className="voucher-redemption-info-name">{vendorName}</h2>

                                {/* Static Code Display - PROMINENT */}
                                {staticCode && (
                                    <div className="voucher-redemption-static-code">
                                        <label>Activation Code</label>
                                        <div className="static-code-value">
                                            {staticCode}
                                        </div>
                                        <button
                                            onClick={handleCopyCode}
                                            className="static-code-copy"
                                        >
                                            {copied ? (
                                                <>✓ Copied!</>
                                            ) : (
                                                <>📋 Copy Code</>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {description && (
                                    <p className="voucher-redemption-info-desc">{description}</p>
                                )}

                                {/* Different hint based on whether static code exists */}
                                <div className="voucher-redemption-info-hint">
                                    {staticCode ? (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                            </svg>
                                            Use this code when ordering online or in-store
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Show this to vendor for visual verification
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button className="voucher-redemption-card-close" onClick={onDismiss}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </Card>
            </div>
        </div>
    );
}

export default VoucherRedemptionCard;

