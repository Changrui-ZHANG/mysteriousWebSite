/**
 * CropControls component - Zoom controls, reset button, and quality indicator
 * Provides user controls for crop manipulation and quality feedback
 */

import React, { useState, useCallback } from 'react';
import { CropControlsProps } from './types';

export const CropControls: React.FC<CropControlsProps> = ({
    scale,
    onScaleChange,
    onReset,
    validation,
    disabled = false,
    className = ''
}) => {
    const [isResetting, setIsResetting] = useState(false);

    /**
     * Handle zoom in
     */
    const handleZoomIn = useCallback(() => {
        if (disabled) return;
        const newScale = Math.min(5.0, scale + 0.2);
        onScaleChange(newScale);
    }, [scale, onScaleChange, disabled]);

    /**
     * Handle zoom out
     */
    const handleZoomOut = useCallback(() => {
        if (disabled) return;
        const newScale = Math.max(0.1, scale - 0.2);
        onScaleChange(newScale);
    }, [scale, onScaleChange, disabled]);

    /**
     * Handle scale slider change
     */
    const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const newScale = parseFloat(event.target.value);
        onScaleChange(newScale);
    }, [onScaleChange, disabled]);

    /**
     * Handle reset with animation feedback
     */
    const handleReset = useCallback(async () => {
        if (disabled || isResetting) return;
        
        setIsResetting(true);
        try {
            await onReset();
        } finally {
            // Add small delay for visual feedback
            setTimeout(() => setIsResetting(false), 300);
        }
    }, [onReset, disabled, isResetting]);

    /**
     * Get quality color and icon
     */
    const getQualityDisplay = () => {
        switch (validation.quality) {
            case 'high':
                return {
                    color: 'text-green-700',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-300',
                    icon: '✓',
                    text: 'High Quality'
                };
            case 'medium':
                return {
                    color: 'text-yellow-700',
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-300',
                    icon: '⚠',
                    text: 'Medium Quality'
                };
            case 'low':
                return {
                    color: 'text-red-700',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-300',
                    icon: '⚠',
                    text: 'Low Quality'
                };
            default:
                return {
                    color: 'text-gray-700',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300',
                    icon: '?',
                    text: 'Unknown'
                };
        }
    };

    const qualityDisplay = getQualityDisplay();

    return (
        <div className={`crop-controls space-y-4 ${className}`}>
            {/* Zoom Controls */}
            <div className="zoom-controls">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Zoom</h3>
                
                <div className="flex items-center space-x-3">
                    {/* Zoom Out Button */}
                    <button
                        onClick={handleZoomOut}
                        disabled={disabled || scale <= 0.1}
                        className={`p-2 rounded-md border transition-colors ${
                            disabled || scale <= 0.1
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        title="Zoom out"
                        aria-label="Zoom out"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>

                    {/* Zoom Slider */}
                    <div className="flex-1 px-2">
                        <input
                            type="range"
                            min="0.1"
                            max="5.0"
                            step="0.1"
                            value={scale}
                            onChange={handleSliderChange}
                            disabled={disabled}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                                disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((scale - 0.1) / 4.9) * 100}%, #e5e7eb ${((scale - 0.1) / 4.9) * 100}%, #e5e7eb 100%)`
                            }}
                        />
                    </div>

                    {/* Zoom In Button */}
                    <button
                        onClick={handleZoomIn}
                        disabled={disabled || scale >= 5.0}
                        className={`p-2 rounded-md border transition-colors ${
                            disabled || scale >= 5.0
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        title="Zoom in"
                        aria-label="Zoom in"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Scale Display */}
                <div className="text-center mt-2">
                    <span className="text-sm text-gray-600">
                        {Math.round(scale * 100)}%
                    </span>
                </div>
            </div>

            {/* Reset Button */}
            <div className="reset-controls">
                <button
                    onClick={handleReset}
                    disabled={disabled || isResetting}
                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                        disabled || isResetting
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    title="Reset crop to optimal settings"
                >
                    {isResetting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Resetting...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset Crop
                        </>
                    )}
                </button>
            </div>

            {/* Quality Indicator */}
            <div className="quality-indicator">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quality Assessment</h3>
                
                <div className={`p-3 rounded-md border ${qualityDisplay.bgColor} ${qualityDisplay.borderColor}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{qualityDisplay.icon}</span>
                            <span className={`font-medium ${qualityDisplay.color}`}>
                                {qualityDisplay.text}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            ~{Math.round(validation.estimatedFileSize / 1024)}KB
                        </div>
                    </div>

                    {/* Quality Details */}
                    {validation.warnings.length > 0 && (
                        <div className="space-y-1">
                            {validation.warnings.map((warning, index) => (
                                <p key={index} className={`text-xs ${qualityDisplay.color}`}>
                                    • {warning}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Quality Tips */}
                    {validation.quality === 'low' && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                            <p className="font-medium mb-1">💡 Tips to improve quality:</p>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Zoom out to include more of the image</li>
                                <li>• Select a larger crop area</li>
                                <li>• Use a higher resolution image</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
                <div className="validation-errors">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-red-800">Validation Errors</span>
                        </div>
                        <div className="space-y-1">
                            {validation.errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-700">
                                    • {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="keyboard-shortcuts">
                <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 select-none">
                        Keyboard Shortcuts
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                        <div className="flex justify-between">
                            <span>Zoom In:</span>
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">+</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span>Zoom Out:</span>
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">-</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span>Reset:</span>
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+R</kbd>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};