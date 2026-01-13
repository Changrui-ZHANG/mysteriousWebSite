/**
 * Utility types for avatar cropping functionality
 * These types are used by cropping utilities and helper functions
 */

import { CropArea, CropQuality, ImageDimensions } from '../../components/cropping/types';

/**
 * Image processing result
 */
export interface ImageProcessingResult {
    /** Processed image blob */
    blob: Blob;
    /** Preview URL for the processed image */
    url: string;
    /** Final dimensions */
    dimensions: ImageDimensions;
    /** Processing quality */
    quality: CropQuality;
    /** File size in bytes */
    fileSize: number;
}

/**
 * Image loading result
 */
export interface ImageLoadResult {
    /** Loaded image element */
    image: HTMLImageElement;
    /** Original dimensions */
    dimensions: ImageDimensions;
    /** File size in bytes */
    fileSize: number;
    /** Image format */
    format: string;
}

/**
 * Crop calculation result
 */
export interface CropCalculationResult {
    /** Calculated crop area */
    cropArea: CropArea;
    /** Whether the crop is valid */
    isValid: boolean;
    /** Quality assessment */
    quality: CropQuality;
    /** Scale factor used */
    scale: number;
}

/**
 * Canvas drawing context
 */
export interface CanvasDrawingContext {
    /** Canvas 2D context */
    ctx: CanvasRenderingContext2D;
    /** Canvas dimensions */
    canvasDimensions: ImageDimensions;
    /** Image dimensions */
    imageDimensions: ImageDimensions;
    /** Current scale factor */
    scale: number;
    /** Image offset on canvas */
    offset: { x: number; y: number };
}

/**
 * Quality assessment parameters
 */
export interface QualityAssessmentParams {
    /** Original image dimensions */
    originalDimensions: ImageDimensions;
    /** Crop area dimensions */
    cropDimensions: ImageDimensions;
    /** Target output dimensions */
    outputDimensions: ImageDimensions;
    /** Scale factor applied */
    scale: number;
}

/**
 * Boundary constraint result
 */
export interface BoundaryConstraintResult {
    /** Constrained crop area */
    constrainedArea: CropArea;
    /** Whether constraints were applied */
    wasConstrained: boolean;
    /** List of constraints that were applied */
    appliedConstraints: string[];
}

/**
 * Coordinate conversion parameters
 */
export interface CoordinateConversionParams {
    /** Canvas coordinates */
    canvasCoords: { x: number; y: number };
    /** Canvas dimensions */
    canvasDimensions: ImageDimensions;
    /** Image dimensions */
    imageDimensions: ImageDimensions;
    /** Current scale factor */
    scale: number;
    /** Image offset on canvas */
    offset: { x: number; y: number };
}

/**
 * Optimal scale calculation parameters
 */
export interface OptimalScaleParams {
    /** Image dimensions */
    imageDimensions: ImageDimensions;
    /** Container dimensions */
    containerDimensions: ImageDimensions;
    /** Minimum scale factor */
    minScale?: number;
    /** Maximum scale factor */
    maxScale?: number;
    /** Padding around image */
    padding?: number;
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
    /** Whether the image is valid */
    isValid: boolean;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
    /** Image metadata */
    metadata: {
        dimensions: ImageDimensions;
        fileSize: number;
        format: string;
        hasAlpha: boolean;
    };
}

/**
 * Canvas performance metrics
 */
export interface CanvasPerformanceMetrics {
    /** Render time in milliseconds */
    renderTime: number;
    /** Memory usage estimate in bytes */
    memoryUsage: number;
    /** Frame rate (FPS) */
    frameRate: number;
    /** Whether performance is acceptable */
    isPerformant: boolean;
}

/**
 * Touch gesture data
 */
export interface TouchGestureData {
    /** Touch points */
    touches: Array<{ x: number; y: number; id: number }>;
    /** Gesture type */
    gestureType: 'none' | 'pan' | 'pinch' | 'drag';
    /** Scale factor for pinch gestures */
    scale: number;
    /** Translation for pan gestures */
    translation: { x: number; y: number };
    /** Rotation angle in degrees */
    rotation: number;
}

// Re-export component types for convenience
export type {
    CropArea,
    CropQuality,
    ImageDimensions
} from '../../components/cropping/types';