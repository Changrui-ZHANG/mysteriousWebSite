/**
 * TypingIndicator Component
 * Affichage des utilisateurs en train d'écrire
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TypingUser } from '../types/typing.types';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  maxDisplay?: number; // Nombre maximum d'utilisateurs à afficher (default: 3)
}

export const TypingIndicator = React.memo(({ typingUsers, maxDisplay = 3 }: TypingIndicatorProps) => {
  const { t } = useTranslation();

  if (typingUsers.length === 0) {
    return null;
  }

  const displayUsers = typingUsers.slice(0, maxDisplay);

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return t('messages.typing_single', { 
        username: displayUsers[0].username,
        defaultValue: `${displayUsers[0].username} est en train d'écrire...`
      });
    } else if (typingUsers.length === 2) {
      return t('messages.typing_double', {
        user1: displayUsers[0].username,
        user2: displayUsers[1].username,
        defaultValue: `${displayUsers[0].username} et ${displayUsers[1].username} sont en train d'écrire...`
      });
    } else {
      return t('messages.typing_multiple', {
        count: typingUsers.length,
        defaultValue: `${typingUsers.length} personnes sont en train d'écrire...`
      });
    }
  };

  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        <div className="typing-dots">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        <span className="typing-text">{getTypingText()}</span>
      </div>
    </div>
  );
});
