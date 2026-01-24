import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeModal } from '../../../shared/components/QRCodeModal';
import './DelegateCard.css';

/**
 * DelegateCard Component
 * Displays the user's identity card with static QR code
 * Takes full width of container - no extra box wrapper
 */
export function DelegateCard({ delegate, showQR = true }) {
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    const {
        firstName,
        lastName,
        committee,
        council,
        role,
        qrCode,
        qrSlug,
        photo
    } = delegate;

    const fullName = `${firstName} ${lastName}`;
    const delegateId = delegate.id; // Just the ID like "HRC-01", "EX-01", etc.
    const qrCodeValue = `IC'26-${delegateId}`; // QR code format: IC'26-HRC-01

    // Determine the card type based on user data
    const getCardType = () => {
        // Check if it's a member by looking for committee or role
        if (committee) {
            if (committee === 'Executive' || role?.toLowerCase().includes('executive')) {
                return 'EXECUTIVE';
            }
            if (committee === 'High Board' || role?.toLowerCase().includes('high board')) {
                return 'HIGH BOARD';
            }
            return 'MEMBER';
        }
        // Default to delegate if they have a council
        if (council) {
            return 'DELEGATE';
        }
        // Fallback based on ID prefix
        if (delegateId?.startsWith('EX-')) return 'EXECUTIVE';
        if (delegateId?.startsWith('HB-')) return 'HIGH BOARD';
        if (delegateId?.match(/^(RG|PR|SO|MD|OP)-/)) return 'MEMBER';
        return 'DELEGATE';
    };

    const cardType = getCardType();
    const groupLabel = council ? 'Council' : 'Committee';
    const groupValue = council || committee || '';

    return (
        <div className="delegate-card">
            <div className="delegate-card-inner">
                {/* Header with NIMUN branding */}
                <div className="delegate-card-header">
                    <span className="delegate-card-brand">NIMUN'26</span>
                    <span className="delegate-card-type">{cardType}</span>
                </div>

                {/* Profile Section */}
                <div className="delegate-card-profile">
                    <div className="delegate-card-avatar">
                        {photo ? (
                            <img src={photo} alt={fullName} />
                        ) : (
                            <span className="delegate-card-avatar-placeholder">
                                {firstName.charAt(0)}{lastName.charAt(0)}
                            </span>
                        )}
                    </div>
                    <h2 className="delegate-card-name">{fullName}</h2>
                </div>

                {/* Council/Committee Info */}
                <div className="delegate-card-info">
                    <div className="delegate-card-info-item delegate-card-info-item--full">
                        <span className="delegate-card-info-label">{groupLabel}</span>
                        <span className="delegate-card-info-value">{groupValue}</span>
                    </div>
                </div>

                {/* Static QR Code */}
                {showQR && (
                    <>
                        <div className="delegate-card-qr" onClick={() => setIsQRModalOpen(true)} style={{ cursor: 'pointer' }}>
                            <span className="delegate-card-qr-label">Conference Access</span>
                            <div className="delegate-card-qr-wrapper">
                                <QRCodeSVG
                                    value={qrCodeValue}
                                    size={100}
                                    bgColor="transparent"
                                    fgColor="#FFFFFF"
                                    level="M"
                                />
                            </div>
                            <span className="delegate-card-qr-slug">{delegateId}</span>
                            <span className="delegate-card-qr-hint">Click to enlarge • For attendance, meals & activities</span>
                        </div>
                        <QRCodeModal
                            qrValue={qrCodeValue}
                            delegateId={delegateId}
                            isOpen={isQRModalOpen}
                            onClose={() => setIsQRModalOpen(false)}
                        />
                    </>
                )}

                {/* Motivational Tagline */}
                <div className="delegate-card-tagline">
                    Leave Your Mark!
                </div>
            </div>
        </div>
    );
}

export default DelegateCard;
