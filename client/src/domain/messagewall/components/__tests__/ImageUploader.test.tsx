/**
 * Tests d'intégration pour ImageUploader Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ImageUploader } from '../ImageUploader';

// Mock du hook useMediaUpload
vi.mock('../hooks/useMediaUpload', () => ({
  useMediaUpload: vi.fn(() => ({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
    uploadImage: vi.fn(),
    resetState: vi.fn(),
    handleFileDrop: vi.fn(),
    handleDragOver: vi.fn(),
    maxSize: 5,
    acceptedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxDimensions: { width: 4096, height: 4096 },
  })),
}));

describe('ImageUploader', () => {
  const mockOnUpload = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render in compact mode', () => {
    render(
      <ImageUploader
        onUpload={mockOnUpload}
        onError={mockOnError}
        compact={true}
      />
    );

    // Vérifier qu'il y a un bouton d'upload
    const uploadButton = screen.getByRole('button');
    expect(uploadButton).toBeInTheDocument();
  });

  it('should render in full mode', () => {
    render(
      <ImageUploader
        onUpload={mockOnUpload}
        onError={mockOnError}
        compact={false}
      />
    );

    // Vérifier qu'il y a une zone de drop
    expect(screen.getByText(/Glissez une image ou cliquez pour sélectionner/i)).toBeInTheDocument();
    expect(screen.getByText(/Formats supportés/i)).toBeInTheDocument();
    expect(screen.getByText(/Taille maximum/i)).toBeInTheDocument();
  });

  it('should handle click to select file', () => {
    render(
      <ImageUploader
        onUpload={mockOnUpload}
        onError={mockOnError}
        compact={false}
      />
    );

    // Créer un input file caché
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.gif,.webp');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ImageUploader
        onUpload={mockOnUpload}
        onError={mockOnError}
        disabled={true}
        compact={true}
      />
    );

    const uploadButton = screen.getByRole('button');
    expect(uploadButton).toBeDisabled();
  });

  it('should show correct file formats in accept attribute', () => {
    render(
      <ImageUploader
        onUpload={mockOnUpload}
        onError={mockOnError}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.gif,.webp');
  });
});