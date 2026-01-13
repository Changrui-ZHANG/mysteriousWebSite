/**
 * ImageProcessor class for image manipulation and processing
 * Handles image loading, validation, cropping, and quality assessment
 */

import { 
    CropArea, 
    CropQuality, 
    ImageDimensions,
    CropResult,
    CropValidation
} from '../../components/cropping/types';
import { 
    ImageLoadResult, 
    ImageValidationResult 
} from './types';
import { 
    DEFAULT_CROPPER_OPTIONS, 
    SUPPORTED_FORMATS, 
    VALIDATION_MESSAGES,
    QUALITY_THRESHOLDS
} from './constants';

export class ImageProcessor {
    /**
     * Load and validate an image file
     */
    static async loadImage(file: File): Promise<ImageLoadResult> {
        return new Promise((resolve, reject) => {
            // Validate file type first
            if (!SUPPORTED_FORMATS.includes(file.type as any)) {
                reject(new Error(VALIDATION_MESSAGES.INVALID_FORMAT));
                return;
            }

            // Validate file size
            if (file.size > DEFAULT_CROPPER_OPTIONS.maxFileSize) {
                reject(new Error(VALIDATION_MESSAGES.FILE_TOO_LARGE));
                return;
            }

            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                // Clean up the object URL
                URL.revokeObjectURL(url);

                // Validate minimum dimensions
                if (img.width < DEFAULT_CROPPER_OPTIONS.minCropSize || 
                    img.height < DEFAULT_CROPPER_OPTIONS.minCropSize) {
                    reject(new Error(VALIDATION_MESSAGES.IMAGE_TOO_SMALL));
                    return;
                }

                resolve({
                    image: img,
                    dimensions: {
                        width: img.width,
                        height: img.height
                    },
                    fileSize: file.size,
                    format: file.type
                });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
            };

            img.src = url;
        });
    }

    /**
     * Calculate optimal crop area for an image
     */
    static calculateOptimalCrop(image: HTMLImageElement): CropArea {
        const { width, height } = image;
        
        // Calculate the largest square that fits in the image
        const size = Math.min(width, height);
        
        // Center the crop area
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        return {
            x: Math.max(0, x),
            y: Math.max(0, y),
            width: size,
            height: size
        };
    }

    /**
     * Crop an image using canvas and return as blob
     */
    static async cropImage(
        image: HTMLImageElement, 
        cropArea: CropArea, 
        outputSize: number = DEFAULT_CROPPER_OPTIONS.outputSize
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            try {
                // Create canvas for cropping
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error(VALIDATION_MESSAGES.CANVAS_NOT_SUPPORTED));
                    return;
                }

                // Set canvas size to output size
                canvas.width = outputSize;
                canvas.height = outputSize;

                // Draw the cropped portion of the image
                ctx.drawImage(
                    image,
                    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                    0, 0, outputSize, outputSize
                );

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
                        }
                    },
                    'image/jpeg',
                    DEFAULT_CROPPER_OPTIONS.outputQuality
                );
            } catch (error) {
                reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
            }
        });
    }

    /**
     * Validate crop quality and parameters
     */
    static validateCropQuality(image: HTMLImageElement, cropArea: CropArea): CropValidation {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Check minimum crop size
        if (cropArea.width < DEFAULT_CROPPER_OPTIONS.minCropSize || 
            cropArea.height < DEFAULT_CROPPER_OPTIONS.minCropSize) {
            errors.push(VALIDATION_MESSAGES.CROP_TOO_SMALL);
        }

        // Check if crop area is within image bounds
        if (cropArea.x < 0 || cropArea.y < 0 || 
            cropArea.x + cropArea.width > image.width || 
            cropArea.y + cropArea.height > image.height) {
            errors.push(VALIDATION_MESSAGES.CROP_OUT_OF_BOUNDS);
        }

        // Calculate quality based on resolution ratio
        const outputSize = DEFAULT_CROPPER_OPTIONS.outputSize;
        const resolutionRatio = cropArea.width / outputSize;
        
        let quality: CropQuality;
        if (resolutionRatio >= QUALITY_THRESHOLDS.HIGH_QUALITY_RATIO) {
            quality = 'high';
        } else if (resolutionRatio >= QUALITY_THRESHOLDS.MEDIUM_QUALITY_RATIO) {
            quality = 'medium';
            warnings.push(VALIDATION_MESSAGES.MEDIUM_QUALITY_WARNING);
        } else {
            quality = 'low';
            warnings.push(VALIDATION_MESSAGES.LOW_QUALITY_WARNING);
        }

        // Estimate file size (rough calculation)
        const estimatedFileSize = Math.round(
            (outputSize * outputSize * 3 * DEFAULT_CROPPER_OPTIONS.outputQuality) / 8
        );

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            quality,
            estimatedFileSize
        };
    }

    /**
     * Optimize image for web delivery
     */
    static async optimizeForWeb(imageBlob: Blob, quality: number = DEFAULT_CROPPER_OPTIONS.outputQuality): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(imageBlob);

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        URL.revokeObjectURL(url);
                        reject(new Error(VALIDATION_MESSAGES.CANVAS_NOT_SUPPORTED));
                        return;
                    }

                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw image with potential optimizations
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(
                        (optimizedBlob) => {
                            URL.revokeObjectURL(url);
                            if (optimizedBlob) {
                                resolve(optimizedBlob);
                            } else {
                                reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                } catch (error) {
                    URL.revokeObjectURL(url);
                    reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(VALIDATION_MESSAGES.PROCESSING_FAILED));
            };

            img.src = url;
        });
    }

    /**
     * Validate image file before processing
     */
    static async validateImageFile(file: File): Promise<ImageValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check file type
        if (!SUPPORTED_FORMATS.includes(file.type as any)) {
            errors.push(VALIDATION_MESSAGES.INVALID_FORMAT);
        }

        // Check file size
        if (file.size > DEFAULT_CROPPER_OPTIONS.maxFileSize) {
            errors.push(VALIDATION_MESSAGES.FILE_TOO_LARGE);
        }

        // Check for potential memory issues
        if (file.size > DEFAULT_CROPPER_OPTIONS.maxFileSize * 0.8) {
            warnings.push(VALIDATION_MESSAGES.MEMORY_LIMIT_EXCEEDED);
        }

        try {
            // Load image to get dimensions
            const loadResult = await this.loadImage(file);
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                metadata: {
                    dimensions: loadResult.dimensions,
                    fileSize: loadResult.fileSize,
                    format: loadResult.format,
                    hasAlpha: file.type === 'image/png' // Simple alpha detection
                }
            };
        } catch (error) {
            errors.push(error instanceof Error ? error.message : VALIDATION_MESSAGES.PROCESSING_FAILED);
            
            return {
                isValid: false,
                errors,
                warnings,
                metadata: {
                    dimensions: { width: 0, height: 0 },
                    fileSize: file.size,
                    format: file.type,
                    hasAlpha: false
                }
            };
        }
    }

    /**
     * Generate complete crop result with preview URL
     */
    static async generateCropResult(
        image: HTMLImageElement,
        cropArea: CropArea,
        outputSize: number = DEFAULT_CROPPER_OPTIONS.outputSize
    ): Promise<CropResult> {
        try {
            // Validate crop first
            const validation = this.validateCropQuality(image, cropArea);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Crop the image
            const croppedImageBlob = await this.cropImage(image, cropArea, outputSize);
            
            // Create preview URL
            const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

            return {
                croppedImageBlob,
                croppedImageUrl,
                finalDimensions: {
                    width: outputSize,
                    height: outputSize
                },
                quality: validation.quality
            };
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : VALIDATION_MESSAGES.PROCESSING_FAILED
            );
        }
    }

    /**
     * Create a preview URL for a file (utility method)
     */
    static createPreviewUrl(file: File): string {
        return URL.createObjectURL(file);
    }

    /**
     * Revoke a preview URL to free memory
     */
    static revokePreviewUrl(url: string): void {
        URL.revokeObjectURL(url);
    }

    /**
     * Check if canvas is supported in the current browser
     */
    static isCanvasSupported(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch {
            return false;
        }
    }

    /**
     * Get image dimensions without loading the full image
     */
    static async getImageDimensions(file: File): Promise<ImageDimensions> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.width,
                    height: img.height
                });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image dimensions'));
            };

            img.src = url;
        });
    }
}