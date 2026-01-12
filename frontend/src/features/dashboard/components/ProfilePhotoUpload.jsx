import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth';
import { api } from '../../../shared/utils/api';
import './ProfilePhotoUpload.css';

/**
 * ProfilePhotoUpload Component
 * Allows users to upload, crop, and update their profile picture
 */
export function ProfilePhotoUpload({ onPhotoUpdate }) {
    const { user, setUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [cropMode, setCropMode] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [cropAreaSize, setCropAreaSize] = useState(240);
    const fileInputRef = useRef(null);
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const cropAreaRef = useRef(null);

    // Detect crop area size (changes on mobile)
    useEffect(() => {
        if (cropMode && cropAreaRef.current) {
            // Small delay to ensure CSS is applied
            const timer = setTimeout(() => {
                if (cropAreaRef.current) {
                    const size = cropAreaRef.current.offsetWidth;
                    console.log('Crop area size detected:', size);
                    setCropAreaSize(size);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [cropMode]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError('');
        
        // Create preview and enter crop mode
        const reader = new FileReader();
        reader.onloadend = () => {
            // Load image to get dimensions for initial scale calculation
            const tempImg = new Image();
            tempImg.onload = () => {
                const imgW = tempImg.naturalWidth;
                const imgH = tempImg.naturalHeight;
                // Calculate scale so the smaller dimension fits in the crop area with some padding
                // Crop area is ~200-240px, we want the face to roughly fill it
                const targetSize = 220; // Approximate crop area size
                const smallerDim = Math.min(imgW, imgH);
                // Scale so smaller dimension is about 1.5x the crop area (shows context)
                const initialScale = (targetSize * 1.5) / smallerDim;
                // Clamp between 0.1 and 1
                const clampedScale = Math.max(0.1, Math.min(1, initialScale));
                
                setImageSrc(reader.result);
                setCropMode(true);
                setCropPosition({ x: 0, y: 0 });
                setScale(clampedScale);
            };
            tempImg.src = reader.result;
        };
        reader.onerror = () => {
            setError('Failed to read image file');
        };
        reader.readAsDataURL(file);
    };

    // Open crop modal with existing photo
    const handleEditPhoto = async () => {
        if (!user?.photo) return;
        
        // Load the existing photo to get dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
            const imgW = tempImg.naturalWidth;
            const imgH = tempImg.naturalHeight;
            const targetSize = 220;
            const smallerDim = Math.min(imgW, imgH);
            const initialScale = (targetSize * 1.5) / smallerDim;
            const clampedScale = Math.max(0.1, Math.min(1, initialScale));
            
            setImageSrc(user.photo);
            setCropMode(true);
            setCropPosition({ x: 0, y: 0 });
            setScale(clampedScale);
        };
        tempImg.src = user.photo;
    };

    const handleCropConfirm = useCallback(async () => {
        if (!imageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = imageRef.current;

        // Output size (final cropped image)
        const outputSize = 300;
        
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // Fill with white background first (in case image doesn't cover entire area)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        
        // Calculate what's visible in the crop circle:
        // 
        // In CSS preview:
        // - Image is at top:50%, left:50% (puts image corner at container center)
        // - Transform: translate(-50% + panX, -50% + panY) scale(scale)
        // - The -50% translate centers the scaled image at the container center
        // - Then pan offsets it
        //
        // Result: image center is at (containerCenter.x + panX, containerCenter.y + panY)
        // 
        // What original pixel is at container center?
        // The image center is panX,panY pixels away from container center (in screen space)
        // In original image space, that's (panX/scale, panY/scale) pixels
        // So container center shows: (imgW/2 - panX/scale, imgH/2 - panY/scale)
        
        // What's the visible region size in original pixels?
        // The crop circle is cropAreaSize screen pixels
        // At zoom 'scale', that shows (cropAreaSize / scale) original pixels
        const visibleSize = cropAreaSize / scale;
        
        // Center of visible region in original image coordinates
        const centerX = imgW / 2 - cropPosition.x / scale;
        const centerY = imgH / 2 - cropPosition.y / scale;
        
        // Source rectangle (top-left corner and size) in original image
        const sx = centerX - visibleSize / 2;
        const sy = centerY - visibleSize / 2;
        const sw = visibleSize;
        const sh = visibleSize;
        
        console.log('Crop debug:', {
            imgW, imgH,
            cropAreaSize,
            scale,
            panX: cropPosition.x,
            panY: cropPosition.y,
            visibleSize,
            centerX, centerY,
            sx, sy, sw, sh,
            outputSize
        });
        
        // Draw the visible portion of the original image to fill the output canvas
        // Using the 9-argument form: drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
        ctx.drawImage(
            img,
            sx, sy, sw, sh,      // Source: what part of original image to use
            0, 0, outputSize, outputSize  // Destination: fill entire output canvas
        );

        // Get the cropped image as data URL
        const croppedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Upload the cropped image
        await uploadImage(croppedImageDataUrl);
        setCropMode(false);
        setImageSrc(null);
    }, [cropPosition, scale, cropAreaSize]);

    const uploadImage = async (imageDataUrl) => {
        setIsUploading(true);
        setError('');

        try {
            const response = await api.updateProfilePhoto(imageDataUrl);
            
            if (response.success) {
                const updatedUser = { ...user, photo: response.photoUrl };
                setUser(updatedUser);
                localStorage.setItem('nimun_user', JSON.stringify(updatedUser));
                if (onPhotoUpdate) {
                    onPhotoUpdate(response.photoUrl);
                }
            } else {
                setError(response.error || 'Failed to update photo');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleDelete = async () => {
        if (!user?.photo) return;
        
        setIsUploading(true);
        try {
            const response = await api.updateProfilePhoto(null);
            if (response.success) {
                const updatedUser = { ...user, photo: null };
                setUser(updatedUser);
                localStorage.setItem('nimun_user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete photo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCropCancel = () => {
        setCropMode(false);
        setImageSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Drag handling for crop
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - cropPosition.x,
            y: e.clientY - cropPosition.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setCropPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - cropPosition.x,
            y: touch.clientY - cropPosition.y
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setCropPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    const currentPhoto = user?.photo;

    return (
        <div className="profile-photo-upload">
            {/* Crop Modal */}
            {cropMode && imageSrc && (
                <div className="profile-photo-crop-modal">
                    <div className="profile-photo-crop-content">
                        <h3 className="profile-photo-crop-title">Adjust Photo</h3>
                        <p className="profile-photo-crop-hint">Drag to position, use slider to zoom</p>
                        
                        <div 
                            ref={cropAreaRef}
                            className="profile-photo-crop-area"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            <div className="profile-photo-crop-circle"></div>
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop preview"
                                className="profile-photo-crop-image"
                                style={{
                                    transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px)) scale(${scale})`,
                                }}
                                draggable={false}
                            />
                        </div>

                        <div className="profile-photo-crop-controls">
                            <span className="profile-photo-crop-zoom-label">Zoom</span>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.05"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="profile-photo-crop-slider"
                            />
                        </div>

                        <div className="profile-photo-crop-actions">
                            <button
                                type="button"
                                onClick={handleCropCancel}
                                className="profile-photo-crop-btn profile-photo-crop-btn--cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropConfirm}
                                className="profile-photo-crop-btn profile-photo-crop-btn--confirm"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}

            {/* Main Photo Container */}
            <div className="profile-photo-container" onClick={handleClick}>
                {currentPhoto ? (
                    <img 
                        src={currentPhoto} 
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="profile-photo-image"
                    />
                ) : (
                    <div className="profile-photo-placeholder">
                        <span className="profile-photo-initials">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="profile-photo-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                </div>
                {isUploading && (
                    <div className="profile-photo-loading">
                        <div className="profile-photo-spinner"></div>
                    </div>
                )}
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                onClick={(e) => { e.target.value = ''; }}
                className="profile-photo-input"
                disabled={isUploading || cropMode}
            />

            {error && (
                <div className="profile-photo-error">
                    {error}
                </div>
            )}

            {/* Action buttons */}
            <div className="profile-photo-actions">
                {currentPhoto && (
                    <>
                        <button
                            type="button"
                            onClick={handleEditPhoto}
                            className="profile-photo-edit"
                            disabled={isUploading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Image
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="profile-photo-delete"
                            disabled={isUploading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Remove
                        </button>
                    </>
                )}
            </div>
            
            <p className="profile-photo-hint">
                Click to {currentPhoto ? 'change' : 'upload'} profile picture (max 5MB)
            </p>
        </div>
    );
}

export default ProfilePhotoUpload;
