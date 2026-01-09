import { Button } from '../../../shared/components';
import './VoucherClaimModal.css';

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
                    <span className="voucher-modal-icon">{icon}</span>
                    <h3 className="voucher-modal-title">Claim Voucher</h3>
                </div>

                <div className="voucher-modal-content">
                    <div className="voucher-modal-vendor">
                        <span className="voucher-modal-vendor-name">{name}</span>
                        <p className="voucher-modal-vendor-desc">{description}</p>
                    </div>

                    {limit !== null && (
                        <div className="voucher-modal-usage">
                            <div className="voucher-modal-usage-row">
                                <span className="voucher-modal-usage-label">Current remaining:</span>
                                <span className="voucher-modal-usage-value">{remaining}/{limit}</span>
                            </div>
                            <div className="voucher-modal-usage-row voucher-modal-usage-row--after">
                                <span className="voucher-modal-usage-label">After this claim:</span>
                                <span className={`voucher-modal-usage-value ${remainingAfterClaim === 0 ? 'voucher-modal-usage-value--last' : ''}`}>
                                    {remainingAfterClaim}/{limit}
                                    {remainingAfterClaim === 0 && <span className="voucher-modal-usage-warning"> (Last use!)</span>}
                                </span>
                            </div>
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
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Claiming...' : 'Confirm Claim'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VoucherClaimModal;
