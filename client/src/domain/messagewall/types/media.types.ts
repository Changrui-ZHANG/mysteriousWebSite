/**
 * Media Types
 * Types pour le système d'upload de médias du MessageWall
 */

export interface MediaUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface MediaUploadError {
  code: MediaErrorCode;
  message: string;
  details?: string;
}

export enum MediaErrorCode {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export interface ImageUploadOptions {
  maxSize?: number; // MB, default: 5
  maxDimensions?: { width: number; height: number }; // default: 4096x4096
  quality?: number; // 0-1, default: 0.8
  acceptedFormats?: string[]; // default: ['jpg', 'jpeg', 'png', 'gif', 'webp']
}

export interface MediaUploadState {
  isUploading: boolean;
  progress: number; // 0-100
  error: MediaUploadError | null;
  result: MediaUploadResult | null;
}

export interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  mimeType: string;
}

/**
 * Configuration par défaut pour l'upload d'images
 */
export const DEFAULT_IMAGE_UPLOAD_OPTIONS: Required<ImageUploadOptions> = {
  maxSize: 5, // 5MB
  maxDimensions: { width: 4096, height: 4096 },
  quality: 0.8,
  acceptedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

/**
 * Formats MIME supportés
 */
export const SUPPORTED_MIME_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
} as const;