/**
 * AvatarButton Component
 * Clickable avatar with visual states (hover, active, loading)
 * Profile Access Improvement Feature
 */

import React, { memo } from 'react';
import type { AvatarButtonProps } from './types';

export const AvatarButton: React.FC<AvatarButtonProps> = memo(({
  avatarUrl,
  userName,
  isActive,
  isLoading,
  onClick,
  ariaLabel
}) => {
  const defaultAriaLabel = ariaLabel || `${userName}'s profile menu`;

  if (isLoading) {
    return (
      <button
        className="relative w-10 h-10 rounded-full cursor-not-allowed"
        disabled
        aria-label="Loading profile"
      >
        {/* Loading skeleton animation */}
        <div className="w-full h-full rounded-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative w-10 h-10 rounded-full overflow-hidden
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
        ${isActive
          ? 'ring-2 ring-white/50 shadow-lg scale-105'
          : 'ring-1 ring-white/20 hover:ring-white/40 hover:shadow-md hover:scale-105'
        }
      `}
      aria-label={defaultAriaLabel}
      aria-expanded={isActive}
      aria-haspopup="true"
    >
      {/* Avatar image or default placeholder */}
      <img
        src={avatarUrl || '/avatars/default-avatar.png'}
        alt={`${userName}'s avatar`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to default avatar on error
          const target = e.target as HTMLImageElement;
          target.src = '/avatars/default-avatar.png';
        }}
      />

      {/* Active state indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      )}
    </button>
  );
});

AvatarButton.displayName = 'AvatarButton';
