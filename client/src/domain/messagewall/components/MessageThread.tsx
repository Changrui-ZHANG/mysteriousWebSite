/**
 * MessageThread Component
 * Affichage amélioré des fils de discussion avec indentation et ligne de connexion
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MessageItem } from './MessageItem';
import type { Message } from '../types';
import './MessageThread.css';

interface MessageThreadProps {
  replies: Message[];
  isOwn: (msg: Message) => boolean;
  canDelete: (msg: Message) => boolean;
  onDelete: (id: string) => void;
  onReply: (msg: Message) => void;
  onTranslate: (id: string, text: string) => void;
  onScrollToMessage: (id: string) => void;
  translations?: Record<string, string>;
  translating?: Set<string>;
  showTranslated?: Set<string>;
  highlightedMessageId?: string | null;
}

export const MessageThread = ({
  replies,
  isOwn,
  canDelete,
  onDelete,
  onReply,
  onTranslate,
  onScrollToMessage,
  translations = {},
  translating = new Set(),
  showTranslated = new Set(),
  highlightedMessageId,
}: MessageThreadProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="message-thread">
      {/* Thread Toggle Button */}
      <button
        className="thread-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Replier le fil' : 'Déplier le fil'}
      >
        <span className="thread-count">
          {replies.length} {replies.length === 1 ? 'réponse' : 'réponses'}
        </span>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Thread Replies */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="thread-replies"
          >
            {replies.map((reply, index) => (
              <div key={reply.id} className="thread-reply">
                <div className="thread-line" />
                <div className="thread-reply-content">
                  <MessageItem
                    msg={reply}
                    index={index}
                    isOwn={isOwn(reply)}
                    isHighlighted={highlightedMessageId === reply.id}
                    canDelete={canDelete(reply)}
                    translation={translations[reply.id]}
                    isTranslating={translating.has(reply.id)}
                    showTranslation={showTranslated.has(reply.id)}
                    onDelete={onDelete}
                    onReply={onReply}
                    onTranslate={onTranslate}
                    onScrollToMessage={onScrollToMessage}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
