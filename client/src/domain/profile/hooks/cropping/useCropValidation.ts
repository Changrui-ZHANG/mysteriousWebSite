/**
 * useCropValidation hook - Crop validation and quality assessment
 * Handles crop parameter validation, quality assessment, and error messaging
 */

import { useState, useCallback, useMemo } from 'react';
import { 
    CropArea, 
    CropState, 
    CropValidation, 
    ImageDimensions 
} from '../../components/cropping/types';
import { 
    UseCropValidationReturn, 
    UseCropValidationOptions 
} from './types';
import { 
    DEFAULT_CROPPER_OPTIONS, 
    VALIDATION_MESSAGES, 
    QUALITY_THRESHOLDS 
} from '../../utils/cropping/constants';

export function useCropValidation(
    options: UseCropValidationOptions
): UseCropValidationReturn {
    const {
        minCropSize = DEFAULT_CROPPER_OPTIONS.minCropSize,
        maxFileSize = DEFAULT_CROPPER_OPTIONS.maxFileSize,
        outputSize = DEFAULT_CROPPER_OPTIONS.outputSize
    } = options;

    // State for current validation
    const [validation] = useState<CropValidation>({
        isValid: false,
        errors: [],
        warnings: [],
        quality: 'low',
        estimatedFileSize: 0
    });

    /**
     * Validate crop area dimensions
     */
    const validateCropDimensions = useCallback((
        cropArea: CropArea,
        imageDimensions: ImageDimensions
    ): { errors: string[]; warnings: string[] } => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check minimum size
        if (cropArea.width < minCropSize || cropArea.height < minCropSize) {
            errors.push(VALIDATION_MESSAGES.CROP_TOO_SMALL);
        }

        // Check if crop area is within image bounds
        if (cropArea.x < 0 || cropArea.y < 0) {
            errors.push(VALIDATION_MESSAGES.CROP_OUT_OF_BOUNDS);
        }

        if (cropArea.x + cropArea.width > imageDimensions.width ||
            cropArea.y + cropArea.height > imageDimensions.height) {
            errors.push(VALIDATION_MESSAGES.CROP_OUT_OF_BOUNDS);
        }

        // Check for square ratio (should always be maintained by calculations)
        if (Math.abs(cropArea.width - cropArea.height) > 1) {
            warnings.push('Crop area should maintain square ratio');
        }

        // Check if crop area is too close to image edges (quality warning)
        const edgeThreshold = 10;
        if (cropArea.x < edgeThreshold || cropArea.y < edgeThreshold ||
            cropArea.x + cropArea.width > imageDimensions.width - edgeThreshold ||
            cropArea.y + cropArea.height > imageDimensions.height - edgeThreshold) {
            warnings.push('Crop area is very close to image edges');
        }

        return { errors, warnings };
    }, [minCropSize]);

    /**
     * Assess crop quality based on resolution and scaling
     */
    const assessCropQuality = useCallback((
        cropArea: CropArea,
        imageDimensions: ImageDimensions
    ): { quality: CropValidation['quality']; warnings: string[] } => {
        const warnings: string[] = [];

        // Calculate resolution ratio
        const resolutionRatio = cropArea.width / outputSize;
        
        let quality: CropValidation['quality'];
        
        if (resolutionRatio >= QUALITY_THRESHOLDS.HIGH_QUALITY_RATIO) {
            quality = 'high';
        } else if (resolutionRatio >= QUALITY_THRESHOLDS.MEDIUM_QUALITY_RATIO) {
            quality = 'medium';
            warnings.push(VALIDATION_MESSAGES.MEDIUM_QUALITY_WARNING);
        } else {
            quality = 'low';
            warnings.push(VALIDATION_MESSAGES.LOW_QUALITY_WARNING);
        }

        // Additional quality checks
        const cropAreaRatio = (cropArea.width * cropArea.height) / (imageDimensions.width * imageDimensions.height);
        
        if (cropAreaRatio < 0.1) {
            warnings.push('Very small crop area may result in poor quality');
        }

        // Check for extreme upscaling
        if (resolutionRatio < 0.25) {
            warnings.push('Significant upscaling required - quality may be poor');
        }

        return { quality, warnings };
    }, [outputSize]);

    /**
     * Estimate final file size
     */
    const estimateFileSize = useCallback((
        quality: CropValidation['quality']
    ): number => {
        // Base calculation: output dimensions * bytes per pixel * compression factor
        const baseSize = outputSize * outputSize * 3; // RGB
        
        // Quality multipliers
        const qualityMultipliers = {
            high: 0.8,
            medium: 0.6,
            low: 0.4
        };

        // JPEG compression factor
        const compressionFactor = DEFAULT_CROPPER_OPTIONS.outputQuality;
        
        return Math.round(baseSize * qualityMultipliers[quality] * compressionFactor);
    }, [outputSize]);

    /**
     * Validate crop parameters comprehensively
     */
    const validateCrop = useCallback((cropState: CropState): CropValidation => {
        const { cropArea, image } = cropState;
        const imageDimensions = { width: image.width, height: image.height };

        // Validate dimensions
        const dimensionValidation = validateCropDimensions(cropArea, imageDimensions);
        
        // Assess quality
        const qualityAssessment = assessCropQuality(cropArea, imageDimensions);
        
        // Estimate file size
        const estimatedFileSize = estimateFileSize(qualityAssessment.quality);
        
        // Check file size limits
        const fileSizeErrors: string[] = [];
        if (estimatedFileSize > maxFileSize) {
            fileSizeErrors.push(VALIDATION_MESSAGES.FILE_TOO_LARGE);
        }

        // Combine all validation results
        const allErrors = [...dimensionValidation.errors, ...fileSizeErrors];
        const allWarnings = [...dimensionValidation.warnings, ...qualityAssessment.warnings];

        const validation: CropValidation = {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            quality: qualityAssessment.quality,
            estimatedFileSize
        };

        return validation;
    }, [validateCropDimensions, assessCropQuality, estimateFileSize, maxFileSize]);

    /**
     * Check if crop area is valid (basic check)
     */
    const isValidCrop = useCallback((
        cropArea: CropArea,
        imageDimensions: ImageDimensions
    ): boolean => {
        // Basic validation checks
        if (cropArea.width < minCropSize || cropArea.height < minCropSize) {
            return false;
        }

        if (cropArea.x < 0 || cropArea.y < 0) {
            return false;
        }

        if (cropArea.x + cropArea.width > imageDimensions.width ||
            cropArea.y + cropArea.height > imageDimensions.height) {
            return false;
        }

        return true;
    }, [minCropSize]);

    /**
     * Get quality assessment for crop area
     */
    const getQualityAssessment = useCallback((
        cropArea: CropArea,
        imageDimensions: ImageDimensions
    ): CropValidation['quality'] => {
        const assessment = assessCropQuality(cropArea, imageDimensions);
        return assessment.quality;
    }, [assessCropQuality]);

    /**
     * Get validation summary for display
     */
    const getValidationSummary = useCallback((validation: CropValidation): string => {
        if (validation.isValid) {
            if (validation.warnings.length === 0) {
                return `✓ Crop is valid with ${validation.quality} quality`;
            } else {
                return `⚠ Crop is valid but has ${validation.warnings.length} warning(s)`;
            }
        } else {
            return `✗ Crop is invalid: ${validation.errors.length} error(s)`;
        }
    }, []);

    /**
     * Get quality color for UI display
     */
    const getQualityColor = useCallback((quality: CropValidation['quality']): string => {
        switch (quality) {
            case 'high':
                return '#22c55e'; // green
            case 'medium':
                return '#f59e0b'; // amber
            case 'low':
                return '#ef4444'; // red
            default:
                return '#6b7280'; // gray
        }
    }, []);

    /**
     * Memoized validation helpers
     */
    const validationHelpers = useMemo(() => ({
        getValidationSummary,
        getQualityColor,
        hasErrors: validation.errors.length > 0,
        hasWarnings: validation.warnings.length > 0,
        isHighQuality: validation.quality === 'high',
        isMediumQuality: validation.quality === 'medium',
        isLowQuality: validation.quality === 'low'
    }), [validation, getValidationSummary, getQualityColor]);

    return {
        validation,
        validateCrop,
        isValidCrop,
        getQualityAssessment,
        ...validationHelpers
    };
}