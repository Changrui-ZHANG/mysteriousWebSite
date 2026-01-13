/**
 * Core TypeScript interfaces for avatar cropping functionality
 * These types define the structure for crop areas, states, and results
 */

/**
 * Represents a rectangular crop area with position and dimensions
 * Always maintains a square ratio (width === height)
 */
export interface CropArea {
    /** X position of the crop area in image coordinates */
    x: number;
    /** Y position of the crop area in image coordinates */
    y: number;
    /** Width of the crop area (always equal to height for square ratio) */
    width: number;
    /** Height of the crop area (always equal to width for square ratio) */
    height: number;
}

/**
 * Complete state of the cropping interface
 */
export interface CropState {
    /** The loaded image element */
    image: HTMLImageElement;
    /** Current crop area selection */
    cropArea: CropArea;
    /** Current zoom scale factor (1.0 = original size) */
    scale: number;
    /** Rotation in degrees (for future extensions) */
    rotation: number;
    /** Whether the current crop configuration is valid */
    isValid: boolean;
    /** Estimated quality of the crop result */
    quality: CropQuality;
}

/**
 * Result of the cropping operation
 */
export interface CropResult {
    /** The cropped image as a Blob for upload */
    croppedImageBlob: Blob;
    /** URL for preview of the cropped image */
    croppedImageUrl: string;
    /** Final dimensions of the cropped image */
    finalDimensions: {
        width: number;
        height: number;
    };
    /** Quality assessment of the final result */
    quality: CropQuality;
}

/**
 * Validation result for crop parameters
 */
export interface CropValidation {
    /** Whether the crop configuration is valid */
    isValid: boolean;
    /** List of validation errors */
    errors: string[];
    /** List of validation warnings */
    warnings: string[];
    /** Estimated quality of the crop */
    quality: CropQuality;
    /** Estimated file size in bytes */
    estimatedFileSize: number;
}

/**
 * Quality levels for crop assessment
 */
export type CropQuality = 'high' | 'medium' | 'low';

/**
 * Options for configuring the cropper
 */
export interface CropperOptions {
    /** Maximum file size in bytes */
    maxFileSize?: number;
    /** Minimum crop size in pixels */
    minCropSize?: number;
    /** Maximum scale factor */
    maxScale?: number;
    /** Output image size in pixels */
    outputSize?: number;
    /** JPEG quality for output (0-1) */
    outputQuality?: number;
}

/**
 * Props for the main AvatarCropper component
 */
export interface AvatarCropperProps {
    /** The image file to crop */
    imageFile: File;
    /** Callback when cropping is completed */
    onCropComplete: (result: CropResult) => void;
    /** Callback when cropping is cancelled */
    onCancel: () => void;
    /** Initial crop area (optional) */
    initialCropArea?: Partial<CropArea>;
    /** Cropper configuration options */
    options?: CropperOptions;
}

/**
 * Props for the CropCanvas component
 */
export interface CropCanvasProps {
    /** The image to display and crop */
    image: HTMLImageElement;
    /** Current crop area */
    cropArea: CropArea;
    /** Current scale factor */
    scale: number;
    /** Callback when crop area changes */
    onCropAreaChange: (area: CropArea) => void;
    /** Callback when scale changes */
    onScaleChange: (scale: number) => void;
    /** Minimum crop size in pixels */
    minCropSize: number;
    /** Maximum scale factor */
    maxScale: number;
    /** Canvas container class name */
    className?: string;
}

/**
 * Props for the CropPreview component
 */
export interface CropPreviewProps {
    /** The image to preview */
    image: HTMLImageElement;
    /** Current crop area */
    cropArea: CropArea;
    /** Current scale factor */
    scale: number;
    /** Size of the preview in pixels */
    previewSize: number;
    /** Whether to show circular preview */
    showCircular: boolean;
    /** Whether to show context previews */
    showContextPreviews: boolean;
    /** Preview container class name */
    className?: string;
}

/**
 * Props for the CropControls component
 */
export interface CropControlsProps {
    /** Current scale factor */
    scale: number;
    /** Callback when scale changes */
    onScaleChange: (scale: number) => void;
    /** Callback to reset crop to default */
    onReset: () => void;
    /** Current crop validation */
    validation: CropValidation;
    /** Whether controls are disabled */
    disabled?: boolean;
    /** Controls container class name */
    className?: string;
}

/**
 * Props for the CropValidation component
 */
export interface CropValidationProps {
    /** Current validation state */
    validation: CropValidation;
    /** Whether to show detailed messages */
    showDetails?: boolean;
    /** Validation display class name */
    className?: string;
}

/**
 * Canvas interaction state for mouse/touch handling
 */
export interface CanvasInteractionState {
    /** Whether user is currently dragging */
    isDragging: boolean;
    /** Whether user is currently resizing */
    isResizing: boolean;
    /** Which resize handle is being used */
    resizeHandle: ResizeHandle | null;
    /** Last mouse/touch position */
    lastPosition: { x: number; y: number } | null;
    /** Starting position for drag/resize operation */
    startPosition: { x: number; y: number } | null;
    /** Starting crop area for drag/resize operation */
    startCropArea: CropArea | null;
}

/**
 * Resize handle positions for crop area manipulation
 */
export type ResizeHandle = 
    | 'top-left' 
    | 'top-right' 
    | 'bottom-left' 
    | 'bottom-right' 
    | 'top' 
    | 'right' 
    | 'bottom' 
    | 'left';

/**
 * Image dimensions interface
 */
export interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Canvas coordinates interface
 */
export interface CanvasCoordinates {
    x: number;
    y: number;
}