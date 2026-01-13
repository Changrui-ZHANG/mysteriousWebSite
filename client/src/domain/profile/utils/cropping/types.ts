/**
 * Minimal utility types for avatar cropping functionality
 * Only essential types that might be needed for future extensions
 */

/**
 * Image dimensions interface
 */
export interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Basic crop result for internal use
 */
export interface CropResult {
    /** The cropped image as a Blob */
    croppedImageBlob: Blob;
    /** URL for preview of the cropped image */
    croppedImageUrl: string;
    /** Final dimensions of the cropped image */
    finalDimensions: ImageDimensions;
    /** Quality assessment of the final result */
    quality: 'high' | 'medium' | 'low';
}