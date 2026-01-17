/**
 * Typing Indicator Types
 * Types pour le système d'indicateurs de frappe
 */

export interface TypingUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  startedAt: Date;
}

export interface TypingState {
  channelId: string;
  userId: string;
  username: string;
  startedAt: Date;
}

export interface TypingPayload {
  channelId: string;
  userId: string;
  username: string;
}

/**
 * Durée avant d'arrêter automatiquement l'indicateur de frappe (en ms)
 */
export const TYPING_TIMEOUT = 3000; // 3 secondes

/**
 * Intervalle de debounce pour les événements de frappe (en ms)
 */
export const TYPING_DEBOUNCE = 300; // 300ms
