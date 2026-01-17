/**
 * Reaction Types
 * Types pour le système de réactions du MessageWall
 */

export interface ReactionUser {
  userId: string;
  username: string;
  reactedAt: Date;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: ReactionUser[];
  hasReacted?: boolean; // Si l'utilisateur actuel a réagi
}

export interface ReactionPayload {
  messageId: string;
  userId: string;
  username: string;
  emoji: string;
}

export interface ReactionResponse {
  messageId: string;
  reactions: Reaction[];
}

/**
 * Emojis de réaction rapide disponibles
 */
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥', '👀'] as const;

export type QuickReaction = typeof QUICK_REACTIONS[number];
