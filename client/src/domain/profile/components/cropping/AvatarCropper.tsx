/**
 * AvatarCropper - Nouvelle implémentation avec react-image-crop
 * Adapté pour le style Glassmorphism et Dark Mode
 * Utilise React Portal pour s'afficher en plein écran
 * Optimisation Mobile: Layout Responsive (Stackable), Scroll, Header Compact
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarCropperProps {
    imageFile: File;
    onCropComplete: (result: {
        croppedImageBlob: Blob;
        croppedImageUrl: string;
        finalDimensions: { width: number; height: number };
        quality: 'high' | 'medium' | 'low';
    }) => void;
    onCancel: () => void;
    options?: {
        outputSize?: number;
        minCropSize?: number;
        outputQuality?: number;
    };
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({
    imageFile,
    onCropComplete,
    onCancel,
    options = {}
}) => {
    const { t } = useTranslation();
    const {
        outputSize = 256,
        minCropSize = 50,
        outputQuality = 0.9
    } = options;

    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    // Generate preview when crop changes
    const generatePreview = useCallback(async (crop: PixelCrop) => {
        if (!imgRef.current || !previewCanvasRef.current || !crop.width || !crop.height) {
            return;
        }

        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to preview size
        const previewSize = 128;
        canvas.width = previewSize;
        canvas.height = previewSize;

        // Clear canvas
        ctx.clearRect(0, 0, previewSize, previewSize);

        // Draw cropped image
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            previewSize,
            previewSize
        );
    }, []);

    // Initialize square crop when image loads
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;

        // Calculate the size for a square crop (80% of the smaller dimension)
        const minDimension = Math.min(width, height);
        const cropSize = minDimension * 0.8;

        // Center the crop
        const x = (width - cropSize) / 2;
        const y = (height - cropSize) / 2;

        const squareCrop: Crop = {
            unit: 'px',
            width: cropSize,
            height: cropSize,
            x: x,
            y: y
        };

        setCrop(squareCrop);

        // Generate initial preview
        const pixelCrop: PixelCrop = {
            unit: 'px',
            width: cropSize,
            height: cropSize,
            x: x,
            y: y
        };
        setCompletedCrop(pixelCrop);

        // Generate preview after a short delay to ensure the image is fully rendered
        setTimeout(() => {
            generatePreview(pixelCrop);
        }, 100);
    }, [generatePreview]);

    // Load image when file changes
    useEffect(() => {
        if (!imageFile) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(imageFile);

        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [imageFile]);

    // Handle crop completion
    const handleCropComplete = useCallback((crop: PixelCrop) => {
        setCompletedCrop(crop);
        if (crop.width && crop.height) {
            generatePreview(crop);
        }
    }, [generatePreview]);

    // Generate final cropped image
    const handleApplyCrop = async () => {
        if (!completedCrop || !imgRef.current || !completedCrop.width || !completedCrop.height) {
            return;
        }

        setIsProcessing(true);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            // Set canvas size to output size
            canvas.width = outputSize;
            canvas.height = outputSize;

            // Determine output format based on original file type
            const originalType = imageFile.type;
            const outputType = ['image/png', 'image/webp'].includes(originalType) ? originalType : 'image/jpeg';

            // Clean canvas first
            ctx.clearRect(0, 0, outputSize, outputSize);

            // Draw cropped and resized image
            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                outputSize,
                outputSize
            );

            // Convert to blob with original format
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Failed to generate image blob');
                }

                // Create URL for preview
                const croppedImageUrl = URL.createObjectURL(blob);

                // Assess quality based on crop size vs output size
                const cropPixels = completedCrop.width * completedCrop.height;
                const outputPixels = outputSize * outputSize;
                const ratio = cropPixels / outputPixels;

                let quality: 'high' | 'medium' | 'low';
                if (ratio >= 2) quality = 'high';
                else if (ratio >= 1) quality = 'medium';
                else quality = 'low';

                onCropComplete({
                    croppedImageBlob: blob,
                    croppedImageUrl,
                    finalDimensions: { width: outputSize, height: outputSize },
                    quality
                });
            }, outputType, outputQuality);

        } catch (error) {
            console.error('Failed to generate cropped image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate quality indicator
    const getQualityInfo = () => {
        if (!completedCrop) return { quality: 'unknown', message: t('profile.avatar.select_crop'), color: 'text-[var(--text-muted)]' };

        const cropPixels = completedCrop.width * completedCrop.height;
        const outputPixels = outputSize * outputSize;
        const ratio = cropPixels / outputPixels;

        if (ratio >= 2) {
            return { quality: 'high', message: t('profile.avatar.quality.high'), color: 'text-[var(--accent-success)]' };
        } else if (ratio >= 1) {
            return { quality: 'medium', message: t('profile.avatar.quality.medium'), color: 'text-[var(--accent-warning)]' };
        } else {
            return { quality: 'low', message: t('profile.avatar.quality.low'), color: 'text-[var(--accent-error)]' };
        }
    };

    const qualityInfo = getQualityInfo();

    // Use Portal to render outside of parent containers that might constrain size
    const content = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 sm:p-4 animate-fade-in">
            <div className="glass-panel w-full h-full sm:h-[90vh] sm:max-w-[95vw] flex flex-col shadow-2xl animate-scale-in border border-[var(--glass-border)] overflow-hidden rounded-none sm:rounded-2xl">

                {/* 1. HEADER - Compact on mobile */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-translucent)] shrink-0 z-20">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                            {t('profile.avatar.cropping')}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 hidden sm:block">
                            {t('profile.avatar.crop_desc')}
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 rounded-full hover:bg-[var(--bg-surface)]"
                        title={t('profile.avatar.cancel')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. MIDDLE CONTENT - Scrollable on mobile, Hidden overflow on desktop */}
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative z-0">

                    {/* Left panel - Image */}
                    <div className="flex-1 relative bg-[var(--bg-test)] flex items-center justify-center p-2 sm:p-4 min-h-[50vh] lg:min-h-0 shrink-0">
                        {imageSrc && (
                            <div className="relative inline-block w-full h-full flex items-center justify-center">
                                {crop ? (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={handleCropComplete}
                                        aspect={1}
                                        minWidth={minCropSize}
                                        minHeight={minCropSize}
                                        className="max-h-[60vh] sm:max-h-[70vh]" // Reduced slightly for mobile comfort
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            alt="Crop preview"
                                            onLoad={onImageLoad}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '60vh', // Match parent
                                                objectFit: 'contain'
                                            }}
                                            className="sm:max-h-[70vh]"
                                        />
                                    </ReactCrop>
                                ) : (
                                    <div className="flex items-center justify-center w-full">
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            alt="Loading crop preview"
                                            onLoad={onImageLoad}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '60vh',
                                                objectFit: 'contain',
                                                opacity: 0
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right panel - Sidebar - Visible on mobile below image */}
                    <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] p-6 bg-[var(--bg-surface-translucent)] lg:overflow-y-auto z-10">

                        {/* Mobile handle/separator hint could go here */}

                        {/* Preview */}
                        <div className="mb-6 flex flex-col items-center">
                            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4 uppercase tracking-wider">{t('profile.avatar.preview')}</h3>
                            <div className="relative inline-block group">
                                <canvas
                                    ref={previewCanvasRef}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[var(--glass-border)] shadow-lg bg-[var(--bg-surface)]"
                                    width={128}
                                    height={128}
                                />
                            </div>
                        </div>

                        {/* Quality info */}
                        <div className="mb-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center">
                                <span className="mr-2">🔍</span> {t('profile.avatar.quality_check')}
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${qualityInfo.quality === 'high' ? 'bg-green-500' :
                                    qualityInfo.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                <span className={`text-sm font-bold ${qualityInfo.color}`}>
                                    {qualityInfo.message}
                                </span>
                            </div>
                            {completedCrop && (
                                <div className="space-y-1 text-xs text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-subtle)]">
                                    <div className="flex justify-between">
                                        <span>{t('profile.avatar.size')}:</span>
                                        <span className="font-mono">{Math.round(completedCrop.width)}×{Math.round(completedCrop.height)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="p-4 rounded-xl bg-[var(--accent-info-light)] border border-[var(--accent-info-border)]">
                            <h4 className="text-sm font-bold text-[var(--accent-info)] mb-2">{t('profile.privacy.notice_title')}</h4>
                            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                                <li>{t('profile.avatar.drag')}</li>
                                <li>{t('profile.avatar.resize')}</li>
                                <li>{t('profile.avatar.square')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. FOOTER - Compact */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-translucent)] flex items-center justify-between shrink-0 z-20">
                    <div className="hidden sm:flex items-center space-x-2">
                        {isProcessing && (
                            <span className="text-xs font-medium text-[var(--accent-primary)] animate-pulse">{t('profile.form.saving')}</span>
                        )}
                    </div>

                    <div className="flex space-x-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors disabled:opacity-50 text-center"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleApplyCrop}
                            disabled={!completedCrop || isProcessing}
                            className={`
                                flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white rounded-lg shadow-lg
                                bg-[var(--accent-primary)] hover:brightness-110 hover:shadow-[var(--accent-primary)]/40
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all transform active:scale-95 text-center
                            `}
                        >
                            {isProcessing ? t('profile.form.saving') : t('profile.avatar.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};