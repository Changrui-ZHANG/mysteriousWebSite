/**
 * Centralized Error Messages
 * 
 * Provides consistent error messages across the Profile domain
 * to eliminate duplication and ensure consistency.
 */

/**
 * Authentication and Authorization Errors
 */
export const AUTH_ERRORS = {
  AUTHENTICATION_REQUIRED: {
    en: 'Authentication required',
    fr: 'Authentification requise'
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action',
    fr: 'Vous n\'êtes pas autorisé à effectuer cette action'
  },
  SESSION_EXPIRED: {
    en: 'Your session has expired. Please log in again.',
    fr: 'Votre session a expiré. Veuillez vous reconnecter.'
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid credentials',
    fr: 'Identifiants invalides'
  }
} as const;

/**
 * Profile-specific Errors
 */
export const PROFILE_ERRORS = {
  PROFILE_NOT_FOUND: {
    en: 'Profile not found',
    fr: 'Profil non trouvé'
  },
  PROFILE_LOAD_FAILED: {
    en: 'Failed to load profile',
    fr: 'Échec du chargement du profil'
  },
  PROFILE_UPDATE_FAILED: {
    en: 'Failed to update profile',
    fr: 'Échec de la mise à jour du profil'
  },
  PROFILE_DELETE_FAILED: {
    en: 'Failed to delete profile',
    fr: 'Échec de la suppression du profil'
  },
  PROFILE_ALREADY_EXISTS: {
    en: 'Profile already exists',
    fr: 'Le profil existe déjà'
  },
  CANNOT_MODIFY_OTHER_PROFILE: {
    en: 'You can only modify your own profile',
    fr: 'Vous ne pouvez modifier que votre propre profil'
  },
  PROFILE_PRIVATE: {
    en: 'This profile is private',
    fr: 'Ce profil est privé'
  }
} as const;

/**
 * Avatar-specific Errors
 */
export const AVATAR_ERRORS = {
  AVATAR_UPLOAD_FAILED: {
    en: 'Failed to upload avatar',
    fr: 'Échec du téléchargement de l\'avatar'
  },
  AVATAR_DELETE_FAILED: {
    en: 'Failed to delete avatar',
    fr: 'Échec de la suppression de l\'avatar'
  },
  AVATAR_CROP_FAILED: {
    en: 'Failed to crop avatar',
    fr: 'Échec du recadrage de l\'avatar'
  },
  INVALID_IMAGE_FORMAT: {
    en: 'Invalid image format. Please use JPEG, PNG, or WebP.',
    fr: 'Format d\'image invalide. Veuillez utiliser JPEG, PNG ou WebP.'
  },
  IMAGE_TOO_LARGE: {
    en: 'Image is too large. Maximum size is 5MB.',
    fr: 'L\'image est trop grande. La taille maximale est de 5Mo.'
  },
  IMAGE_TOO_SMALL: {
    en: 'Image is too small. Minimum dimensions are 100x100 pixels.',
    fr: 'L\'image est trop petite. Les dimensions minimales sont de 100x100 pixels.'
  }
} as const;

/**
 * Activity-specific Errors
 */
export const ACTIVITY_ERRORS = {
  ACTIVITY_RECORD_FAILED: {
    en: 'Failed to record activity',
    fr: 'Échec de l\'enregistrement de l\'activité'
  },
  ACTIVITY_LOAD_FAILED: {
    en: 'Failed to load activity data',
    fr: 'Échec du chargement des données d\'activité'
  },
  INVALID_ACTIVITY_TYPE: {
    en: 'Invalid activity type',
    fr: 'Type d\'activité invalide'
  },
  ACHIEVEMENT_UNLOCK_FAILED: {
    en: 'Failed to unlock achievement',
    fr: 'Échec du déverrouillage du succès'
  }
} as const;

/**
 * Validation Errors
 */
export const VALIDATION_ERRORS = {
  USER_ID_REQUIRED: {
    en: 'User ID is required',
    fr: 'ID utilisateur requis'
  },
  INVALID_USER_ID: {
    en: 'Invalid user ID',
    fr: 'ID utilisateur invalide'
  },
  FILE_REQUIRED: {
    en: 'File is required',
    fr: 'Fichier requis'
  },
  INVALID_FILE_TYPE: {
    en: 'Invalid file type',
    fr: 'Type de fichier invalide'
  },
  FILE_TOO_LARGE: {
    en: 'File is too large',
    fr: 'Fichier trop volumineux'
  },
  FIELD_REQUIRED: {
    en: 'This field is required',
    fr: 'Ce champ est requis'
  },
  INVALID_EMAIL: {
    en: 'Invalid email address',
    fr: 'Adresse e-mail invalide'
  },
  INVALID_URL: {
    en: 'Invalid URL',
    fr: 'URL invalide'
  },
  VALUE_OUT_OF_RANGE: {
    en: 'Value is out of range',
    fr: 'Valeur hors limites'
  },
  ARRAY_CANNOT_BE_EMPTY: {
    en: 'Array cannot be empty',
    fr: 'Le tableau ne peut pas être vide'
  }
} as const;

/**
 * Network and Server Errors
 */
export const NETWORK_ERRORS = {
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection.',
    fr: 'Erreur réseau. Veuillez vérifier votre connexion.'
  },
  SERVER_ERROR: {
    en: 'Server error. Please try again later.',
    fr: 'Erreur serveur. Veuillez réessayer plus tard.'
  },
  SERVICE_UNAVAILABLE: {
    en: 'Service temporarily unavailable',
    fr: 'Service temporairement indisponible'
  },
  TIMEOUT: {
    en: 'Request timed out',
    fr: 'Délai d\'attente dépassé'
  },
  TOO_MANY_REQUESTS: {
    en: 'Too many requests. Please slow down.',
    fr: 'Trop de requêtes. Veuillez ralentir.'
  }
} as const;

/**
 * Generic Errors
 */
export const GENERIC_ERRORS = {
  UNKNOWN_ERROR: {
    en: 'An unknown error occurred',
    fr: 'Une erreur inconnue s\'est produite'
  },
  OPERATION_FAILED: {
    en: 'Operation failed',
    fr: 'Opération échouée'
  },
  UNEXPECTED_ERROR: {
    en: 'An unexpected error occurred',
    fr: 'Une erreur inattendue s\'est produite'
  },
  NOT_IMPLEMENTED: {
    en: 'This feature is not yet implemented',
    fr: 'Cette fonctionnalité n\'est pas encore implémentée'
  }
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: {
    en: 'Profile updated successfully',
    fr: 'Profil mis à jour avec succès'
  },
  AVATAR_UPLOADED: {
    en: 'Avatar uploaded successfully',
    fr: 'Avatar téléchargé avec succès'
  },
  AVATAR_DELETED: {
    en: 'Avatar deleted successfully',
    fr: 'Avatar supprimé avec succès'
  },
  SETTINGS_SAVED: {
    en: 'Settings saved successfully',
    fr: 'Paramètres enregistrés avec succès'
  },
  ACTIVITY_RECORDED: {
    en: 'Activity recorded successfully',
    fr: 'Activité enregistrée avec succès'
  },
  ACHIEVEMENT_UNLOCKED: {
    en: 'Achievement unlocked!',
    fr: 'Succès déverrouillé !'
  }
} as const;

/**
 * Helper function to get error message in current language
 * @param errorKey - The error message object
 * @param language - The language code (default: 'en')
 * @returns The error message in the specified language
 */
export function getErrorMessage(
  errorKey: { en: string; fr: string },
  language: 'en' | 'fr' = 'en'
): string {
  return errorKey[language];
}

/**
 * Helper function to format error message with parameters
 * @param template - The error message template
 * @param params - Parameters to replace in the template
 * @returns The formatted error message
 */
export function formatErrorMessage(template: string, params: Record<string, string | number>): string {
  let message = template;
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(`{${key}}`, String(value));
  }
  return message;
}
