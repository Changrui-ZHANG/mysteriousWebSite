/**
 * Hook-specific types for avatar cropping functionality
 * These types are used by cropping hooks and their return values
 */

import { 
    CropArea, 
    CropState, 
    CropResult, 
    CropValidation, 
    CropperOptions,
    CanvasInteractionState,
    CanvasCoordinates
} from '../../components/cropping/types';

/**
 * Return type for useImageCropper hook
 */
export interface UseImageCropperReturn {
    /** Current crop state */
    cropState: CropState;
    /** Function to update crop area */
    setCropArea: (area: CropArea) => void;
    /** Function to update scale */
    setScale: (scale: number) => void;
    /** Function to reset crop to default */
    resetCrop: () => void;
    /** Function to generate final crop result */
    generateCropResult: () => Promise<CropResult>;
    /** Current validation state */
    validation: CropValidation;
    /** Whether crop processing is in progress */
    isProcessing: boolean;
    /** Any error that occurred */
    error: string | null;
    /** Function to clear error */
    clearError: () => void;
}

/**
 * Return type for useCropCanvas hook
 */
export interface UseCropCanvasReturn {
    /** Mouse down event handler */
    handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    /** Mouse move event handler */
    handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    /** Mouse up event handler */
    handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    /** Wheel event handler for zoom */
    handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
    /** Touch start event handler */
    handleTouchStart: (event: React.TouchEvent<HTMLCanvasElement>) => void;
    /** Touch move event handler */
    handleTouchMove: (event: React.TouchEvent<HTMLCanvasElement>) => void;
    /** Touch end event handler */
    handleTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;
    /** Function to redraw canvas */
    redrawCanvas: () => void;
    /** Function to convert client coordinates to canvas coordinates */
    getCanvasCoordinates: (clientX: number, clientY: number) => CanvasCoordinates;
    /** Current interaction state */
    interactionState: CanvasInteractionState;
}

/**
 * Return type for useCropValidation hook
 */
export interface UseCropValidationReturn {
    /** Current validation result */
    validation: CropValidation;
    /** Function to validate crop parameters */
    validateCrop: (cropState: CropState) => CropValidation;
    /** Function to check if crop is valid */
    isValidCrop: (cropArea: CropArea, imageDimensions: { width: number; height: number }) => boolean;
    /** Function to get quality assessment */
    getQualityAssessment: (cropArea: CropArea, imageDimensions: { width: number; height: number }) => CropValidation['quality'];
}

/**
 * Options for useImageCropper hook
 */
export interface UseImageCropperOptions extends CropperOptions {
    /** Initial crop area */
    initialCropArea?: Partial<CropArea>;
    /** Callback when crop state changes */
    onCropStateChange?: (state: CropState) => void;
    /** Callback when validation changes */
    onValidationChange?: (validation: CropValidation) => void;
}

/**
 * Options for useCropCanvas hook - Traditional cropping with movable crop area
 */
export interface UseCropCanvasOptions {
    /** Canvas element ref */
    canvasRef: React.RefObject<HTMLCanvasElement>;
    /** Current crop state */
    cropState: CropState;
    /** Callback when crop area changes */
    onCropAreaChange?: (area: CropArea) => void;
    /** Whether interactions are disabled */
    disabled?: boolean;
}

/**
 * Options for useCropValidation hook
 */
export interface UseCropValidationOptions {
    /** Minimum crop size in pixels */
    minCropSize: number;
    /** Maximum file size in bytes */
    maxFileSize: number;
    /** Output image size in pixels */
    outputSize: number;
    /** Real-time validation enabled */
    realTimeValidation?: boolean;
}

// Re-export component types for convenience
export type {
    CropArea,
    CropState,
    CropResult,
    CropValidation,
    CropperOptions,
    CanvasInteractionState,
    ResizeHandle,
    CanvasCoordinates
} from '../../components/cropping/types';