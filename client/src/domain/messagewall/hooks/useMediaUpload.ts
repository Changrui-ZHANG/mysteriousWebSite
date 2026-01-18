/**
 * useMediaUpload Hook
 * Hook pour gérer l'upload de médias avec validation et compression
 */

import { useState, useCallback } from 'react';
import { 
  MediaUploadState, 
  MediaUploadResult, 
  MediaUploadError, 
  MediaErrorCode,
  ImageCompressionOptions,
  DEFAULT_IMAGE_UPLOAD_OPTIONS 
} from '../types/media.types';
import {
  validateImageFile,
  getImageDimensions,
  validateImageDimensions,
  compressImage,
  needsCompression,
  getMimeTypeFromExtension
} from '../utils/imageCompression';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';

interface UseMediaUploadOptions {
  onSuccess?: (result: MediaUploadResult) => void;
  onError?: (error: MediaUploadError) => void;
  autoUpload?: boolean; // Si true, upload automatiquement après sélection
}

export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const [uploadState, setUploadState] = useState<MediaUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  const setError = useCallback((error: MediaUploadError) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      error,
    }));
    options.onError?.(error);
  }, [options]);

  const setProgress = useCallback((progress: number) => {
    setUploadState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  /**
   * Upload un fichier vers le serveur
   */
  const uploadToServer = useCallback(async (file: File): Promise<MediaUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Gérer la progression
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setProgress(progress);
        }
      });

      // Gérer la réponse
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Réponse serveur invalide'));
          }
        } else {
          reject(new Error(`Erreur serveur: ${xhr.status} ${xhr.statusText}`));
        }
      });

      // Gérer les erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Timeout lors de l\'upload'));
      });

      // Configurer et envoyer la requête
      xhr.open('POST', API_ENDPOINTS.MEDIA.UPLOAD);
      xhr.timeout = 30000; // 30 secondes
      xhr.send(formData);
    });
  }, [setProgress]);

  /**
   * Traite et upload un fichier image
   */
  const uploadImage = useCallback(async (file: File): Promise<void> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        result: null,
      }));

      // Étape 1: Validation du fichier (5%)
      setProgress(5);
      const fileValidationError = validateImageFile(file);
      if (fileValidationError) {
        setError(fileValidationError);
        return;
      }

      // Étape 2: Obtenir les dimensions (10%)
      setProgress(10);
      let dimensions;
      try {
        dimensions = await getImageDimensions(file);
      } catch (error) {
        setError({
          code: MediaErrorCode.INVALID_FORMAT,
          message: 'Impossible de lire l\'image',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        return;
      }

      // Étape 3: Validation des dimensions (15%)
      setProgress(15);
      const dimensionsValidationError = validateImageDimensions(dimensions);
      if (dimensionsValidationError) {
        setError(dimensionsValidationError);
        return;
      }

      // Étape 4: Compression si nécessaire (20-50%)
      let finalFile = file;
      if (needsCompression(file, dimensions)) {
        setProgress(20);
        try {
          const compressionOptions: ImageCompressionOptions = {
            maxWidth: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxDimensions.width,
            maxHeight: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxDimensions.height,
            quality: DEFAULT_IMAGE_UPLOAD_OPTIONS.quality,
            mimeType: getMimeTypeFromExtension(file.name),
          };
          
          finalFile = await compressImage(file, compressionOptions);
          setProgress(50);
        } catch (error) {
          setError({
            code: MediaErrorCode.COMPRESSION_FAILED,
            message: 'Échec de la compression de l\'image',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
          });
          return;
        }
      } else {
        setProgress(50);
      }

      // Étape 5: Upload vers le serveur (50-100%)
      try {
        const result = await uploadToServer(finalFile);
        
        // Ajouter les dimensions au résultat
        const finalResult: MediaUploadResult = {
          ...result,
          width: dimensions.width,
          height: dimensions.height,
        };

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          result: finalResult,
        }));

        options.onSuccess?.(finalResult);
      } catch (error) {
        setError({
          code: MediaErrorCode.UPLOAD_FAILED,
          message: 'Échec de l\'upload',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    } catch (error) {
      setError({
        code: MediaErrorCode.UPLOAD_FAILED,
        message: 'Erreur inattendue lors de l\'upload',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }, [setError, setProgress, uploadToServer, options]);

  /**
   * Gère la sélection de fichiers
   */
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) {
      return;
    }

    // Pour l'instant, on ne gère qu'un seul fichier
    const file = fileArray[0];
    
    if (options.autoUpload) {
      uploadImage(file);
    }
  }, [uploadImage, options.autoUpload]);

  /**
   * Gère le drop de fichiers
   */
  const handleFileDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  /**
   * Gère le drag over
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    // État
    uploadState,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    result: uploadState.result,
    
    // Actions
    uploadImage,
    resetState,
    
    // Handlers pour les composants
    handleFileSelect,
    handleFileDrop,
    handleDragOver,
    
    // Configuration
    maxSize: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxSize,
    acceptedFormats: DEFAULT_IMAGE_UPLOAD_OPTIONS.acceptedFormats,
    maxDimensions: DEFAULT_IMAGE_UPLOAD_OPTIONS.maxDimensions,
  };
}