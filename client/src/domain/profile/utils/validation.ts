/**
 * Centralized Validation Utilities
 * 
 * Provides assertion functions for common validation patterns
 * to eliminate duplicated error handling code.
 */

import { ApiError } from '../../../shared/api/httpClient';
import type { UserProfile } from '../types';

/**
 * Error codes for validation errors
 */
export const VALIDATION_ERROR_CODES = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
} as const;

/**
 * Asserts that a user ID is provided and valid
 * @param userId - The user ID to validate
 * @throws ApiError if user ID is missing or invalid
 */
export function requireUserId(userId?: string | null): asserts userId is string {
  if (!userId || userId.trim() === '') {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      'User ID is required'
    );
  }
}

/**
 * Asserts that a profile exists
 * @param profile - The profile to validate
 * @throws ApiError if profile is missing
 */
export function requireProfile(profile?: UserProfile | null): asserts profile is UserProfile {
  if (!profile) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.NOT_FOUND,
      'Profile not found'
    );
  }
}

/**
 * Asserts that the user is authenticated
 * @param isAuthenticated - Authentication status
 * @throws ApiError if user is not authenticated
 */
export function requireAuthentication(isAuthenticated: boolean): asserts isAuthenticated {
  if (!isAuthenticated) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.UNAUTHORIZED,
      'Authentication required'
    );
  }
}

/**
 * Asserts that a file is provided and valid
 * @param file - The file to validate
 * @throws ApiError if file is missing
 */
export function requireFile(file?: File | null): asserts file is File {
  if (!file) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      'File is required'
    );
  }
}

/**
 * Asserts that a file meets size requirements
 * @param file - The file to validate
 * @param maxSizeBytes - Maximum file size in bytes
 * @throws ApiError if file exceeds size limit
 */
export function requireFileSize(file: File, maxSizeBytes: number): void {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `File size exceeds ${maxSizeMB}MB limit`
    );
  }
}

/**
 * Asserts that a file has an allowed type
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @throws ApiError if file type is not allowed
 */
export function requireFileType(file: File, allowedTypes: string[]): void {
  if (!allowedTypes.includes(file.type)) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
}

/**
 * Asserts that a string is not empty
 * @param value - The string to validate
 * @param fieldName - Name of the field for error message
 * @throws ApiError if string is empty
 */
export function requireNonEmptyString(value?: string | null, fieldName: string = 'Field'): asserts value is string {
  if (!value || value.trim() === '') {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `${fieldName} is required`
    );
  }
}

/**
 * Asserts that a value is within a valid range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Name of the field for error message
 * @throws ApiError if value is out of range
 */
export function requireInRange(value: number, min: number, max: number, fieldName: string = 'Value'): void {
  if (value < min || value > max) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `${fieldName} must be between ${min} and ${max}`
    );
  }
}

/**
 * Asserts that an array is not empty
 * @param array - The array to validate
 * @param fieldName - Name of the field for error message
 * @throws ApiError if array is empty
 */
export function requireNonEmptyArray<T>(array?: T[] | null, fieldName: string = 'Array'): asserts array is T[] {
  if (!array || array.length === 0) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `${fieldName} cannot be empty`
    );
  }
}

/**
 * Asserts that a value is defined (not null or undefined)
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @throws ApiError if value is null or undefined
 */
export function requireDefined<T>(value: T | null | undefined, fieldName: string = 'Value'): asserts value is T {
  if (value === null || value === undefined) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.INVALID_INPUT,
      `${fieldName} is required`
    );
  }
}

/**
 * Asserts that user has permission to perform an action
 * @param hasPermission - Whether user has permission
 * @param action - Description of the action
 * @throws ApiError if user lacks permission
 */
export function requirePermission(hasPermission: boolean, action: string = 'perform this action'): asserts hasPermission {
  if (!hasPermission) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.FORBIDDEN,
      `You don't have permission to ${action}`
    );
  }
}

/**
 * Asserts that a profile belongs to the current user
 * @param profileUserId - User ID from the profile
 * @param currentUserId - Current user's ID
 * @throws ApiError if profile doesn't belong to current user
 */
export function requireOwnProfile(profileUserId: string, currentUserId?: string | null): void {
  requireUserId(currentUserId);
  if (profileUserId !== currentUserId) {
    throw new ApiError(
      VALIDATION_ERROR_CODES.FORBIDDEN,
      'You can only modify your own profile'
    );
  }
}
