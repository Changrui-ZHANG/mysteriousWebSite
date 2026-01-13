/**
 * Essential constants for avatar cropping functionality
 * Only constants used by AvatarCropper component
 */

/**
 * Default cropper configuration options
 */
export const DEFAULT_CROPPER_OPTIONS = {
    /** Output image size: 256x256 pixels */
    outputSize: 256,
    /** Minimum crop size: 50x50 pixels */
    minCropSize: 50,
    /** JPEG output quality: 0.9 (90%) */
    outputQuality: 0.9,
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