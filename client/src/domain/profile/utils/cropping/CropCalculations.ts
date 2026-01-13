/**
 * CropCalculations utility class for crop area calculations and transformations
 * Handles square ratio enforcement, coordinate conversions, and scale calculations
 */

import { 
    CropArea, 
    CropQuality, 
    ImageDimensions 
} from '../../components/cropping/types';
import { 
    CropCalculationResult, 
    BoundaryConstraintResult, 
    CoordinateConversionParams, 
    OptimalScaleParams
} from './types';
import { 
    DEFAULT_CROPPER_OPTIONS, 
    QUALITY_THRESHOLDS 
} from './constants';

export class CropCalculations {
    /**
     * Enforce square ratio on a crop area
     * Always maintains width === height
     */
    static enforceSquareRatio(cropArea: CropArea): CropArea {
        // Use the smaller dimension to maintain square ratio
        const size = Math.min(cropArea.width, cropArea.height);
        
        return {
            x: cropArea.x,
            y: cropArea.y,
            width: size,
            height: size
        };
    }

    /**
     * Constrain crop area to stay within image boundaries
     */
    static constrainToImageBounds(
        cropArea: CropArea, 
        imageSize: ImageDimensions
    ): BoundaryConstraintResult {
        const appliedConstraints: string[] = [];
        let constrainedArea = { ...cropArea };
        let wasConstrained = false;

        // Ensure crop area doesn't extend beyond image boundaries
        if (constrainedArea.x < 0) {
            constrainedArea.x = 0;
            wasConstrained = true;
            appliedConstraints.push('left-boundary');
        }

        if (constrainedArea.y < 0) {
            constrainedArea.y = 0;
            wasConstrained = true;
            appliedConstraints.push('top-boundary');
        }

        if (constrainedArea.x + constrainedArea.width > imageSize.width) {
            constrainedArea.x = imageSize.width - constrainedArea.width;
            wasConstrained = true;
            appliedConstraints.push('right-boundary');
        }

        if (constrainedArea.y + constrainedArea.height > imageSize.height) {
            constrainedArea.y = imageSize.height - constrainedArea.height;
            wasConstrained = true;
            appliedConstraints.push('bottom-boundary');
        }

        // If crop area is still too large, resize it
        if (constrainedArea.width > imageSize.width || constrainedArea.height > imageSize.height) {
            const maxSize = Math.min(imageSize.width, imageSize.height);
            constrainedArea.width = maxSize;
            constrainedArea.height = maxSize;
            constrainedArea.x = (imageSize.width - maxSize) / 2;
            constrainedArea.y = (imageSize.height - maxSize) / 2;
            wasConstrained = true;
            appliedConstraints.push('size-constraint');
        }

        // Ensure minimum size
        const minSize = DEFAULT_CROPPER_OPTIONS.minCropSize;
        if (constrainedArea.width < minSize || constrainedArea.height < minSize) {
            constrainedArea.width = minSize;
            constrainedArea.height = minSize;
            wasConstrained = true;
            appliedConstraints.push('minimum-size');
        }

        return {
            constrainedArea,
            wasConstrained,
            appliedConstraints
        };
    }

    /**
     * Calculate optimal scale factor for displaying image in container
     */
    static calculateOptimalScale(params: OptimalScaleParams): number {
        const {
            imageDimensions,
            containerDimensions,
            minScale = 0.1,
            maxScale = DEFAULT_CROPPER_OPTIONS.maxScale,
            padding = 20
        } = params;

        // Calculate available space (container minus padding)
        const availableWidth = containerDimensions.width - (padding * 2);
        const availableHeight = containerDimensions.height - (padding * 2);

        // Calculate scale factors for both dimensions
        const scaleX = availableWidth / imageDimensions.width;
        const scaleY = availableHeight / imageDimensions.height;

        // Use the smaller scale to ensure image fits completely
        let scale = Math.min(scaleX, scaleY);

        // Apply min/max constraints
        scale = Math.max(minScale, Math.min(maxScale, scale));

        return scale;
    }

    /**
     * Convert canvas coordinates to image coordinates
     */
    static canvasToImageCoordinates(params: CoordinateConversionParams): { x: number; y: number } {
        const { canvasCoords, canvasDimensions, imageDimensions, scale, offset } = params;

        // Calculate actual drawn image dimensions
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        const canvasAspectRatio = canvasDimensions.width / canvasDimensions.height;

        let drawWidth, drawHeight;
        
        // Fit image to canvas while preserving aspect ratio
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawWidth = canvasDimensions.width;
            drawHeight = canvasDimensions.width / imageAspectRatio;
        } else {
            // Image is taller than canvas
            drawHeight = canvasDimensions.height;
            drawWidth = canvasDimensions.height * imageAspectRatio;
        }

        // Apply scale to get actual drawn dimensions
        const scaledDrawWidth = drawWidth * scale;
        const scaledDrawHeight = drawHeight * scale;

        // Calculate scale factors between drawn image and original image
        const scaleX = scaledDrawWidth / imageDimensions.width;
        const scaleY = scaledDrawHeight / imageDimensions.height;

        // Convert canvas coordinates to image coordinates
        const imageX = (canvasCoords.x - offset.x) / scaleX;
        const imageY = (canvasCoords.y - offset.y) / scaleY;

        return {
            x: Math.max(0, Math.min(imageDimensions.width, imageX)),
            y: Math.max(0, Math.min(imageDimensions.height, imageY))
        };
    }

    /**
     * Convert image coordinates to canvas coordinates
     */
    static imageToCanvasCoordinates(params: CoordinateConversionParams): { x: number; y: number } {
        const { canvasCoords, canvasDimensions, imageDimensions, scale, offset } = params;

        // Calculate actual drawn image dimensions
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        const canvasAspectRatio = canvasDimensions.width / canvasDimensions.height;

        let drawWidth, drawHeight;
        
        // Fit image to canvas while preserving aspect ratio
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawWidth = canvasDimensions.width;
            drawHeight = canvasDimensions.width / imageAspectRatio;
        } else {
            // Image is taller than canvas
            drawHeight = canvasDimensions.height;
            drawWidth = canvasDimensions.height * imageAspectRatio;
        }

        // Apply scale to get actual drawn dimensions
        const scaledDrawWidth = drawWidth * scale;
        const scaledDrawHeight = drawHeight * scale;

        // Calculate scale factors between original image and drawn image
        const scaleX = scaledDrawWidth / imageDimensions.width;
        const scaleY = scaledDrawHeight / imageDimensions.height;

        return {
            x: (canvasCoords.x * scaleX) + offset.x,
            y: (canvasCoords.y * scaleY) + offset.y
        };
    }

    /**
     * Calculate image offset for centering in canvas
     */
    static calculateImageOffset(
        imageDimensions: ImageDimensions,
        canvasDimensions: ImageDimensions,
        scale: number
    ): { x: number; y: number } {
        // Calculate image dimensions preserving aspect ratio (same logic as drawImage)
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        const canvasAspectRatio = canvasDimensions.width / canvasDimensions.height;

        let drawWidth, drawHeight;
        
        // Fit image to canvas while preserving aspect ratio
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawWidth = canvasDimensions.width;
            drawHeight = canvasDimensions.width / imageAspectRatio;
        } else {
            // Image is taller than canvas
            drawHeight = canvasDimensions.height;
            drawWidth = canvasDimensions.height * imageAspectRatio;
        }

        // Apply scale
        const scaledWidth = drawWidth * scale;
        const scaledHeight = drawHeight * scale;

        // Center the image
        return {
            x: (canvasDimensions.width - scaledWidth) / 2,
            y: (canvasDimensions.height - scaledHeight) / 2
        };
    }

    /**
     * Estimate quality based on crop parameters
     */
    static estimateQuality(
        cropSize: ImageDimensions
    ): CropQuality {
        // Calculate the resolution ratio
        const cropArea = cropSize.width * cropSize.height;
        const outputArea = DEFAULT_CROPPER_OPTIONS.outputSize * DEFAULT_CROPPER_OPTIONS.outputSize;
        const resolutionRatio = Math.sqrt(cropArea / outputArea);

        if (resolutionRatio >= QUALITY_THRESHOLDS.HIGH_QUALITY_RATIO) {
            return 'high';
        } else if (resolutionRatio >= QUALITY_THRESHOLDS.MEDIUM_QUALITY_RATIO) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Calculate crop area from center point and size
     */
    static cropAreaFromCenter(
        centerX: number, 
        centerY: number, 
        size: number, 
        imageDimensions: ImageDimensions
    ): CropArea {
        const halfSize = size / 2;
        
        let cropArea: CropArea = {
            x: centerX - halfSize,
            y: centerY - halfSize,
            width: size,
            height: size
        };

        // Constrain to image bounds
        const constraintResult = this.constrainToImageBounds(cropArea, imageDimensions);
        return constraintResult.constrainedArea;
    }

    /**
     * Calculate crop area that fits entirely within image bounds
     */
    static calculateMaximumCropArea(imageDimensions: ImageDimensions): CropArea {
        const size = Math.min(imageDimensions.width, imageDimensions.height);
        const x = (imageDimensions.width - size) / 2;
        const y = (imageDimensions.height - size) / 2;

        return {
            x: Math.max(0, x),
            y: Math.max(0, y),
            width: size,
            height: size
        };
    }

    /**
     * Scale crop area by a factor while maintaining center
     */
    static scaleCropArea(
        cropArea: CropArea, 
        scaleFactor: number, 
        imageDimensions: ImageDimensions
    ): CropArea {
        // Calculate center of current crop area
        const centerX = cropArea.x + (cropArea.width / 2);
        const centerY = cropArea.y + (cropArea.height / 2);

        // Calculate new size
        const newSize = cropArea.width * scaleFactor;

        // Create new crop area centered on the same point
        const newCropArea = this.cropAreaFromCenter(centerX, centerY, newSize, imageDimensions);

        // Ensure minimum size
        const minSize = DEFAULT_CROPPER_OPTIONS.minCropSize;
        if (newCropArea.width < minSize) {
            return this.cropAreaFromCenter(centerX, centerY, minSize, imageDimensions);
        }

        return newCropArea;
    }

    /**
     * Move crop area by delta while keeping it in bounds
     */
    static moveCropArea(
        cropArea: CropArea, 
        deltaX: number, 
        deltaY: number, 
        imageDimensions: ImageDimensions
    ): CropArea {
        const movedArea: CropArea = {
            x: cropArea.x + deltaX,
            y: cropArea.y + deltaY,
            width: cropArea.width,
            height: cropArea.height
        };

        const constraintResult = this.constrainToImageBounds(movedArea, imageDimensions);
        return constraintResult.constrainedArea;
    }

    /**
     * Check if a point is inside a crop area
     */
    static isPointInCropArea(point: { x: number; y: number }, cropArea: CropArea): boolean {
        return point.x >= cropArea.x && 
               point.x <= cropArea.x + cropArea.width &&
               point.y >= cropArea.y && 
               point.y <= cropArea.y + cropArea.height;
    }

    /**
     * Calculate distance from point to crop area edge
     */
    static distanceToEdge(point: { x: number; y: number }, cropArea: CropArea): number {
        const dx = Math.max(cropArea.x - point.x, 0, point.x - (cropArea.x + cropArea.width));
        const dy = Math.max(cropArea.y - point.y, 0, point.y - (cropArea.y + cropArea.height));
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get the closest resize handle to a point
     */
    static getClosestResizeHandle(
        point: { x: number; y: number }, 
        cropArea: CropArea, 
        handleSize: number = 8
    ): string | null {
        const handles = [
            { name: 'top-left', x: cropArea.x, y: cropArea.y },
            { name: 'top-right', x: cropArea.x + cropArea.width, y: cropArea.y },
            { name: 'bottom-left', x: cropArea.x, y: cropArea.y + cropArea.height },
            { name: 'bottom-right', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
            { name: 'top', x: cropArea.x + cropArea.width / 2, y: cropArea.y },
            { name: 'right', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 },
            { name: 'bottom', x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height },
            { name: 'left', x: cropArea.x, y: cropArea.y + cropArea.height / 2 }
        ];

        for (const handle of handles) {
            const distance = Math.sqrt(
                Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2)
            );
            
            if (distance <= handleSize) {
                return handle.name;
            }
        }

        return null;
    }

    /**
     * Resize crop area from a specific handle
     */
    static resizeCropAreaFromHandle(
        cropArea: CropArea,
        handleName: string,
        newPoint: { x: number; y: number },
        imageDimensions: ImageDimensions
    ): CropArea {
        let newCropArea = { ...cropArea };

        switch (handleName) {
            case 'top-left':
                const newWidth = cropArea.x + cropArea.width - newPoint.x;
                const newHeight = cropArea.y + cropArea.height - newPoint.y;
                const newSize = Math.min(newWidth, newHeight);
                newCropArea = {
                    x: cropArea.x + cropArea.width - newSize,
                    y: cropArea.y + cropArea.height - newSize,
                    width: newSize,
                    height: newSize
                };
                break;

            case 'top-right':
                const widthFromRight = newPoint.x - cropArea.x;
                const heightFromTop = cropArea.y + cropArea.height - newPoint.y;
                const sizeFromTopRight = Math.min(widthFromRight, heightFromTop);
                newCropArea = {
                    x: cropArea.x,
                    y: cropArea.y + cropArea.height - sizeFromTopRight,
                    width: sizeFromTopRight,
                    height: sizeFromTopRight
                };
                break;

            case 'bottom-left':
                const widthFromLeft = cropArea.x + cropArea.width - newPoint.x;
                const heightFromBottom = newPoint.y - cropArea.y;
                const sizeFromBottomLeft = Math.min(widthFromLeft, heightFromBottom);
                newCropArea = {
                    x: cropArea.x + cropArea.width - sizeFromBottomLeft,
                    y: cropArea.y,
                    width: sizeFromBottomLeft,
                    height: sizeFromBottomLeft
                };
                break;

            case 'bottom-right':
                const widthFromBottomRight = newPoint.x - cropArea.x;
                const heightFromBottomRight = newPoint.y - cropArea.y;
                const sizeFromBottomRight = Math.min(widthFromBottomRight, heightFromBottomRight);
                newCropArea = {
                    x: cropArea.x,
                    y: cropArea.y,
                    width: sizeFromBottomRight,
                    height: sizeFromBottomRight
                };
                break;

            default:
                // For edge handles, calculate based on distance from center
                const centerX = cropArea.x + cropArea.width / 2;
                const centerY = cropArea.y + cropArea.height / 2;
                const distanceFromCenter = Math.max(
                    Math.abs(newPoint.x - centerX) * 2,
                    Math.abs(newPoint.y - centerY) * 2
                );
                newCropArea = this.cropAreaFromCenter(centerX, centerY, distanceFromCenter, imageDimensions);
                break;
        }

        // Ensure square ratio and constrain to bounds
        const squareArea = this.enforceSquareRatio(newCropArea);
        const constraintResult = this.constrainToImageBounds(squareArea, imageDimensions);
        
        return constraintResult.constrainedArea;
    }

    /**
     * Calculate comprehensive crop result with quality assessment
     */
    static calculateCropResult(
        imageDimensions: ImageDimensions,
        cropArea: CropArea,
        scale: number
    ): CropCalculationResult {
        // Ensure square ratio
        const squareCropArea = this.enforceSquareRatio(cropArea);
        
        // Constrain to image bounds
        const constraintResult = this.constrainToImageBounds(squareCropArea, imageDimensions);
        
        // Calculate quality
        const quality = this.estimateQuality({
            width: constraintResult.constrainedArea.width,
            height: constraintResult.constrainedArea.height
        });

        return {
            cropArea: constraintResult.constrainedArea,
            isValid: !constraintResult.wasConstrained || constraintResult.constrainedArea.width >= DEFAULT_CROPPER_OPTIONS.minCropSize,
            quality,
            scale
        };
    }
}