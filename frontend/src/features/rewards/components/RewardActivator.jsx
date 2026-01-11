import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card } from '../../../shared/components';
import api from '../../../shared/utils/api';
import './RewardActivator.css';

// Reward types available
const REWARD_TYPES = [
    { id: 'lunch', label: 'Lunch', icon: 'lunch', description: 'Main meal service' },
    { id: 'dinner', label: 'Dinner', icon: 'dinner', description: 'Evening meal service' },
    { id: 'snack', label: 'Snack', icon: 'snack', description: 'Snack bar access' },
    { id: 'merch', label: 'Merch', icon: 'merch', description: 'Merchandise pickup' }
];

// QR validity duration in seconds
const QR_VALIDITY_SECONDS = 15 * 60; // 15 minutes

/**
 * RewardActivator Component
 * Generates time-limited dynamic QR codes for reward redemption
 * Includes visual confirmation animation for low-tech vendors
 */
export function RewardActivator({ delegateId }) {
    const [selectedReward, setSelectedReward] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [qrToken, setQrToken] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isActivating, setIsActivating] = useState(false);

    // Generate QR and start countdown
    const activateReward = useCallback(async () => {
        if (!selectedReward || !delegateId) return;

        setIsActivating(true);
        try {
            const response = await api.activateReward(selectedReward.id);
            if (response.success && response.activation) {
                const activation = response.activation;
                setQrToken(activation.qrToken);
                setQrData(activation.qrData);
                
                // Calculate time remaining
                const expiresAt = new Date(activation.expiresAt);
                const now = new Date();
                const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                
                setTimeRemaining(remaining);
                setIsActive(true);
            } else {
                console.error('Failed to activate reward:', response.error);
                // Handle error (you might want to show a toast/notification)
            }
        } catch (error) {
            console.error('Error activating reward:', error);
            // Handle error
        } finally {
            setIsActivating(false);
        }
    }, [delegateId, selectedReward]);

    // Countdown timer
    useEffect(() => {
        if (!isActive || timeRemaining <= 0) {
            if (timeRemaining <= 0 && isActive) {
                setIsActive(false);
                setQrToken(null);
                setQrData(null);
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    setQrToken(null);
                    setQrData(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cancel active QR
    const cancelActivation = () => {
        setIsActive(false);
        setQrToken(null);
        setQrData(null);
        setTimeRemaining(0);
    };

    return (
        <div className="reward-activator">
            <h3 className="reward-activator-title">Activate Reward</h3>

            {/* Reward Selection */}
            {!isActive && (
                <div className="reward-types">
                    {REWARD_TYPES.map(reward => (
                        <button
                            key={reward.id}
                            className={`reward-type-btn ${selectedReward?.id === reward.id ? 'selected' : ''}`}
                            onClick={() => setSelectedReward(reward)}
                            type="button"
                        >
                            <span className="reward-type-icon">
                                {reward.icon === 'lunch' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                        <path d="M7 2v20"></path>
                                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                                    </svg>
                                )}
                                {reward.icon === 'dinner' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                                        <path d="M19 3v4"></path>
                                        <path d="M21 5h-4"></path>
                                    </svg>
                                )}
                                {reward.icon === 'snack' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 6v6l4 2"></path>
                                    </svg>
                                )}
                                {reward.icon === 'merch' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 11.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                )}
                            </span>
                            <span className="reward-type-label">{reward.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Activation Button */}
            {!isActive && selectedReward && (
                <div className="reward-activate-section">
                    <p className="reward-selected-info">
                        Activate <strong>{selectedReward.label}</strong> for redemption
                    </p>
                    <Button
                        variant="primary"
                        size="large"
                        fullWidth
                        onClick={activateReward}
                        loading={isActivating}
                        disabled={isActivating}
                    >
                        {isActivating ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                </div>
            )}

            {/* Active QR Display - Delegate Card Style */}
            {isActive && qrToken && (
                <Card
                    variant="blue"
                    padding="large"
                    glow
                    className="reward-active-card"
                >
                    <div className="reward-card-inner">
                        {/* Header with NIMUN branding */}
                        <div className="reward-card-header">
                            <span className="reward-card-brand">NIMUN'26</span>
                            <span className="reward-card-type">REWARD</span>
                        </div>

                        {/* Reward Profile Section */}
                        <div className="reward-card-profile">
                            <div className="reward-card-avatar">
                                {selectedReward.icon === 'lunch' && (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                        <path d="M7 2v20"></path>
                                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                                    </svg>
                                )}
                                {selectedReward.icon === 'dinner' && (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                                        <path d="M19 3v4"></path>
                                        <path d="M21 5h-4"></path>
                                    </svg>
                                )}
                                {selectedReward.icon === 'snack' && (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 6v6l4 2"></path>
                                    </svg>
                                )}
                                {selectedReward.icon === 'merch' && (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 11.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                )}
                            </div>
                            <h2 className="reward-card-name">{selectedReward.label}</h2>
                        </div>

                        {/* Reward Info */}
                        <div className="reward-card-info">
                            <div className="reward-card-info-item reward-card-info-item--full">
                                <span className="reward-card-info-label">Type</span>
                                <span className="reward-card-info-value">{selectedReward.description}</span>
                            </div>
                            <div className="reward-card-info-item reward-card-info-item--full">
                                <span className="reward-card-info-label">Expires In</span>
                                <span className="reward-card-info-value">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="reward-card-qr">
                            <div className="reward-card-qr-wrapper">
                                <QRCodeSVG
                                    value={qrToken || ''}
                                    size={100}
                                    bgColor="transparent"
                                    fgColor="#FFFFFF"
                                    level="M"
                                />
                            </div>
                            <span className="reward-card-qr-label">{selectedReward.label.toUpperCase()}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="reward-card-actions">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={cancelActivation}
                                className="reward-card-cancel-btn"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Instructions */}
            {!isActive && !selectedReward && (
                <p className="reward-instructions">
                    Select a reward type above to generate a time-limited QR code for redemption
                </p>
            )}
        </div>
    );
}

export default RewardActivator;
