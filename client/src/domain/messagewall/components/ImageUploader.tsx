/**
 * ImageUploader Component
 * Composant pour l'upload d'images avec drag & drop, validation et compression
 */

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaImage, 
  FaTimes, 
  FaCheck, 
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { MediaUploadResult, MediaUploadError } from '../types/media.types';

interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  compact?: boolean; // Mode compact pour intégration dans MessageInput
}

export function ImageUploader({
  onUpload,
  onError,
  className = '',
  disabled = false,
  showPreview = true,
  compact = false
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    isUploading,
    progress,
    error,
    result,
    uploadImage,
    resetState,
    handleFileDrop,
    handleDragOver,
    maxSize,
    acceptedFormats,
  } = useMediaUpload({
    onSuccess: (result: MediaUploadResult) => {
      onUpload(result.url);
      if (showPreview) {
        setPreviewUrl(result.url);
      }
    },
    onError: (error: MediaUploadError) => {
      onError?.(error.message);
    },
    autoUpload: true,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Créer une preview locale immédiatement
      if (showPreview) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      uploadImage(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    setIsDragOver(false);
    if (!disabled && !isUploading) {
      handleFileDrop(event);
      
      // Créer une preview pour le premier fichier
      if (showPreview && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    // Vérifier si on quitte vraiment la zone (pas un enfant)
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleCancel = () => {
    resetState();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    if (isUploading) {
      return <FaSpinner className="animate-spin" />;
    }
    if (error) {
      return <FaExclamationTriangle className="text-accent-danger" />;
    }
    if (result) {
      return <FaCheck className="text-accent-success" />;
    }
    return <FaImage />;
  };

  const getStatusText = () => {
    if (isUploading) {
      if (progress < 20) {
        return t('media.validating', 'Validation...');
      } else if (progress < 50) {
        return t('media.compressing', 'Compression...');
      } else {
        return t('media.uploading', 'Upload...');
      }
    }
    if (error) {
      return error.message;
    }
    if (result) {
      return t('media.upload_success', 'Upload réussi');
    }
    return compact 
      ? t('media.add_image', 'Image')
      : t('media.drag_drop_or_click', 'Glissez une image ou cliquez pour sélectionner');
  };

  // Mode compact pour intégration dans MessageInput
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={`
            w-10 h-10 rounded-xl transition-all flex items-center justify-center text-sm
            ${disabled || isUploading 
              ? 'bg-inset text-muted cursor-not-allowed' 
              : 'bg-inset hover:bg-surface-alt text-secondary hover:text-primary border border-default'
            }
            ${isDragOver ? 'bg-accent-primary/10 border-accent-primary' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          title={getStatusText()}
        >
          {getStatusIcon()}
        </button>

        {/* Progress bar pour mode compact */}
        {isUploading && (
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-surface-alt rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map(f => `.${f}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Mode complet
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragOver 
            ? 'border-accent-primary bg-accent-primary/5' 
            : 'border-default hover:border-strong'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          {/* Icône de statut */}
          <div className={`text-4xl ${error ? 'text-accent-danger' : 'text-secondary'}`}>
            {getStatusIcon()}
          </div>

          {/* Texte de statut */}
          <div className="space-y-2">
            <p className={`font-medium ${error ? 'text-accent-danger' : 'text-primary'}`}>
              {getStatusText()}
            </p>
            
            {!isUploading && !error && !result && (
              <p className="text-sm text-muted">
                {t('media.supported_formats', 'Formats supportés')}: {acceptedFormats.join(', ').toUpperCase()}
                <br />
                {t('media.max_size', 'Taille maximum')}: {maxSize}MB
              </p>
            )}
          </div>

          {/* Barre de progression */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="w-full max-w-xs mx-auto"
              >
                <div className="bg-surface-alt rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted mt-2">{Math.round(progress)}%</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton d'annulation */}
          <AnimatePresence>
            {(isUploading || error) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="px-4 py-2 bg-surface-alt hover:bg-inset text-secondary hover:text-primary rounded-lg transition-all text-sm"
              >
                <FaTimes className="inline mr-2" />
                {t('common.cancel', 'Annuler')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview de l'image */}
      <AnimatePresence>
        {showPreview && previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-surface-alt">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain"
                onLoad={() => {
                  // Nettoyer l'URL de preview locale si c'est un blob
                  if (previewUrl.startsWith('blob:') && result) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(result.url);
                  }
                }}
              />
              
              {/* Overlay avec informations */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 text-white text-sm">
                  {result && (
                    <>
                      <p>{result.filename}</p>
                      <p>{(result.size / 1024 / 1024).toFixed(2)}MB</p>
                      {result.width && result.height && (
                        <p>{result.width}x{result.height}px</p>
                      )}
                    </>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.map(f => `.${f}`).join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}