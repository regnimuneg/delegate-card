import { QRCodeSVG } from 'qrcode.react';
import './QRCodeModal.css';

/**
 * QRCodeModal Component
 * Displays an enlarged QR code in a modal overlay
 */
export function QRCodeModal({ qrValue, delegateId, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="qr-modal-overlay" onClick={onClose}>
            <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="qr-modal-close" onClick={onClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div className="qr-modal-header">
                    <h2>Your QR Code</h2>
                    <p>Scan this code for attendance, meals, and activities</p>
                </div>
                <div className="qr-modal-qr-wrapper">
                    <QRCodeSVG
                        value={qrValue}
                        size={300}
                        bgColor="#FFFFFF"
                        fgColor="#0037C0"
                        level="M"
                    />
                </div>
                <div className="qr-modal-footer">
                    <code className="qr-modal-code">{delegateId}</code>
                    {/* <p className="qr-modal-hint">{delegateId}</p> */}
                </div>
            </div>
        </div>
    );
}

export default QRCodeModal;
