import { AvatarRepository } from '../repositories/AvatarRepository';
import { validateFileUpload } from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';

/**
 * Service for avatar image processing and management
 * Handles file validation, image processing, and business rules
 */
export class AvatarService {
    private repository: AvatarRepository;

    constructor() {
        this.repository = new AvatarRepository();
    }

    /**
     * Upload and process avatar with validation and resizing
     */
    async uploadAvatar(userId: string, file: File, requesterId: string, onProgress?: (progress: number) => void): Promise<string> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        if (!requesterId) {
            throw new AppError(
                'Requester ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID du demandeur requis'
            );
        }

        // Validate file using schema
        const validation = validateFileUpload({ file });
        if (!validation.success) {
            throw new AppError(
                'Invalid file',
                ERROR_CODES.VALIDATION_ERROR,
                'Fichier invalide',
                validation.error
            );
        }

        // Additional validation using repository
        const repoValidation = this.repository.validateImageFileSync(file);
        if (!repoValidation.isValid) {
            throw new AppError(
                'File validation failed',
                ERROR_CODES.VALIDATION_ERROR,
                'Validation du fichier échouée',
                { errors: repoValidation.errors }
            );
        }

        // Business logic: Process image before upload
        const processedFile = await this.processImageForUpload(file);

        // Upload with progress tracking
        try {
            const avatarUrl = await this.repository.uploadFileWithProgress(
                userId, 
                processedFile, 
                requesterId,
                onProgress
            );

            // Business logic: Could add post-processing here (e.g., generate thumbnails)
            return avatarUrl;
        } catch (error) {
            throw new AppError(
                'Avatar upload failed',
                ERROR_CODES.OPERATION_FAILED,
                'Échec du téléchargement de l\'avatar',
                error
            );
        }
    }

    /**
     * Delete user's avatar
     */
    async deleteAvatar(userId: string, requesterId: string): Promise<void> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        if (!requesterId) {
            throw new AppError(
                'Requester ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID du demandeur requis'
            );
        }

        try {
            await this.repository.deleteFile(userId, requesterId);
        } catch (error) {
            throw new AppError(
                'Avatar deletion failed',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de la suppression de l\'avatar',
                error
            );
        }
    }

    /**
     * Get available default avatars
     */
    async getDefaultAvatars(): Promise<string[]> {
        try {
            return await this.repository.getDefaultAvatars();
        } catch (error) {
            throw new AppError(
                'Failed to load default avatars',
                ERROR_CODES.OPERATION_FAILED,
                'Échec du chargement des avatars par défaut',
                error
            );
        }
    }

    /**
     * Get user's current avatar URL with fallback
     */
    async getAvatarUrl(userId: string, fallbackToDefault: boolean = true): Promise<string | null> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        return this.repository.getAvatarUrl(userId, fallbackToDefault);
    }

    /**
     * Validate image file with comprehensive checks
     */
    async validateImageFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
        // Basic validation first
        const basicValidation = this.repository.validateImageFileSync(file);
        if (!basicValidation.isValid) {
            return basicValidation;
        }

        // Advanced validation with file signature check
        const advancedValidation = await this.repository.validateImageFile(file);
        if (!advancedValidation.isValid) {
            return advancedValidation;
        }

        // Business logic: Additional checks
        const businessValidation = await this.performBusinessValidation(file);
        return businessValidation;
    }

    /**
     * Create preview URL for file before upload
     */
    createPreviewUrl(file: File): string {
        return this.repository.createPreviewUrl(file);
    }

    /**
     * Revoke preview URL to free memory
     */
    revokePreviewUrl(url: string): void {
        this.repository.revokePreviewUrl(url);
    }

    /**
     * Get image dimensions
     */
    async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        try {
            return await this.repository.getImageDimensions(file);
        } catch (error) {
            throw new AppError(
                'Could not read image dimensions',
                ERROR_CODES.OPERATION_FAILED,
                'Impossible de lire les dimensions de l\'image',
                error
            );
        }
    }

    /**
     * Check if avatar URL is accessible
     */
    async isAvatarAccessible(avatarUrl: string): Promise<boolean> {
        return this.repository.isAvatarAccessible(avatarUrl);
    }

    // Private helper methods

    /**
     * Process image for upload (resize to 256x256)
     */
    private async processImageForUpload(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            img.onload = () => {
                // Set target dimensions (256x256 as per requirements)
                const targetSize = 256;
                canvas.width = targetSize;
                canvas.height = targetSize;

                // Calculate scaling to maintain aspect ratio
                const scale = Math.min(targetSize / img.width, targetSize / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;

                // Center the image
                const x = (targetSize - scaledWidth) / 2;
                const y = (targetSize - scaledHeight) / 2;

                // Determine output format based on original file type
                const originalType = file.type;
                const outputType = ['image/png', 'image/webp'].includes(originalType) ? originalType : 'image/jpeg';
                const outputQuality = outputType === 'image/jpeg' ? 0.9 : undefined;

                // For JPEG, fill background with white (for transparent images)
                // For PNG/WebP, preserve transparency
                if (outputType === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetSize, targetSize);
                }

                // Draw the resized image
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                // Convert back to file with original format
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to process image'));
                        return;
                    }

                    // Preserve original filename but update extension if needed
                    const originalName = file.name;
                    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                    const newExtension = outputType.split('/')[1];
                    const newFileName = `${nameWithoutExt}.${newExtension}`;

                    const processedFile = new File([blob], newFileName, {
                        type: outputType,
                        lastModified: Date.now()
                    });

                    resolve(processedFile);
                }, outputType, outputQuality);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for processing'));
            };

            // Load the image
            const url = URL.createObjectURL(file);
            img.src = url;

            // Clean up URL after loading
            img.addEventListener('load', () => {
                URL.revokeObjectURL(url);
            });
        });
    }

    /**
     * Perform business-specific validation
     */
    private async performBusinessValidation(file: File): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            // Check image dimensions
            const dimensions = await this.getImageDimensions(file);
            
            // Business rule: Minimum dimensions
            if (dimensions.width < 32 || dimensions.height < 32) {
                errors.push('Image must be at least 32x32 pixels');
            }

            // Business rule: Maximum dimensions (to prevent huge uploads)
            if (dimensions.width > 4096 || dimensions.height > 4096) {
                errors.push('Image must be smaller than 4096x4096 pixels');
            }

            // Business rule: Aspect ratio check (optional - could be too restrictive)
            const aspectRatio = dimensions.width / dimensions.height;
            if (aspectRatio < 0.5 || aspectRatio > 2.0) {
                // Allow some flexibility in aspect ratio
                // This is a soft warning that could be logged but not block upload
            }

        } catch (error) {
            errors.push('Could not analyze image properties');
        }

        return { isValid: errors.length === 0, errors };
    }
}