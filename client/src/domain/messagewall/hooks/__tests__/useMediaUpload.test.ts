/**
 * Tests pour useMediaUpload Hook
 */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useMediaUpload } from '../useMediaUpload';

describe('useMediaUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMediaUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.result).toBe(null);
  });

  it('should provide correct configuration', () => {
    const { result } = renderHook(() => useMediaUpload());

    expect(result.current.maxSize).toBe(5);
    expect(result.current.acceptedFormats).toEqual(['jpg', 'jpeg', 'png', 'gif', 'webp']);
    expect(result.current.maxDimensions).toEqual({ width: 4096, height: 4096 });
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useMediaUpload());

    // Appeler resetState
    result.current.resetState();

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.result).toBe(null);
  });
});