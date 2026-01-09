import { Button } from '../../../shared/components';
import './VoucherCard.css';

/**
 * VoucherCard Component
 * Displays a single voucher with vendor info and remaining usage
 */
export function VoucherCard({
    voucher,
    onClaim,
    isClaiming = false
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

    // Determine status for styling
    const getStatus = () => {
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
            <div className="voucher-card-header">
                <span className="voucher-card-icon">{icon}</span>
                <div className="voucher-card-vendor">
                    <h4 className="voucher-card-name">{name}</h4>
                    {formatRemaining()}
                </div>
            </div>

            <p className="voucher-card-description">{description}</p>

            <div className="voucher-card-footer">
                {used > 0 && (
                    <span className="voucher-card-used">
                        Used {used} time{used !== 1 ? 's' : ''}
                    </span>
                )}

                <Button
                    variant={canClaim ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => onClaim(voucher)}
                    disabled={!canClaim || isClaiming}
                    className="voucher-card-claim-btn"
                >
                    {isClaiming ? 'Claiming...' : isExhausted ? 'Limit Reached' : 'Claim'}
                </Button>
            </div>
        </div>
    );
}

export default VoucherCard;
