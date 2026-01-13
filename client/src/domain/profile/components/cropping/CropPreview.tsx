/**
 * CropPreview component - Real-time preview of cropped result
 * Shows circular and square preview modes with context previews
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CropPreviewProps } from './types';
import { PREVIEW_CONFIG } from '../../utils/cropping/constants';

export const CropPreview: React.FC<CropPreviewProps> = ({
    image,
    cropArea,
    scale,
    previewSize = PREVIEW_CONFIG.DEFAULT_SIZE,
    showCircular = true,
    showContextPreviews = false,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextCanvasRef = useRef<HTMLCanvasElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const previousUrlRef = useRef<string | null>(null);

    /**
     * Generate preview image from crop area
     */
    const generatePreview = useCallback(async () => {
        if (!canvasRef.current || !image) return;

        setIsGenerating(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size
            canvas.width = previewSize;
            canvas.height = previewSize;

            // Clear canvas
            ctx.clearRect(0, 0, previewSize, previewSize);

            // Draw cropped portion of image
            ctx.drawImage(
                image,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, previewSize, previewSize
            );

            // Create blob URL for preview
            canvas.toBlob((blob) => {
                if (blob) {
                    // Revoke previous URL to prevent memory leaks
                    if (previousUrlRef.current) {
                        URL.revokeObjectURL(previousUrlRef.current);
                    }
                    
                    const newUrl = URL.createObjectURL(blob);
                    previousUrlRef.current = newUrl;
                    setPreviewUrl(newUrl);
                }
            }, 'image/jpeg', 0.9);

        } catch (error) {
            console.error('Failed to generate preview:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [image, cropArea, previewSize]);

    /**
     * Generate context previews (profile, message display, etc.)
     */
    const generateContextPreviews = useCallback(() => {
        if (!contextCanvasRef.current || !previewUrl) return;

        const canvas = contextCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size for context previews
        canvas.width = 300;
        canvas.height = 200;

        // Clear canvas
        ctx.clearRect(0, 0, 300, 200);

        // Draw background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 300, 200);

        // Create image element for preview
        const previewImg = new Image();
        previewImg.onload = () => {
            // Profile context (large avatar)
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, 60, 30, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(previewImg, 30, 30, 60, 60);
            ctx.restore();

            // Add label
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.fillText('Profile', 35, 130);

            // Message context (small avatar)
            ctx.save();
            ctx.beginPath();
            ctx.arc(160, 45, 15, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(previewImg, 145, 30, 30, 30);
            ctx.restore();

            // Add label
            ctx.fillText('Message', 140, 130);

            // Navigation context (tiny avatar)
            ctx.save();
            ctx.beginPath();
            ctx.arc(240, 40, 10, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(previewImg, 230, 30, 20, 20);
            ctx.restore();

            // Add label
            ctx.fillText('Nav', 225, 130);
        };
        previewImg.src = previewUrl;
    }, [previewUrl]);

    // Generate preview when crop area or image changes
    useEffect(() => {
        generatePreview();
    }, [generatePreview]);

    // Generate context previews when preview URL changes
    useEffect(() => {
        if (showContextPreviews && previewUrl) {
            generateContextPreviews();
        }
    }, [showContextPreviews, previewUrl, generateContextPreviews]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previousUrlRef.current) {
                URL.revokeObjectURL(previousUrlRef.current);
            }
        };
    }, []);

    /**
     * Get preview container styles
     */
    const getPreviewStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            width: previewSize,
            height: previewSize,
            borderRadius: showCircular ? '50%' : '8px',
            overflow: 'hidden',
            border: `${PREVIEW_CONFIG.BORDER_WIDTH}px solid ${PREVIEW_CONFIG.BORDER_COLOR}`,
            backgroundColor: '#f8f9fa'
        };

        return baseStyles;
    };

    return (
        <div className={`crop-preview ${className}`}>
            {/* Main preview */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Preview ({showCircular ? 'Circular' : 'Square'})
                </h3>
                
                <div className="relative inline-block">
                    <div style={getPreviewStyles()}>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Crop preview"
                                className="w-full h-full object-cover"
                                style={{
                                    borderRadius: showCircular ? '50%' : '8px'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                                            <p className="text-xs text-gray-500">Generating...</p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-500">No preview</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading overlay */}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {/* Preview info */}
                <div className="mt-2 text-xs text-gray-500">
                    <div>Size: {previewSize}×{previewSize}px</div>
                    <div>Crop: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px</div>
                    <div>Scale: {Math.round(scale * 100)}%</div>
                </div>
            </div>

            {/* Toggle buttons */}
            <div className="mb-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => {/* This would be handled by parent component */}}
                        className={`px-3 py-1 text-xs rounded ${
                            showCircular 
                                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                        title="Show circular preview (how it appears as avatar)"
                    >
                        Circular
                    </button>
                    <button
                        onClick={() => {/* This would be handled by parent component */}}
                        className={`px-3 py-1 text-xs rounded ${
                            !showCircular 
                                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                        title="Show square preview (full crop area)"
                    >
                        Square
                    </button>
                </div>
            </div>

            {/* Context previews */}
            {showContextPreviews && (
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Context Previews
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <canvas
                            ref={contextCanvasRef}
                            className="w-full h-auto"
                            style={{ maxWidth: '300px', height: 'auto' }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            How your avatar will appear in different contexts
                        </p>
                    </div>
                </div>
            )}

            {/* Hidden canvas for preview generation */}
            <canvas
                ref={canvasRef}
                className="hidden"
                width={previewSize}
                height={previewSize}
            />

            {/* Quality indicator */}
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                            cropArea.width >= previewSize * 0.8 ? 'bg-green-500' :
                            cropArea.width >= previewSize * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium ${
                            cropArea.width >= previewSize * 0.8 ? 'text-green-700' :
                            cropArea.width >= previewSize * 0.5 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                            {cropArea.width >= previewSize * 0.8 ? 'High' :
                             cropArea.width >= previewSize * 0.5 ? 'Medium' : 'Low'}
                        </span>
                    </div>
                </div>
                {cropArea.width < previewSize * 0.5 && (
                    <p className="text-red-600 mt-1">
                        Crop area is small - consider zooming out or selecting a larger area
                    </p>
                )}
            </div>
        </div>
    );
};