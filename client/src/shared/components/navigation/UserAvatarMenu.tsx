/**
 * UserAvatarMenu Component
 * Main container component that manages the avatar button and dropdown menu
 * Profile Access Improvement Feature
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarButton } from './AvatarButton';
import { UserDropdownMenu } from './UserDropdownMenu';
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
  React.useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when menu is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Memoize user data for dropdown menu  // Prepare user data for dropdown
  const menuUserData = useMemo(() => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
  }), [user]);

  return (
    <div
      ref={avatarRef}
      className={`relative ${className}`}
      role="navigation"
      aria-label="User profile menu"
    >
      <AvatarButton
        userId={user.id}
        userName={user.name}
        isActive={isOpen}
        isLoading={false}
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
