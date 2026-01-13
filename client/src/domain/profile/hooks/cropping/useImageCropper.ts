/**
 * useImageCropper hook - Traditional cropping with movable crop area
 * Display full image with movable and resizable crop area
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
    CropState, 
    CropResult, 
    CropValidation,
    CropArea
} from '../../components/cropping/types';
import { 
    UseImageCropperReturn, 
    UseImageCropperOptions 
} from './types';
import { 
    ImageProcessor 
} from '../../utils/cropping';
import { 
    DEFAULT_CROPPER_OPTIONS 
} from '../../utils/cropping/constants';

export function useImageCropper(
    imageFile: File,
    options: UseImageCropperOptions = {}
): UseImageCropperReturn {
    const {
        onCropStateChange,
        onValidationChange,
        initialCropArea,
        ...cropperOptions
    } = options;

    // Merge with default options
    const config = useMemo(() => ({ 
        ...DEFAULT_CROPPER_OPTIONS, 
        ...cropperOptions 
    }), [cropperOptions]);

    // State
    const [cropState, setCropState] = useState<CropState | null>(null);
    const [validation, setValidation] = useState<CropValidation>({
        isValid: false,
        errors: [],
        warnings: [],
        quality: 'low',
        estimatedFileSize: 0
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for callbacks to avoid dependency issues
    const onCropStateChangeRef = useRef(onCropStateChange);
    const onValidationChangeRef = useRef(onValidationChange);
    const configRef = useRef(config);

    // Update refs when values change
    useEffect(() => {
        onCropStateChangeRef.current = onCropStateChange;
    }, [onCropStateChange]);

    useEffect(() => {
        onValidationChangeRef.current = onValidationChange;
    }, [onValidationChange]);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    // Refs for cleanup
    const imageRef = useRef<HTMLImageElement | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    /**
     * Validate crop area
     */
    const validateCropArea = useCallback((cropArea: CropArea, imageDimensions: { width: number; height: number }): CropValidation => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check minimum size
        if (cropArea.width < configRef.current.minCropSize || cropArea.height < configRef.current.minCropSize) {
            errors.push(`Crop area must be at least ${configRef.current.minCropSize}x${configRef.current.minCropSize} pixels`);
        }

        // Check bounds
        if (cropArea.x < 0 || cropArea.y < 0 || 
            cropArea.x + cropArea.width > imageDimensions.width || 
            cropArea.y + cropArea.height > imageDimensions.height) {
            errors.push('Crop area extends beyond image boundaries');
        }

        // Quality assessment
        const cropPixels = cropArea.width * cropArea.height;
        const outputPixels = configRef.current.outputSize * configRef.current.outputSize;
        const ratio = cropPixels / outputPixels;

        let quality: CropValidation['quality'];
        if (ratio >= 2) {
            quality = 'high';
        } else if (ratio >= 1) {
            quality = 'medium';
        } else {
            quality = 'low';
            warnings.push('Crop area is smaller than output size - image may appear pixelated');
        }

        // Estimate file size
        const estimatedFileSize = outputPixels * 3 * 0.8; // Rough JPEG estimate

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            quality,
            estimatedFileSize
        };
    }, []);

    /**
     * Initialize cropper with loaded image
     */
    const initializeCropper = useCallback(async () => {
        try {
            setIsProcessing(true);
            setError(null);

            // Load and validate image
            const loadResult = await ImageProcessor.loadImage(imageFile);
            imageRef.current = loadResult.image;

            // Calculate initial crop area (always square)
            let initialArea: CropArea;
            if (initialCropArea) {
                // If initial crop area is provided, make it square
                const size = initialCropArea.width || initialCropArea.height || Math.min(loadResult.image.width, loadResult.image.height) * 0.8;
                initialArea = {
                    x: initialCropArea.x || (loadResult.image.width - size) / 2,
                    y: initialCropArea.y || (loadResult.image.height - size) / 2,
                    width: size,
                    height: size // Always square
                };
            } else {
                // Default to center square (largest possible square that fits)
                const maxSquareSize = Math.min(loadResult.image.width, loadResult.image.height) * 0.8;
                initialArea = {
                    x: (loadResult.image.width - maxSquareSize) / 2,
                    y: (loadResult.image.height - maxSquareSize) / 2,
                    width: maxSquareSize,
                    height: maxSquareSize // Always square
                };
            }

            // Create initial crop state
            const initialState: CropState = {
                image: loadResult.image,
                cropArea: initialArea,
                scale: 1.0, // Not used in traditional cropping
                rotation: 0,
                isValid: true,
                quality: 'high'
            };

            setCropState(initialState);
            onCropStateChangeRef.current?.(initialState);

            // Validate initial crop area
            const initialValidation = validateCropArea(initialArea, {
                width: loadResult.image.width,
                height: loadResult.image.height
            });
            
            setValidation(initialValidation);
            onValidationChangeRef.current?.(initialValidation);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize cropper';
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [imageFile, initialCropArea, validateCropArea]);

    /**
     * Update crop area
     */
    const setCropArea = useCallback((newCropArea: CropArea) => {
        if (!cropState) return;

        const newState: CropState = {
            ...cropState,
            cropArea: newCropArea
        };

        setCropState(newState);
        onCropStateChangeRef.current?.(newState);

        // Validate new crop area
        const newValidation = validateCropArea(newCropArea, {
            width: cropState.image.width,
            height: cropState.image.height
        });
        
        setValidation(newValidation);
        onValidationChangeRef.current?.(newValidation);
    }, [cropState, validateCropArea]);

    /**
     * Update scale (not used in traditional cropping but kept for compatibility)
     */
    const setScale = useCallback((scale: number) => {
        if (!cropState) return;

        const newState: CropState = {
            ...cropState,
            scale
        };

        setCropState(newState);
        onCropStateChangeRef.current?.(newState);
    }, [cropState]);

    /**
     * Reset to initial state (always square)
     */
    const resetCrop = useCallback(() => {
        if (!cropState) return;

        // Reset to center square (largest possible square that fits)
        const maxSquareSize = Math.min(cropState.image.width, cropState.image.height) * 0.8;
        const resetArea: CropArea = {
            x: (cropState.image.width - maxSquareSize) / 2,
            y: (cropState.image.height - maxSquareSize) / 2,
            width: maxSquareSize,
            height: maxSquareSize // Always square
        };

        const resetState: CropState = {
            ...cropState,
            cropArea: resetArea,
            scale: 1.0,
            rotation: 0
        };

        setCropState(resetState);
        onCropStateChangeRef.current?.(resetState);

        // Validate reset crop area
        const resetValidation = validateCropArea(resetArea, {
            width: cropState.image.width,
            height: cropState.image.height
        });
        
        setValidation(resetValidation);
        onValidationChangeRef.current?.(resetValidation);
    }, [cropState, validateCropArea]);

    /**
     * Generate final crop result
     */
    const generateCropResult = useCallback(async (): Promise<CropResult> => {
        if (!cropState) {
            throw new Error('No crop state available');
        }

        try {
            setIsProcessing(true);
            setError(null);

            const result = await ImageProcessor.generateCropResult(
                cropState.image,
                cropState.cropArea,
                configRef.current.outputSize
            );

            // Store preview URL for cleanup
            previewUrlRef.current = result.croppedImageUrl;

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate crop result';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [cropState]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initialize cropper when image file changes
    useEffect(() => {
        initializeCropper();
    }, [imageFile]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clean up preview URL
            if (previewUrlRef.current) {
                ImageProcessor.revokePreviewUrl(previewUrlRef.current);
            }
        };
    }, []);

    // Return hook interface
    return {
        cropState: cropState || {
            image: new Image(),
            cropArea: { x: 0, y: 0, width: 256, height: 256 },
            scale: 1.0,
            rotation: 0,
            isValid: false,
            quality: 'low'
        },
        setCropArea,
        setScale,
        resetCrop,
        generateCropResult,
        validation,
        isProcessing,
        error,
        clearError
    };
}