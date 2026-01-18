/**
 * Image Compression Utilities
 * Utilitaires pour la compression et validation d'images
 */

import { 
  ImageCompressionOptions, 
  MediaUploadError, 
  MediaErrorCode,
  SUPPORTED_MIME_TYPES,
  DEFAULT_IMAGE_UPLOAD_OPTIONS 
} from '../types/media.types';

/**
 * Valide un fichier image
 */
export function validateImageFile(file: File): MediaUploadError | null {
  // Vérifier le format
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !DEFAULT_IMAGE_UPLOAD_OPTIONS.acceptedFormats.includes(extension)) {
    return {
      code: MediaErrorCode.INVALID_FORMAT,
      message: `Format non supporté. Formats acceptés: ${DEFAULT_IMAGE_UPLOAD_OPTIONS.acceptedFormats.join(', ')}`,
      details: `Extension détectée: ${extension}`
    };
  }

  // Vérifier la taille
  const maxSizeBytes = DEFAULT_IMAGE_UPLOAD_OPTIONS.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      code: MediaErrorCode.FILE_TOO_LARGE,
      message: `Fichier trop volumineux. Taille maximum: ${DEFAULT_IMAGE_UPLOAD_OPTIONS.maxSize}MB`,
      details: `Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return null;
}

/**
 * Obtient les dimensions d'une image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire les dimensions de l\'image'));
    };
    
    img.src = url;
  });
}

/**
 * Valide les dimensions d'une image
 */
export function validateImageDimensions(
  dimensions: { width: number; height: number }
): MediaUploadError | null {
  const { maxDimensions } = DEFAULT_IMAGE_UPLOAD_OPTIONS;
  
  if (dimensions.width > maxDimensions.width || dimensions.height > maxDimensions.height) {
    return {
      code: MediaErrorCode.INVALID_DIMENSIONS,
      message: `Dimensions trop importantes. Maximum: ${maxDimensions.width}x${maxDimensions.height}px`,
      details: `Dimensions actuelles: ${dimensions.width}x${dimensions.height}px`
    };
  }
  
  return null;
}

/**
 * Compresse une image si nécessaire
 */
export function compressImage(
  file: File, 
  options: ImageCompressionOptions
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Canvas context non disponible'));
      return;
    }
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        const { width: originalWidth, height: originalHeight } = img;
        let { maxWidth: targetWidth, maxHeight: targetHeight } = options;
        
        const aspectRatio = originalWidth / originalHeight;
        
        if (originalWidth > targetWidth || originalHeight > targetHeight) {
          if (aspectRatio > 1) {
            // Image plus large que haute
            targetHeight = targetWidth / aspectRatio;
          } else {
            // Image plus haute que large
            targetWidth = targetHeight * aspectRatio;
          }
        } else {
          // Image déjà dans les limites
          targetWidth = originalWidth;
          targetHeight = originalHeight;
        }
        
        // Redimensionner le canvas
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression'));
              return;
            }
            
            // Créer un nouveau fichier avec le blob compressé
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: options.mimeType,
                lastModified: Date.now()
              }
            );
            
            resolve(compressedFile);
          },
          options.mimeType,
          options.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger l\'image'));
    };
    
    img.src = url;
  });
}

/**
 * Détermine si une image a besoin d'être compressée
 */
export function needsCompression(
  file: File, 
  dimensions: { width: number; height: number }
): boolean {
  const maxSizeBytes = DEFAULT_IMAGE_UPLOAD_OPTIONS.maxSize * 1024 * 1024;
  const { maxDimensions } = DEFAULT_IMAGE_UPLOAD_OPTIONS;
  
  return (
    file.size > maxSizeBytes ||
    dimensions.width > maxDimensions.width ||
    dimensions.height > maxDimensions.height
  );
}

/**
 * Obtient le type MIME à partir de l'extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() as keyof typeof SUPPORTED_MIME_TYPES;
  return SUPPORTED_MIME_TYPES[extension] || 'image/jpeg';
}