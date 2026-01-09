import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card } from '../../../shared/components';
import './ActiveClaimDisplay.css';

// QR validity duration in seconds (15 minutes)
const QR_VALIDITY_SECONDS = 15 * 60;

/**
 * Generate a simple signed token (demo purposes)
 */
function generateToken(vendorId, timestamp) {
    const payload = `voucher:${vendorId}:${timestamp}`;
    const hash = btoa(payload).slice(0, 8);
    return `${payload}:${hash}`;
}

/**
 * ActiveClaimDisplay Component
 * Compact inline display with QR code and timer
 */
export function ActiveClaimDisplay({ claim, onDismiss }) {
    const [qrToken, setQrToken] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showLowTechMode, setShowLowTechMode] = useState(false);

    useEffect(() => {
        if (claim) {
            const timestamp = claim.timestamp || Date.now();
            const elapsed = Math.floor((Date.now() - timestamp) / 1000);
            const remaining = Math.max(0, QR_VALIDITY_SECONDS - elapsed);

            const token = generateToken(claim.vendorId, timestamp);
            const qrData = JSON.stringify({
                type: 'voucher_claim',
                vendorId: claim.vendorId,
                vendorName: claim.vendorName,
                timestamp,
                token,
                expiresAt: timestamp + (QR_VALIDITY_SECONDS * 1000)
            });
            setQrToken(qrData);
            setTimeRemaining(remaining);
        } else {
            setQrToken(null);
            setTimeRemaining(0);
        }
    }, [claim]);

    useEffect(() => {
        if (!claim || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => prev <= 1 ? 0 : prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [claim, timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!claim) return null;

    const isExpired = timeRemaining === 0;

    return (
        <div className={`active-claim ${isExpired ? 'active-claim--expired' : ''}`}>
            <div className="active-claim-content">
                {/* Left: Info */}
                <div className="active-claim-info">
                    <div className="active-claim-icon">{claim.icon}</div>
                    <div className="active-claim-details">
                        <span className="active-claim-label">
                            {isExpired ? 'Expired' : 'Active Claim'}
                        </span>
                        <span className="active-claim-vendor">{claim.vendorName}</span>
                    </div>
                </div>

                {/* Center: QR or Low-Tech */}
                {!isExpired && (
                    <div className="active-claim-display">
                        {showLowTechMode ? (
                            <div className="active-claim-lowtech">
                                <div className="active-claim-lowtech-icon">{claim.icon}</div>
                                <div className="active-claim-lowtech-ring"></div>
                            </div>
                        ) : (
                            <div className="active-claim-qr">
                                <QRCodeSVG
                                    value={qrToken || ''}
                                    size={100}
                                    bgColor="#FFFFFF"
                                    fgColor="#0037C0"
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Right: Timer & Actions */}
                <div className="active-claim-actions">
                    {!isExpired && (
                        <>
                            <div className={`active-claim-timer ${timeRemaining <= 60 ? 'active-claim-timer--warning' : ''}`}>
                                {formatTime(timeRemaining)}
                            </div>
                            <button
                                className="active-claim-toggle"
                                onClick={() => setShowLowTechMode(!showLowTechMode)}
                            >
                                {showLowTechMode ? 'QR' : 'Visual'}
                            </button>
                        </>
                    )}
                    <button className="active-claim-close" onClick={onDismiss}>
                        ×
                    </button>
                </div>
            </div>

            {/* Timer bar */}
            {!isExpired && (
                <div className="active-claim-bar">
                    <div
                        className="active-claim-bar-fill"
                        style={{ width: `${(timeRemaining / QR_VALIDITY_SECONDS) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export default ActiveClaimDisplay;
