import React, { memo } from 'react';
import type { AvatarButtonProps } from './types';
import { UserAvatar } from '../UserAvatar';

export const AvatarButton: React.FC<AvatarButtonProps> = memo(({
  userId,
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
        <UserAvatar size="md" showSkeleton={true} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative w-10 h-10 rounded-full
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
      <UserAvatar
        userId={userId}
        src={avatarUrl}
        alt={`${userName}'s avatar`}
        size="md"
      />

      {/* Active state indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      )}
    </button>
  );
});

AvatarButton.displayName = 'AvatarButton';
