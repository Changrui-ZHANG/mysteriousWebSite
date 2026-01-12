import { useState, useCallback, useRef, useEffect } from 'react';
import { AvatarService } from '../services/AvatarService';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';

interface UseAvatarUploadProps {
    userId: string;
    onUploadComplete?: (avatarUrl: string) => void;
    onUploadError?: (error: string) => void;
}

interface UseAvatarUploadReturn {
    // State
    isUploading: boolean;
    uploadProgress: number;
    error: string | null;
    previewUrl: string | null;
    defaultAvatars: string[];
    isLoadingDefaults: boolean;
    
    // Actions
    uploadAvatar: (file: File) => Promise<void>;
    deleteAvatar: () => Promise<void>;
    validateFile: (file: File) => Promise<{ isValid: boolean; errors: string[] }>;
    createPreview: (file: File) => void;
    clearPreview: () => void;
    loadDefaultAvatars: () => Promise<void>;
    clearError: () => void;
    
    // Helpers
    canUpload: boolean;
    hasPreview: boolean;
}

/**
 * Hook for avatar upload functionality
 * Handles file upload with progress tracking, validation, and error handling
 */
export function useAvatarUpload({ 
    userId, 
    onUploadComplete, 
    onUploadError 
}: UseAvatarUploadProps): UseAvatarUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [defaultAvatars, setDefaultAvatars] = useState<string[]>([]);
    const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);
    
    const { handleError } = useErrorHandler();
    const { success: showToast, error: showErrorToast } = useToastContext();
    const avatarService = new AvatarService();
    const previewUrlRef = useRef<string | null>(null);

    // Computed values - Add safety check for userId
    const canUpload = !isUploading && Boolean(userId);
    const hasPreview = previewUrl !== null;

    /**
     * Clear preview URL and free memory
     */
    const clearPreview = useCallback(() => {
        if (previewUrlRef.current) {
            avatarService.revokePreviewUrl(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        setPreviewUrl(null);
    }, [avatarService]);

    /**
     * Create preview URL for file
     */
    const createPreview = useCallback((file: File) => {
        // Clear existing preview first
        clearPreview();
        
        try {
            const url = avatarService.createPreviewUrl(file);
            setPreviewUrl(url);
            previewUrlRef.current = url;
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
        }
    }, [avatarService, handleError, clearPreview]);

    /**
     * Upload avatar file
     */
    const uploadAvatar = useCallback(async (file: File) => {
        if (!canUpload || !userId) return; // Added userId check
        
        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError(null);
            
            // Validate file first
            const validation = await avatarService.validateImageFile(file);
            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ');
                setError(errorMessage);
                showErrorToast(`Invalid file: ${errorMessage}`);
                onUploadError?.(errorMessage);
                return;
            }
            
            // Upload with progress tracking - FIXED: correct parameter order
            const avatarUrl = await avatarService.uploadAvatar(
                userId, 
                file, 
                userId, // requesterId should be the same as userId for self-upload
                (progress) => setUploadProgress(progress)
            );
            
            showToast('Avatar uploaded successfully');
            onUploadComplete?.(avatarUrl);
            
            // FIXED: Delay clearing preview to allow parent component to update currentAvatarUrl first
            // This prevents blob URL errors when the component tries to display the old preview
            setTimeout(() => {
                clearPreview();
            }, 100);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Failed to upload avatar');
            onUploadError?.(userMessage);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [canUpload, userId, avatarService, handleError, showToast, showErrorToast, onUploadComplete, onUploadError, clearPreview]);

    /**
     * Delete current avatar
     */
    const deleteAvatar = useCallback(async () => {
        if (!userId) return; // Added explicit userId check
        
        try {
            setError(null);
            
            await avatarService.deleteAvatar(userId, userId); // FIXED: added requesterId
            
            showToast('Avatar deleted successfully');
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Failed to delete avatar');
            throw err;
        }
    }, [userId, avatarService, handleError, showToast, showErrorToast]);

    /**
     * Validate file before upload
     */
    const validateFile = useCallback(async (file: File) => {
        try {
            return await avatarService.validateImageFile(file);
        } catch (err) {
            const { userMessage } = handleError(err);
            return { isValid: false, errors: [userMessage] };
        }
    }, [avatarService, handleError]);

    /**
     * Load default avatar options
     */
    const loadDefaultAvatars = useCallback(async () => {
        if (isLoadingDefaults) return;
        
        try {
            setIsLoadingDefaults(true);
            setError(null);
            
            const defaults = await avatarService.getDefaultAvatars();
            setDefaultAvatars(defaults);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            // Don't show toast for this error as it's not critical
        } finally {
            setIsLoadingDefaults(false);
        }
    }, [avatarService, handleError, isLoadingDefaults]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            clearPreview();
        };
    }, [clearPreview]);

    return {
        // State
        isUploading,
        uploadProgress,
        error,
        previewUrl,
        defaultAvatars,
        isLoadingDefaults,
        
        // Actions
        uploadAvatar,
        deleteAvatar,
        validateFile,
        createPreview,
        clearPreview,
        loadDefaultAvatars,
        clearError,
        
        // Helpers
        canUpload,
        hasPreview
    };
}