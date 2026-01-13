/**
 * CropValidation component - Validation messages and quality warnings
 * Displays validation errors, warnings, and recommendations
 */

import React from 'react';
import { CropValidationProps } from './types';

export const CropValidation: React.FC<CropValidationProps> = ({
    validation,
    showDetails = true,
    className = ''
}) => {
    /**
     * Get validation status icon and color
     */
    const getValidationStatus = () => {
        if (!validation.isValid) {
            return {
                icon: '❌',
                color: 'text-red-700',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                status: 'Invalid'
            };
        } else if (validation.warnings.length > 0) {
            return {
                icon: '⚠️',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                status: 'Valid with warnings'
            };
        } else {
            return {
                icon: '✅',
                color: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                status: 'Valid'
            };
        }
    };

    /**
     * Get quality badge styling
     */
    const getQualityBadge = () => {
        switch (validation.quality) {
            case 'high':
                return {
                    text: 'High Quality',
                    color: 'text-green-800',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-300'
                };
            case 'medium':
                return {
                    text: 'Medium Quality',
                    color: 'text-yellow-800',
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-300'
                };
            case 'low':
                return {
                    text: 'Low Quality',
                    color: 'text-red-800',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-300'
                };
            default:
                return {
                    text: 'Unknown',
                    color: 'text-gray-800',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300'
                };
        }
    };

    const validationStatus = getValidationStatus();
    const qualityBadge = getQualityBadge();

    // Don't render if no validation data
    if (!validation) {
        return null;
    }

    return (
        <div className={`crop-validation ${className}`}>
            {/* Main validation status */}
            <div className={`p-3 rounded-lg border ${validationStatus.bgColor} ${validationStatus.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{validationStatus.icon}</span>
                        <span className={`font-medium ${validationStatus.color}`}>
                            {validationStatus.status}
                        </span>
                    </div>
                    
                    {/* Quality badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${qualityBadge.color} ${qualityBadge.bgColor} ${qualityBadge.borderColor}`}>
                        {qualityBadge.text}
                    </div>
                </div>

                {/* File size estimate */}
                {validation.estimatedFileSize > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                        Estimated size: {Math.round(validation.estimatedFileSize / 1024)}KB
                    </div>
                )}

                {/* Validation errors */}
                {validation.errors.length > 0 && (
                    <div className="space-y-2">
                        <h4 className={`font-medium ${validationStatus.color}`}>
                            Errors ({validation.errors.length}):
                        </h4>
                        <ul className="space-y-1">
                            {validation.errors.map((error, index) => (
                                <li key={index} className={`text-sm ${validationStatus.color} flex items-start`}>
                                    <span className="mr-2 mt-0.5">•</span>
                                    <span>{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Validation warnings */}
                {validation.warnings.length > 0 && showDetails && (
                    <div className={`space-y-2 ${validation.errors.length > 0 ? 'mt-3 pt-3 border-t border-gray-200' : ''}`}>
                        <h4 className="font-medium text-yellow-700">
                            Warnings ({validation.warnings.length}):
                        </h4>
                        <ul className="space-y-1">
                            {validation.warnings.map((warning, index) => (
                                <li key={index} className="text-sm text-yellow-700 flex items-start">
                                    <span className="mr-2 mt-0.5">•</span>
                                    <span>{warning}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Detailed recommendations */}
            {showDetails && (validation.quality === 'low' || validation.errors.length > 0) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recommendations
                    </h4>
                    
                    <div className="space-y-2 text-sm text-blue-700">
                        {validation.quality === 'low' && (
                            <div>
                                <p className="font-medium">To improve quality:</p>
                                <ul className="mt-1 space-y-1 ml-4">
                                    <li>• Zoom out to include more of the original image</li>
                                    <li>• Select a larger crop area</li>
                                    <li>• Use a higher resolution source image</li>
                                </ul>
                            </div>
                        )}
                        
                        {validation.errors.some(error => error.includes('too small')) && (
                            <div>
                                <p className="font-medium">Crop area too small:</p>
                                <ul className="mt-1 space-y-1 ml-4">
                                    <li>• Drag the corner handles to make the crop area larger</li>
                                    <li>• Zoom out to see more of the image</li>
                                    <li>• Use the reset button to start with optimal settings</li>
                                </ul>
                            </div>
                        )}
                        
                        {validation.errors.some(error => error.includes('out of bounds')) && (
                            <div>
                                <p className="font-medium">Crop area out of bounds:</p>
                                <ul className="mt-1 space-y-1 ml-4">
                                    <li>• Drag the crop area to center it on the image</li>
                                    <li>• Resize the crop area to fit within the image</li>
                                    <li>• Zoom out to see the full image boundaries</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success message for valid crops */}
            {validation.isValid && validation.warnings.length === 0 && showDetails && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Perfect! Your crop is ready to use.</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                        The crop area meets all quality requirements and will produce a great avatar.
                    </p>
                </div>
            )}

            {/* Technical details (collapsible) */}
            {showDetails && (
                <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 select-none">
                        Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="font-medium">Validation Status:</span>
                                <span className="ml-1">{validation.isValid ? 'Valid' : 'Invalid'}</span>
                            </div>
                            <div>
                                <span className="font-medium">Quality Level:</span>
                                <span className="ml-1 capitalize">{validation.quality}</span>
                            </div>
                            <div>
                                <span className="font-medium">Error Count:</span>
                                <span className="ml-1">{validation.errors.length}</span>
                            </div>
                            <div>
                                <span className="font-medium">Warning Count:</span>
                                <span className="ml-1">{validation.warnings.length}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="font-medium">Estimated File Size:</span>
                                <span className="ml-1">
                                    {validation.estimatedFileSize > 0 
                                        ? `${Math.round(validation.estimatedFileSize / 1024)}KB (${validation.estimatedFileSize} bytes)`
                                        : 'Unknown'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
};