import { Button } from '../../../shared/components';
import './VoucherClaimModal.css';

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
 * VoucherClaimModal Component
 * Simple confirmation modal for claiming a voucher
 * QR code and timer are displayed in the dashboard via ActiveClaimDisplay
 */
export function VoucherClaimModal({
    voucher,
    isLoading,
    onConfirm,
    onClose
}) {
    if (!voucher) return null;

    const { name, icon, description, remaining, limit } = voucher;

    // Calculate remaining after this claim
    const remainingAfterClaim = limit !== null ? remaining - 1 : null;

    return (
        <div className="voucher-modal-backdrop" onClick={onClose}>
            <div
                className="voucher-modal"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="voucher-modal-header">
                    <span className="voucher-modal-icon">
                        {icon && (icon.startsWith('/') || icon.startsWith('http')) ? (
                            <img src={icon} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                        ) : (
                            <VoucherIcon type={icon || 'default'} />
                        )}
                    </span>
                    <h3 className="voucher-modal-title">Activate Voucher</h3>
                </div>

                <div className="voucher-modal-content">
                    <div className="voucher-modal-vendor">
                        <span className="voucher-modal-vendor-name">{name}</span>
                        <p className="voucher-modal-vendor-desc">{description}</p>
                    </div>

                    {limit !== null && (
                        <div className="voucher-modal-usage">
                            <div className="voucher-modal-usage-row">
                                <span className="voucher-modal-usage-label">Remaining uses:</span>
                                <span className="voucher-modal-usage-value">{remaining}/{limit}</span>
                            </div>
                            {remainingAfterClaim === 0 && (
                                <div className="voucher-modal-usage-row voucher-modal-usage-row--after">
                                    <span className="voucher-modal-usage-warning">This is your last use!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {limit === null && (
                        <div className="voucher-modal-unlimited">
                            <span className="voucher-modal-unlimited-icon">∞</span>
                            Unlimited uses available
                        </div>
                    )}
                </div>

                <div className="voucher-modal-actions">
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Activating...' : 'Confirm Activation'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VoucherClaimModal;
