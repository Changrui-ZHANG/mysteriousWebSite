/**
 * useReactions Hook
 * Hook pour gérer les réactions aux messages avec synchronisation WebSocket
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { Reaction, ReactionPayload } from '../types/reaction.types';

interface UseReactionsProps {
  messageId: string;
  initialReactions?: Reaction[];
  onReactionUpdate?: (reactions: Reaction[]) => void; // Callback pour WebSocket
}

export const useReactions = ({ messageId, initialReactions = [], onReactionUpdate }: UseReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the initial reactions to prevent unnecessary updates
  const memoizedInitialReactions = useMemo(() => initialReactions || [], [JSON.stringify(initialReactions)]);

  // Mettre à jour les réactions quand elles changent (via WebSocket ou chargement initial)
  useEffect(() => {
    console.log('[useReactions] Effect triggered', { messageId, initialReactions: memoizedInitialReactions, currentReactions: reactions });

    // Comparer par contenu pour éviter les updates inutiles
    const currentJson = JSON.stringify(reactions);
    const newJson = JSON.stringify(memoizedInitialReactions);

    if (currentJson !== newJson) {
      console.log('[useReactions] Updating reactions from initialReactions', { messageId, newReactions: memoizedInitialReactions });
      setReactions(memoizedInitialReactions);
    }
  }, [memoizedInitialReactions, messageId]); // Use memoized version

  // Memoize the onReactionUpdate callback to prevent unnecessary re-renders
  const memoizedOnReactionUpdate = useCallback((updatedReactions: Reaction[]) => {
    onReactionUpdate?.(updatedReactions);
  }, [onReactionUpdate]);

  /**
   * Ajouter une réaction
   */
  const addReaction = useCallback(async (emoji: string) => {
    console.log('[useReactions] addReaction called', { emoji, user, messageId });

    if (!user) {
      console.warn('[useReactions] No user, cannot add reaction');
      setError('Vous devez être connecté pour réagir');
      return;
    }

    console.log('[useReactions] Adding reaction...', { emoji, userId: user.userId, username: user.username });
    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update - ajouter immédiatement côté client
      setReactions(prev => {
        const existing = prev.find(r => r.emoji === emoji);
        if (existing) {
          // Incrémenter le compteur
          return prev.map(r =>
            r.emoji === emoji
              ? {
                ...r,
                count: r.count + 1,
                users: [...r.users, { userId: user.userId, username: user.username, reactedAt: new Date() }]
              }
              : r
          );
        } else {
          // Ajouter nouvelle réaction
          return [
            ...prev,
            {
              emoji,
              count: 1,
              users: [{ userId: user.userId, username: user.username, reactedAt: new Date() }]
            }
          ];
        }
      });

      const payload: ReactionPayload = {
        messageId,
        userId: user.userId,
        username: user.username,
        emoji,
      };

      console.log('[useReactions] Sending request to backend', { payload, url: '/api/messages/reactions/add' });

      const response = await fetch('/api/messages/reactions/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[useReactions] Response received', { ok: response.ok, status: response.status });

      if (!response.ok) {
        // Si l'API échoue, on garde quand même l'update optimiste
        // Pas d'erreur affichée à l'utilisateur
        console.warn('[useReactions] Response not OK, keeping optimistic update', { status: response.status });
        return;
      }

      const result = await response.json();
      // Le backend retourne ApiResponse<Message>, donc result.data.reactions
      const updatedReactions = result.data?.reactions || [];
      console.log('[useReactions] Reactions updated from backend', { updatedReactions });
      setReactions(updatedReactions);

      // Notifier le parent pour la synchronisation WebSocket
      if (memoizedOnReactionUpdate) {
        memoizedOnReactionUpdate(updatedReactions);
      }
    } catch (err) {
      // En cas d'erreur réseau, on garde l'update optimiste
      // Pas d'erreur affichée à l'utilisateur - le système fonctionne en mode local
      console.error('[useReactions] Error in addReaction', err);
    } finally {
      setIsLoading(false);
    }
  }, [messageId, user, memoizedOnReactionUpdate]);

  /**
   * Retirer une réaction
   */
  const removeReaction = useCallback(async (emoji: string) => {
    console.log('[useReactions] removeReaction called', { emoji, user, messageId });

    if (!user) {
      console.warn('[useReactions] No user, cannot remove reaction');
      setError('Vous devez être connecté pour retirer une réaction');
      return;
    }

    console.log('[useReactions] Removing reaction...', { emoji, userId: user.userId });
    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update - retirer immédiatement côté client
      setReactions(prev => {
        return prev.map(r => {
          if (r.emoji === emoji) {
            const newUsers = r.users.filter(u => u.userId !== user.userId);
            return {
              ...r,
              count: newUsers.length,
              users: newUsers
            };
          }
          return r;
        }).filter(r => r.count > 0); // Supprimer les réactions à 0
      });

      const payload: ReactionPayload = {
        messageId,
        userId: user.userId,
        username: user.username,
        emoji,
      };

      const response = await fetch('/api/messages/reactions/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Si l'API échoue, on garde quand même l'update optimiste
        // Pas d'erreur affichée à l'utilisateur
        return;
      }

      const result = await response.json();
      // Le backend retourne ApiResponse<Message>, donc result.data.reactions
      const updatedReactions = result.data?.reactions || [];
      setReactions(updatedReactions);

      // Notifier le parent pour la synchronisation WebSocket
      if (memoizedOnReactionUpdate) {
        memoizedOnReactionUpdate(updatedReactions);
      }
    } catch (err) {
      // En cas d'erreur réseau, on garde l'update optimiste
      // Pas d'erreur affichée à l'utilisateur - le système fonctionne en mode local
    } finally {
      setIsLoading(false);
    }
  }, [messageId, user, memoizedOnReactionUpdate]);

  /**
   * Toggle une réaction (ajouter si pas présente, retirer si présente)
   */
  const toggleReaction = useCallback(async (emoji: string) => {
    if (!user) {
      setError('Vous devez être connecté pour réagir');
      return;
    }

    const reaction = reactions.find(r => r.emoji === emoji);
    const hasReacted = reaction?.users.some(u => u.userId === user.userId);

    if (hasReacted) {
      await removeReaction(emoji);
    } else {
      await addReaction(emoji);
    }
  }, [reactions, user, addReaction, removeReaction]);

  /**
   * Vérifier si l'utilisateur actuel a réagi avec un emoji spécifique
   */
  const hasUserReacted = useCallback((emoji: string): boolean => {
    if (!user) return false;

    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction?.users.some(u => u.userId === user.userId) || false;
  }, [reactions, user]);

  /**
   * Obtenir le nombre total de réactions
   */
  const getTotalReactionCount = useCallback((): number => {
    return reactions.reduce((total, reaction) => total + reaction.count, 0);
  }, [reactions]);

  /**
   * Obtenir les utilisateurs qui ont réagi avec un emoji spécifique
   */
  const getUsersForReaction = useCallback((emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction?.users || [];
  }, [reactions]);

  return {
    reactions,
    isLoading,
    error,
    addReaction,
    removeReaction,
    toggleReaction,
    hasUserReacted,
    getTotalReactionCount,
    getUsersForReaction,
    setReactions, // Pour les mises à jour via WebSocket
  };
};
