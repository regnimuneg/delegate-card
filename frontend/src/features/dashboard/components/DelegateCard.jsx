import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeModal } from '../../../shared/components/QRCodeModal';
import './DelegateCard.css';

/**
 * DelegateCard Component
 * Displays the delegate's identity card with static QR code
 * Takes full width of container - no extra box wrapper
 */
export function DelegateCard({ delegate, showQR = true }) {
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    
    const {
        firstName,
        lastName,
        committee,
        council,
        qrCode,
        qrSlug,
        photo
    } = delegate;

    const fullName = `${firstName} ${lastName}`;
    const delegateId = delegate.id; // Just the ID like "HRC-01"
    const qrCodeValue = `IC'26-${delegateId}`; // QR code format: IC'26-HRC-01

    return (
        <div className="delegate-card">
            <div className="delegate-card-inner">
                {/* Header with NIMUN branding */}
                <div className="delegate-card-header">
                    <span className="delegate-card-brand">NIMUN'26</span>
                    <span className="delegate-card-type">DELEGATE</span>
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

                {/* Council Info */}
                <div className="delegate-card-info">
                    <div className="delegate-card-info-item delegate-card-info-item--full">
                        <span className="delegate-card-info-label">Council</span>
                        <span className="delegate-card-info-value">{council}</span>
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
