import { useState } from 'react';
import { VoucherCard } from './VoucherCard';
import { VoucherClaimModal } from './VoucherClaimModal';
import { useVouchers } from '../hooks/useVouchers';
import './VoucherList.css';

/**
 * VoucherList Component
 * Displays all available vouchers for a delegate to claim
 * @param {string} delegateId - The delegate's ID
 * @param {function} onClaimSuccess - Callback when a voucher is successfully claimed, receives claim data
 */
export function VoucherList({ delegateId, userName, onClaimSuccess, activeClaims = [], onClaimClick }) {
    const { vouchers, isLoading, claimingVendorId, claimVoucher } = useVouchers(delegateId);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    const handleClaimClick = (voucher) => {
        setSelectedVoucher(voucher);
    };

    const handleConfirmClaim = async () => {
        if (!selectedVoucher) return;

        const result = await claimVoucher(selectedVoucher.id);
        console.log('Claim result:', result);

        if (result.success) {
            // Notify parent with claim data for dashboard display
            if (onClaimSuccess) {
                const timestamp = Date.now();
                const claim = result.claim || {};
                const qrToken = claim.qrToken || JSON.stringify({
                    type: 'voucher_claim',
                    vendorId: selectedVoucher.id,
                    vendorName: selectedVoucher.name,
                    timestamp,
                });
                const expiresAt = claim.expiresAt ? new Date(claim.expiresAt).getTime() : timestamp + (5 * 60 * 1000); // 5 minutes

                onClaimSuccess({
                    vendorId: selectedVoucher.id,
                    vendorName: selectedVoucher.name,
                    icon: selectedVoucher.icon,
                    description: selectedVoucher.description,
                    timestamp,
                    qrToken,
                    expiresAt,
                    staticCode: claim.staticCode || null,  // Include static code from backend
                    userName: userName || 'Delegate'  // Include user name for vendor verification
                });
            }
            // Close the confirmation modal
            setSelectedVoucher(null);
        }
    };

    const handleCloseModal = () => {
        setSelectedVoucher(null);
    };

    // Separate available and exhausted vouchers
    const availableVouchers = vouchers.filter(v => v.canClaim);
    const exhaustedVouchers = vouchers.filter(v => !v.canClaim);

    return (
        <div className="voucher-list">
            <div className="voucher-list-header">
                <span className="voucher-list-count">
                    {availableVouchers.length} ready to activate
                </span>
            </div>

            {vouchers.length === 0 ? (
                <div className="voucher-list-empty">
                    <span className="voucher-list-empty-icon">🎫</span>
                    <p>No vouchers available at this time</p>
                </div>
            ) : (
                <>
                    {/* Available Vouchers */}
                    {availableVouchers.length > 0 && (
                        <div className="voucher-list-grid">
                            {availableVouchers.map(voucher => {
                                const activeClaim = activeClaims.find(c => c.vendorId === voucher.id);
                                return (
                                    <VoucherCard
                                        key={voucher.id}
                                        voucher={voucher}
                                        onClaim={handleClaimClick}
                                        isClaiming={claimingVendorId === voucher.id}
                                        activeClaim={activeClaim}
                                        onClaimClick={onClaimClick}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Exhausted Vouchers */}
                    {exhaustedVouchers.length > 0 && (
                        <div className="voucher-list-exhausted">
                            <h4 className="voucher-list-exhausted-title">
                                Limit Reached ({exhaustedVouchers.length})
                            </h4>
                            <div className="voucher-list-grid voucher-list-grid--compact">
                                {exhaustedVouchers.map(voucher => (
                                    <VoucherCard
                                        key={voucher.id}
                                        voucher={voucher}
                                        onClaim={handleClaimClick}
                                        isClaiming={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Claim Confirmation Modal (no QR code - just confirmation) */}
            {selectedVoucher && (
                <VoucherClaimModal
                    voucher={selectedVoucher}
                    isLoading={isLoading}
                    onConfirm={handleConfirmClaim}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default VoucherList;

