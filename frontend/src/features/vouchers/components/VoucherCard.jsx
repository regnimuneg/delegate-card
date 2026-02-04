import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components';
import './VoucherCard.css';

// Icon SVG mapping
const VoucherIcon = ({ type }) => {
    const icons = {
        coffee: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
        ),
        snack: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
        ),
        merch: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        photo: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
        ),
        lounge: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
                <path d="M4 18v2" />
                <path d="M20 18v2" />
                <path d="M12 4v9" />
            </svg>
        ),
        default: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        )
    };
    return icons[type] || icons.default;
};

/**
 * VoucherCard Component
 * Displays a single voucher with vendor info and remaining usage
 * Now supports active claim display with timer
 */
export function VoucherCard({
    voucher,
    onClaim,
    isClaiming = false,
    activeClaim,
    onClaimClick
}) {
    const {
        id,
        name,
        icon,
        description,
        remaining,
        limit,
        used,
        isExhausted,
        canClaim,
    } = voucher;

    const [timeRemaining, setTimeRemaining] = useState(0);

    // Update timer for active claim
    useEffect(() => {
        if (!activeClaim) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, activeClaim.expiresAt - Date.now());
            setTimeRemaining(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [activeClaim]);

    const isActive = activeClaim && timeRemaining > 0;

    // Format time remaining
    const formatTime = (ms) => {
        if (ms <= 0) return '00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Determine status for styling
    const getStatus = () => {
        if (isActive) return 'active';
        if (isExhausted) return 'exhausted';
        if (limit !== null && remaining <= 1) return 'limited';
        return 'available';
    };

    const status = getStatus();

    // Format remaining usage display
    const formatRemaining = () => {
        if (limit === null) {
            return (
                <span className="voucher-usage voucher-usage--unlimited">
                    <span className="voucher-usage-icon">∞</span>
                    Unlimited
                </span>
            );
        }

        if (isExhausted) {
            return (
                <span className="voucher-usage voucher-usage--exhausted">
                    <span className="voucher-usage-count">0/{limit}</span>
                    No uses left
                </span>
            );
        }

        return (
            <span className={`voucher-usage voucher-usage--${status}`}>
                <span className="voucher-usage-count">{remaining}/{limit}</span>
                {remaining === 1 ? 'use left' : 'uses left'}
            </span>
        );
    };

    return (
        <div className={`voucher-card voucher-card--${status}`}>
            {isActive && (
                <div className="voucher-card-active-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatTime(timeRemaining)}</span>
                </div>
            )}

            <div className="voucher-card-header">
                <div className="voucher-card-image">
                    <div className="voucher-card-icon">
                        {icon && (icon.startsWith('/') || icon.startsWith('http')) ? (
                            <img src={icon} alt={name} className="voucher-card-icon-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <VoucherIcon type={icon || 'default'} />
                        )}
                    </div>
                </div>
                <div className="voucher-card-vendor">
                    <h4 className="voucher-card-name">{name}</h4>
                    {formatRemaining()}
                </div>
            </div>

            <p className="voucher-card-description">{description}</p>

            <div className="voucher-card-footer">
                <span className="voucher-card-used">
                    {used > 0 ? `Used ${used} time${used !== 1 ? 's' : ''}` : ''}
                </span>

                <Button
                    variant={isActive ? 'primary' : canClaim ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => isActive ? onClaimClick(activeClaim) : onClaim(voucher)}
                    disabled={!canClaim && !isActive || isClaiming}
                    className="voucher-card-claim-btn"
                >
                    {isClaiming ? (
                        'Activating...'
                    ) : isActive ? (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Details
                        </>
                    ) : isExhausted ? (
                        'Used'
                    ) : (
                        'Activate'
                    )}
                </Button>
            </div>
        </div>
    );
}

export default VoucherCard;
