/**
 * MessageReactions Component
 * Affichage simple des réactions depuis les props (pas de hook)
 */

import { useState } from 'react';
import type { Reaction } from '../types/reaction.types';
import './MessageReactions.css';

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[]; // Réactions directement depuis les props
  onReactionClick?: (emoji: string) => void; // Callback pour gérer les clics
}

export const MessageReactions = ({
  messageId,
  reactions = [],
  onReactionClick
}: MessageReactionsProps) => {
  // Filtrer les réactions qui ont au moins 1 utilisateur
  const activeReactions = reactions.filter(r => r.count > 0);

  // Si aucune réaction, ne rien afficher
  if (activeReactions.length === 0) {
    return null;
  }

  return (
    <div className="message-reactions-container">
      {/* Réactions existantes */}
      <div className="reactions-list">
        {activeReactions.map((reaction) => (
          <ReactionButton
            key={reaction.emoji}
            emoji={reaction.emoji}
            count={reaction.count}
            users={reaction.users}
            onClick={() => onReactionClick?.(reaction.emoji)}
          />
        ))}
      </div>
    </div>
  );
};

interface ReactionButtonProps {
  emoji: string;
  count: number;
  users: Array<{ userId: string; username: string; reactedAt: Date | number }>;
  onClick: () => void;
}

const ReactionButton = ({
  emoji,
  count,
  users,
  onClick
}: ReactionButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const usernames = users.map(u => u.username).join(', ');
  const tooltipText = users.length > 0
    ? `${usernames} ${users.length === 1 ? 'a réagi' : 'ont réagi'}`
    : '';

  return (
    <div
      className="reaction-button-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className="reaction-button"
        onClick={onClick}
        aria-label={`${emoji} ${count} ${count === 1 ? 'réaction' : 'réactions'}`}
      >
        <span className="reaction-emoji">{emoji}</span>
        <span className="reaction-count">{count > 99 ? '99+' : count}</span>
      </button>

      {/* Tooltip avec liste des utilisateurs */}
      {showTooltip && users.length > 0 && (
        <div className="reaction-tooltip">
          {tooltipText}
        </div>
      )}
    </div>
  );
};
