/**
 * Minimal types for avatar cropping functionality
 * Only essential types used by AvatarCropper component
 */

/**
 * Result of the cropping operation - matches AvatarCropper interface
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
    quality: 'high' | 'medium' | 'low';
}

/**
 * Options for configuring the cropper - matches AvatarCropper interface
 */
export interface CropperOptions {
    /** Output image size in pixels */
    outputSize?: number;
    /** Minimum crop size in pixels */
    minCropSize?: number;
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
    /** Cropper configuration options */
    options?: CropperOptions;
}