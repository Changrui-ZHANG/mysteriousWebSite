import { fetchJson, deleteJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';

/**
 * Repository for avatar file operations
 * Handles file uploads, deletions, and default avatar management
 */
export class AvatarRepository {
    /**
     * Upload avatar file for a user
     */
    async uploadFile(userId: string, file: File, requesterId: string): Promise<string> {
        const formData = new FormData();
        formData.append('avatar', file);

        const url = `${API_ENDPOINTS.AVATARS.UPLOAD(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
        const response = await fetch(url, {
            method: 'POST', // FIXED: Changed from PUT to POST
            body: formData,
            credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || result.avatarUrl; // FIXED: Handle both response formats
    }

    /**
     * Upload avatar with progress tracking
     */
    async uploadFileWithProgress(
        userId: string,
        file: File,
        requesterId: string,
        onProgress?: (progress: number) => void
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('avatar', file);

            const xhr = new XMLHttpRequest();

            // Track upload progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        onProgress(progress);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result.data || result.avatarUrl); // FIXED: Handle both response formats
                    } catch (error) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.message || `Upload failed: ${xhr.statusText}`));
                    } catch {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            const url = `${API_ENDPOINTS.AVATARS.UPLOAD(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
            xhr.open('POST', url);
            xhr.withCredentials = true; // Include cookies for authentication
            xhr.send(formData);
        });
    }

    /**
     * Delete avatar file for a user
     */
    async deleteFile(userId: string, requesterId: string): Promise<void> {
        const url = `${API_ENDPOINTS.AVATARS.DELETE(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
        return deleteJson<void>(url);
    }

    /**
     * Get list of default avatar options
     */
    async getDefaultAvatars(): Promise<string[]> {
        return fetchJson<string[]>(API_ENDPOINTS.AVATARS.DEFAULTS);
    }

    /**
     * Validate image file before upload (async version for thorough validation)
     */
    async validateImageFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            errors.push('File size must be less than 5MB');
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            errors.push('File must be JPEG, PNG, or WebP format');
        }

        // If basic checks fail, return early
        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        // Check file signature for additional validation
        return new Promise<{ isValid: boolean; errors: string[] }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target?.result as ArrayBuffer);
                const header = Array.from(arr.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');

                // Check file signatures
                const isJPEG = header.startsWith('ffd8');
                const isPNG = header.startsWith('89504e47');
                const isWebP = arr.length >= 12 &&
                    String.fromCharCode(...arr.slice(0, 4)) === 'RIFF' &&
                    String.fromCharCode(...arr.slice(8, 12)) === 'WEBP';

                if (!isJPEG && !isPNG && !isWebP) {
                    errors.push('File does not appear to be a valid image');
                }

                resolve({ isValid: errors.length === 0, errors });
            };

            reader.onerror = () => {
                errors.push('Could not read file');
                resolve({ isValid: false, errors });
            };

            reader.readAsArrayBuffer(file.slice(0, 12));
        });
    }

    /**
     * Synchronous validation for basic checks
     */
    validateImageFileSync(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            errors.push('File size must be less than 5MB');
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            errors.push('File must be JPEG, PNG, or WebP format');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Check if avatar URL is accessible
     */
    async isAvatarAccessible(avatarUrl: string): Promise<boolean> {
        try {
            const response = await fetch(avatarUrl, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get image dimensions from file
     */
    async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Could not load image to get dimensions'));
            };

            img.src = url;
        });
    }

    /**
     * Create a preview URL for the file
     */
    createPreviewUrl(file: File): string {
        return URL.createObjectURL(file);
    }

    /**
     * Revoke a preview URL to free memory
     */
    revokePreviewUrl(url: string): void {
        URL.revokeObjectURL(url);
    }
}