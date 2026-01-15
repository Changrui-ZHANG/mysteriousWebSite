import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUser, FaCog, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import { UserAvatar } from '../UserAvatar';
import type { UserDropdownMenuProps } from './types';

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = memo(({
  user,
  isOpen,
  onClose,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuItems = useRef<HTMLButtonElement[]>([]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add small delay to prevent immediate close on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle keyboard navigation (Tab and Arrow keys)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const menuItemCount = menuItems.current.length;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % menuItemCount);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + menuItemCount) % menuItemCount);
          break;
        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            setFocusedIndex((prev) => (prev - 1 + menuItemCount) % menuItemCount);
          } else {
            setFocusedIndex((prev) => (prev + 1) % menuItemCount);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          menuItems.current[focusedIndex]?.click();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex]);

  // Focus the focused menu item
  useEffect(() => {
    if (isOpen && menuItems.current[focusedIndex]) {
      menuItems.current[focusedIndex].focus();
    }
  }, [focusedIndex, isOpen]);

  // Reset focus index when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-1001 min-w-[280px] max-w-[320px] rounded-2xl border border-(--border-default) bg-(--bg-elevated) backdrop-blur-3xl shadow-xl overflow-hidden"
          role="menu"
          aria-label="User menu"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-(--particle-primary) blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-(--particle-secondary) blur-[60px] rounded-full pointer-events-none" />

          {/* User Info Section */}
          <div className="relative px-5 py-4 border-b border-(--border-default) bg-(--bg-surface-alt)">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <UserAvatar
                  userId={user.id}
                  src={user.avatarUrl}
                  alt={user.name}
                  size={48}
                  className="rounded-xl border border-(--border-default) shadow-inset"
                />
              </div>
              <div className="grow overflow-hidden">
                <p className="text-[10px] uppercase tracking-wider text-(--text-muted) mb-0.5">
                  {t('navbar.user_menu.signed_in_as')}
                </p>
                <p className="text-sm font-bold text-(--text-primary) truncate">
                  {user.name}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="relative py-2 px-2">
            <button
              ref={(el) => el && (menuItems.current[0] = el)}
              onClick={() => {
                onNavigateToProfile();
                onClose();
              }}
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-(--text-primary) hover:bg-(--bg-surface-alt) transition-all flex items-center justify-between focus:outline-none ${focusedIndex === 0 ? 'bg-(--bg-surface-alt)' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 0 ? 0 : -1}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-(--particle-primary) flex items-center justify-center text-(--accent-primary) border border-(--border-default) group-hover:scale-110 transition-transform">
                  <FaUser className="text-sm" />
                </div>
                <span className="font-medium">{t('navbar.user_menu.view_profile')}</span>
              </div>
              <FaChevronRight className="text-[10px] text-(--text-muted) group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              ref={(el) => el && (menuItems.current[1] = el)}
              onClick={() => {
                onNavigateToSettings();
                onClose();
              }}
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-(--text-primary) hover:bg-(--bg-surface-alt) transition-all flex items-center justify-between focus:outline-none ${focusedIndex === 1 ? 'bg-(--bg-surface-alt)' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 1 ? 0 : -1}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-(--particle-info) flex items-center justify-center text-(--accent-info) border border-(--border-default) group-hover:rotate-45 transition-transform">
                  <FaCog className="text-sm" />
                </div>
                <span className="font-medium">{t('navbar.user_menu.settings')}</span>
              </div>
              <FaChevronRight className="text-[10px] text-(--text-muted) group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Logout Section */}
          <div className="relative p-2 mt-1 border-t border-(--border-default) bg-(--error-bg)">
            <button
              ref={(el) => el && (menuItems.current[2] = el)}
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-(--accent-danger) hover:bg-(--error-particle-red) transition-all flex items-center space-x-3 focus:outline-none ${focusedIndex === 2 ? 'bg-(--error-particle-red)' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 2 ? 0 : -1}
            >
              <div className="w-8 h-8 rounded-lg bg-(--error-particle-red) flex items-center justify-center text-(--accent-danger) border border-(--error-border) group-hover:scale-90 transition-transform">
                <FaSignOutAlt className="text-sm" />
              </div>
              <span className="font-bold">{t('navbar.user_menu.logout')}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

UserDropdownMenu.displayName = 'UserDropdownMenu';
