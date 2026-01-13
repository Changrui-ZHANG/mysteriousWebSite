/**
 * Constants for avatar cropping functionality
 * These constants define default values, limits, and configuration options
 */

import { CropperOptions } from '../../components/cropping/types';

/**
 * Default cropper configuration options
 */
export const DEFAULT_CROPPER_OPTIONS: Required<CropperOptions> = {
    /** Maximum file size: 5MB */
    maxFileSize: 5 * 1024 * 1024,
    /** Minimum crop size: 128x128 pixels */
    minCropSize: 128,
    /** Maximum scale factor: 5x */
    maxScale: 5.0,
    /** Output image size: 256x256 pixels */
    outputSize: 256,
    /** JPEG output quality: 0.9 (90%) */
    outputQuality: 0.9,
} as const;

/**
 * Canvas configuration constants
 */
export const CANVAS_CONFIG = {
    /** Default canvas size */
    DEFAULT_SIZE: 400,
    /** Maximum canvas size for performance */
    MAX_SIZE: 800,
    /** Minimum canvas size */
    MIN_SIZE: 200,
    /** Canvas background color */
    BACKGROUND_COLOR: '#f8f9fa',
    /** Grid line color */
    GRID_COLOR: '#e9ecef',
    /** Crop area border color */
    CROP_BORDER_COLOR: '#007bff',
    /** Crop area border width */
    CROP_BORDER_WIDTH: 2,
    /** Resize handle size */
    HANDLE_SIZE: 8,
    /** Resize handle color */
    HANDLE_COLOR: '#007bff',
    /** Resize handle border color */
    HANDLE_BORDER_COLOR: '#ffffff',
} as const;

/**
 * Quality assessment thresholds
 */
export const QUALITY_THRESHOLDS = {
    /** High quality: crop area >= 80% of output size */
    HIGH_QUALITY_RATIO: 0.8,
    /** Medium quality: crop area >= 50% of output size */
    MEDIUM_QUALITY_RATIO: 0.5,
    /** Low quality: crop area < 50% of output size */
    LOW_QUALITY_RATIO: 0.5,
} as const;

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
    /** Maximum render time in milliseconds */
    MAX_RENDER_TIME: 16, // 60 FPS
    /** Debounce delay for canvas redraw */
    REDRAW_DEBOUNCE_MS: 10,
    /** Maximum memory usage in bytes (50MB) */
    MAX_MEMORY_USAGE: 50 * 1024 * 1024,
    /** Target frame rate */
    TARGET_FPS: 60,
    /** Performance warning threshold */
    PERFORMANCE_WARNING_MS: 100,
} as const;

/**
 * Interaction configuration
 */
export const INTERACTION_CONFIG = {
    /** Minimum drag distance to start drag operation */
    MIN_DRAG_DISTANCE: 5,
    /** Double-click time threshold in milliseconds */
    DOUBLE_CLICK_THRESHOLD: 300,
    /** Touch sensitivity multiplier */
    TOUCH_SENSITIVITY: 1.2,
    /** Zoom sensitivity for wheel events */
    ZOOM_SENSITIVITY: 0.02, // Réduit de 0.1 à 0.02 pour un zoom plus doux
    /** Maximum zoom speed */
    MAX_ZOOM_SPEED: 0.2, // Réduit de 0.5 à 0.2
    /** Minimum zoom speed */
    MIN_ZOOM_SPEED: 0.01,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
    CROP_TOO_SMALL: 'Crop area is too small. Minimum size is 128x128 pixels.',
    CROP_OUT_OF_BOUNDS: 'Crop area extends beyond image boundaries.',
    IMAGE_TOO_SMALL: 'Image is too small for cropping. Minimum image size is 128x128 pixels.',
    FILE_TOO_LARGE: 'File size exceeds maximum limit of 5MB.',
    INVALID_FORMAT: 'Invalid image format. Supported formats: JPEG, PNG, WebP.',
    PROCESSING_FAILED: 'Failed to process image. Please try again.',
    CANVAS_NOT_SUPPORTED: 'Canvas is not supported in this browser.',
    MEMORY_LIMIT_EXCEEDED: 'Image is too large and may cause performance issues.',
    LOW_QUALITY_WARNING: 'Crop area is small and may result in low quality output.',
    MEDIUM_QUALITY_WARNING: 'Crop area may result in medium quality output.',
} as const;

/**
 * Supported image formats
 */
export const SUPPORTED_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
] as const;

/**
 * File extension to MIME type mapping
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
} as const;

/**
 * Default crop area (centered square)
 */
export const DEFAULT_CROP_AREA = {
    x: 0,
    y: 0,
    width: 256,
    height: 256,
} as const;

/**
 * Animation configuration
 */
export const ANIMATION_CONFIG = {
    /** Default transition duration in milliseconds */
    TRANSITION_DURATION: 200,
    /** Easing function for transitions */
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** Fade in duration */
    FADE_IN_DURATION: 150,
    /** Fade out duration */
    FADE_OUT_DURATION: 100,
} as const;

/**
 * Preview configuration
 */
export const PREVIEW_CONFIG = {
    /** Default preview size */
    DEFAULT_SIZE: 128,
    /** Maximum preview size */
    MAX_SIZE: 256,
    /** Minimum preview size */
    MIN_SIZE: 64,
    /** Preview border radius for circular preview */
    BORDER_RADIUS: '50%',
    /** Preview border color */
    BORDER_COLOR: '#e9ecef',
    /** Preview border width */
    BORDER_WIDTH: 2,
} as const;

/**
 * Error codes for cropping operations
 */
export const CROP_ERROR_CODES = {
    IMAGE_LOAD_FAILED: 'IMAGE_LOAD_FAILED',
    CROP_AREA_TOO_SMALL: 'CROP_AREA_TOO_SMALL',
    CROP_AREA_OUT_OF_BOUNDS: 'CROP_AREA_OUT_OF_BOUNDS',
    CROP_PROCESSING_FAILED: 'CROP_PROCESSING_FAILED',
    CANVAS_NOT_SUPPORTED: 'CANVAS_NOT_SUPPORTED',
    INVALID_IMAGE_FORMAT: 'INVALID_IMAGE_FORMAT',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_CROP_PARAMETERS: 'INVALID_CROP_PARAMETERS',
    BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    CROP_COMPLETED: 'Image cropped successfully!',
    PREVIEW_GENERATED: 'Preview generated successfully.',
    VALIDATION_PASSED: 'Crop parameters are valid.',
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
    RESET_CROP: 'KeyR',
    ZOOM_IN: 'Equal', // Plus key
    ZOOM_OUT: 'Minus',
    CONFIRM_CROP: 'Enter',
    CANCEL_CROP: 'Escape',
} as const;

/**
 * Mobile/touch configuration
 */
export const MOBILE_CONFIG = {
    /** Minimum touch target size */
    MIN_TOUCH_TARGET: 44,
    /** Touch slop for gesture recognition */
    TOUCH_SLOP: 8,
    /** Pinch zoom sensitivity */
    PINCH_SENSITIVITY: 0.02,
    /** Maximum pinch scale */
    MAX_PINCH_SCALE: 3.0,
    /** Minimum pinch scale */
    MIN_PINCH_SCALE: 0.5,
} as const;