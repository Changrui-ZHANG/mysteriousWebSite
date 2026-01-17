/**
 * useTypingIndicator Hook
 * Hook pour gérer les indicateurs de frappe en temps réel
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useChannelStore } from '../stores/channelStore';
import type { TypingUser, TypingPayload } from '../types/typing.types';
import { TYPING_TIMEOUT, TYPING_DEBOUNCE } from '../types/typing.types';

export const useTypingIndicator = () => {
  const { user } = useAuth();
  const activeChannelId = useChannelStore(state => state.activeChannelId);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  /**
   * Nettoyer les utilisateurs qui ne tapent plus (timeout de 3s)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(u => now - u.startedAt.getTime() < TYPING_TIMEOUT)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Émettre l'événement "typing" avec debounce
   */
  const startTyping = useCallback(() => {
    if (!user || isTypingRef.current) return;

    // Debounce pour éviter trop d'événements
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = true;

      const payload: TypingPayload = {
        channelId: activeChannelId,
        userId: user.userId,
        username: user.username,
      };

      // Émettre l'événement via WebSocket
      // TODO: Intégrer avec le service WebSocket
      console.log('TYPING_START', payload);

      // Auto-stop après TYPING_TIMEOUT
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, TYPING_TIMEOUT);
    }, TYPING_DEBOUNCE);
  }, [user, activeChannelId]);

  /**
   * Émettre l'événement "stop_typing"
   */
  const stopTyping = useCallback(() => {
    if (!user || !isTypingRef.current) return;

    isTypingRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    const payload: TypingPayload = {
      channelId: activeChannelId,
      userId: user.userId,
      username: user.username,
    };

    // Émettre l'événement via WebSocket
    // TODO: Intégrer avec le service WebSocket
    console.log('TYPING_STOP', payload);
  }, [user, activeChannelId]);

  /**
   * Gérer les événements WebSocket de typing
   */
  const handleTypingEvent = useCallback((event: { type: string; payload: TypingPayload }) => {
    const { type, payload } = event;

    // Ignorer nos propres événements
    if (user && payload.userId === user.userId) {
      return;
    }

    // Ignorer les événements d'autres channels
    if (payload.channelId !== activeChannelId) {
      return;
    }

    if (type === 'TYPING_START') {
      setTypingUsers(prev => {
        // Vérifier si l'utilisateur est déjà dans la liste
        const exists = prev.some(u => u.userId === payload.userId);
        if (exists) {
          // Mettre à jour le timestamp
          return prev.map(u =>
            u.userId === payload.userId
              ? { ...u, startedAt: new Date() }
              : u
          );
        } else {
          // Ajouter le nouvel utilisateur
          return [
            ...prev,
            {
              userId: payload.userId,
              username: payload.username,
              startedAt: new Date(),
            },
          ];
        }
      });
    } else if (type === 'TYPING_STOP') {
      setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
    }
  }, [user, activeChannelId]);

  /**
   * Nettoyer les timers au démontage
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Réinitialiser l'état quand on change de channel
   */
  useEffect(() => {
    setTypingUsers([]);
    stopTyping();
  }, [activeChannelId, stopTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    handleTypingEvent,
    isTyping: isTypingRef.current,
  };
};
