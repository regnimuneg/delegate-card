import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card } from '../../../shared/components';
import './RewardActivator.css';

// Reward types available
const REWARD_TYPES = [
    { id: 'lunch', label: 'Lunch', icon: '🍽️', description: 'Main meal service' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', description: 'Evening meal service' },
    { id: 'snack', label: 'Snack', icon: '🍿', description: 'Snack bar access' },
    { id: 'merch', label: 'Merch', icon: '👕', description: 'Merchandise pickup' }
];

// QR validity duration in seconds
const QR_VALIDITY_SECONDS = 15 * 60; // 15 minutes

/**
 * Generate a simple signed token (demo purposes)
 * In production, this would be a JWT from the backend
 */
function generateToken(delegateId, rewardType, timestamp) {
    const payload = `${delegateId}:${rewardType}:${timestamp}`;
    // Simple hash simulation - real app would use crypto
    const hash = btoa(payload).slice(0, 8);
    return `${payload}:${hash}`;
}

/**
 * RewardActivator Component
 * Generates time-limited dynamic QR codes for reward redemption
 * Includes visual confirmation animation for low-tech vendors
 */
export function RewardActivator({ delegateId }) {
    const [selectedReward, setSelectedReward] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [qrToken, setQrToken] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showLowTechMode, setShowLowTechMode] = useState(false);

    // Generate QR and start countdown
    const activateReward = useCallback(() => {
        if (!selectedReward) return;

        const timestamp = Date.now();
        const token = generateToken(delegateId, selectedReward.id, timestamp);
        const qrData = JSON.stringify({
            type: 'reward',
            delegateId,
            rewardType: selectedReward.id,
            timestamp,
            token,
            expiresAt: timestamp + (QR_VALIDITY_SECONDS * 1000)
        });

        setQrToken(qrData);
        setTimeRemaining(QR_VALIDITY_SECONDS);
        setIsActive(true);
    }, [delegateId, selectedReward]);

    // Countdown timer
    useEffect(() => {
        if (!isActive || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    setQrToken(null);
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
        setTimeRemaining(0);
        setShowLowTechMode(false);
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
                            <span className="reward-type-icon">{reward.icon}</span>
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
                    >
                        Generate QR Code
                    </Button>
                </div>
            )}

            {/* Active QR Display */}
            {isActive && qrToken && (
                <Card
                    variant="default"
                    padding="large"
                    className={`reward-active-card ${showLowTechMode ? 'low-tech-mode' : ''}`}
                >
                    {/* Low-Tech Visual Mode */}
                    {showLowTechMode ? (
                        <div className="reward-low-tech">
                            <div className="reward-low-tech-animation">
                                <span className="reward-low-tech-icon">{selectedReward.icon}</span>
                                <div className="reward-low-tech-pulse"></div>
                            </div>
                            <h4 className="reward-low-tech-title">Show to Vendor</h4>
                            <p className="reward-low-tech-type">{selectedReward.label}</p>
                            <div className="reward-timer reward-timer--large">
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* QR Code Display */}
                            <div className="reward-qr-container">
                                <div className="reward-qr-wrapper animate-glow">
                                    <QRCodeSVG
                                        value={qrToken}
                                        size={180}
                                        bgColor="#FFFFFF"
                                        fgColor="#0037C0"
                                        level="H"
                                        includeMargin
                                    />
                                </div>
                                <span className="reward-qr-label">{selectedReward.label}</span>
                            </div>

                            {/* Timer */}
                            <div className="reward-timer-section">
                                <span className="reward-timer-label">Expires in</span>
                                <div className="reward-timer">
                                    {formatTime(timeRemaining)}
                                </div>
                                <div className="reward-timer-bar">
                                    <div
                                        className="reward-timer-bar-fill"
                                        style={{ width: `${(timeRemaining / QR_VALIDITY_SECONDS) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="reward-actions">
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setShowLowTechMode(!showLowTechMode)}
                        >
                            {showLowTechMode ? 'Show QR Code' : 'Low-Tech Mode'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={cancelActivation}
                        >
                            Cancel
                        </Button>
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
