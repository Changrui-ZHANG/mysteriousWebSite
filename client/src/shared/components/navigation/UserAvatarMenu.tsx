/**
 * UserAvatarMenu Component
 * Main container component that manages the avatar button and dropdown menu
 * Profile Access Improvement Feature
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarButton } from './AvatarButton';
import { UserDropdownMenu } from './UserDropdownMenu';
import { useAvatarSync } from '../../hooks/useAvatarSync';
import { resolveAvatarUrl } from '../../utils/avatarUtils';
import type { UserAvatarMenuProps } from './types';

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user,
  onLogout,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  // Sync avatar with profile page updates
  // Avatar caching is handled by React Query (TanStack Query)
  // which automatically caches query results including avatar URLs
  const syncedAvatarUrl = useAvatarSync({
    userId: user.id,
    initialAvatarUrl: user.avatarUrl
  });

  // Track if avatar is loading
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      // Store current focus before opening menu
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Close menu
  const handleClose = useCallback(() => {
    setIsOpen(false);

    // Return focus to avatar button when menu closes
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  // Navigate to profile page
  const handleNavigateToProfile = useCallback(() => {
    try {
      navigate('/profile?tab=overview');
    } catch (error) {
      console.error('Navigation to profile failed:', error);
      // Fallback: try to reload the page to profile
      window.location.href = '/profile?tab=overview';
    }
  }, [navigate]);

  // Navigate to settings page
  const handleNavigateToSettings = useCallback(() => {
    try {
      navigate('/profile?tab=edit');
    } catch (error) {
      console.error('Navigation to settings failed:', error);
      // Fallback: try to reload the page to profile
      window.location.href = '/profile?tab=edit';
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    try {
      onLogout();
      // Redirect to home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout by clearing storage and redirecting
      localStorage.clear();
      window.location.href = '/';
    }
  }, [onLogout, navigate]);



  // Manage focus trap when menu is open
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when menu is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle avatar loading state
  useEffect(() => {
    if (syncedAvatarUrl && syncedAvatarUrl !== user.avatarUrl) {
      setIsAvatarLoading(true);
      setAvatarLoadError(false);

      // Preload the new avatar image
      const img = new Image();
      img.onload = () => {
        setIsAvatarLoading(false);
      };
      img.onerror = () => {
        setIsAvatarLoading(false);
        setAvatarLoadError(true);
        console.error('Failed to load avatar:', syncedAvatarUrl);
      };
      img.src = resolveAvatarUrl(syncedAvatarUrl);
    }
  }, [syncedAvatarUrl, user.avatarUrl]);

  // Memoize user data for dropdown menu to prevent unnecessary re-renders
  const menuUserData = useMemo(() => ({
    name: user.name,
    email: user.email,
    avatarUrl: resolveAvatarUrl(syncedAvatarUrl)
  }), [user.name, user.email, syncedAvatarUrl]);

  return (
    <div
      ref={avatarRef}
      className={`relative ${className}`}
      role="navigation"
      aria-label="User profile menu"
    >
      <AvatarButton
        avatarUrl={avatarLoadError ? undefined : syncedAvatarUrl}
        userName={user.name}
        isActive={isOpen}
        isLoading={isAvatarLoading}
        onClick={handleToggle}
        ariaLabel={`${user.name}'s profile menu`}
      />

      <UserDropdownMenu
        user={menuUserData}
        isOpen={isOpen}
        onClose={handleClose}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToSettings={handleNavigateToSettings}
        onLogout={handleLogout}
      />
    </div>
  );
};
