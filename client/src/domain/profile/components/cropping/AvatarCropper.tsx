/**
 * AvatarCropper - Nouvelle implémentation avec react-image-crop
 * Remplace tout le système custom par une librairie mature et stable
 */

import React, { useState, useRef, useCallback } from 'react';
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
    React.useEffect(() => {
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

            // For PNG/WebP, preserve transparency; for JPEG, use white background
            if (outputType === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, outputSize, outputSize);
            }

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
        if (!completedCrop) return { quality: 'unknown', message: 'Select crop area' };

        const cropPixels = completedCrop.width * completedCrop.height;
        const outputPixels = outputSize * outputSize;
        const ratio = cropPixels / outputPixels;

        if (ratio >= 2) {
            return { quality: 'high', message: 'Excellent quality', color: 'text-green-600' };
        } else if (ratio >= 1) {
            return { quality: 'medium', message: 'Good quality', color: 'text-yellow-600' };
        } else {
            return { quality: 'low', message: 'May appear pixelated', color: 'text-red-600' };
        }
    };

    const qualityInfo = getQualityInfo();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Crop Avatar
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Select the area you want to use as your avatar
                            </p>
                        </div>
                        
                        <button
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Cancel cropping"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-140px)]">
                    {/* Left panel - Crop area */}
                    <div className="flex-1 p-6 flex items-center justify-center">
                        {imageSrc && (
                            <>
                                {crop ? (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={handleCropComplete}
                                        aspect={1} // Force square aspect ratio
                                        minWidth={minCropSize}
                                        minHeight={minCropSize}
                                        className="max-w-full max-h-full"
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            alt="Crop preview"
                                            onLoad={onImageLoad}
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '70vh',
                                                display: 'block'
                                            }}
                                        />
                                    </ReactCrop>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            alt="Loading crop preview"
                                            onLoad={onImageLoad}
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '70vh',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right panel - Preview and info */}
                    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 overflow-y-auto">
                        {/* Preview */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <canvas
                                        ref={previewCanvasRef}
                                        className="w-32 h-32 rounded-full border-2 border-gray-300 bg-gray-100"
                                        width={128}
                                        height={128}
                                    />
                                    {!completedCrop && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs text-gray-500">No preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quality info */}
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Quality Assessment</h4>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    qualityInfo.quality === 'high' ? 'bg-green-500' :
                                    qualityInfo.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className={`text-sm font-medium ${qualityInfo.color}`}>
                                    {qualityInfo.message}
                                </span>
                            </div>
                            {completedCrop && (
                                <div className="mt-2 text-xs text-gray-600">
                                    <p>Crop size: {Math.round(completedCrop.width)}×{Math.round(completedCrop.height)}px</p>
                                    <p>Output size: {outputSize}×{outputSize}px</p>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">How to use</h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Drag to move the crop area</li>
                                <li>• Drag corners to resize</li>
                                <li>• The crop area is always square</li>
                                <li>• Larger crop areas = better quality</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        {/* Processing status */}
                        <div className="flex items-center space-x-2">
                            {isProcessing && (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-600">Processing...</span>
                                </>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={onCancel}
                                disabled={isProcessing}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyCrop}
                                disabled={!completedCrop || isProcessing}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? 'Processing...' : 'Apply Crop'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};