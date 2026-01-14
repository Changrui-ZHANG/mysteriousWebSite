import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUser, FaCog, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
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
          className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-[1001] min-w-[280px] max-w-[320px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          role="menu"
          aria-label="User menu"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-primary/20 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-secondary/20 blur-[60px] rounded-full pointer-events-none" />

          {/* User Info Section */}
          <div className="relative px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center space-x-3">
              <div className="shrink-0 w-12 h-12 rounded-xl border border-white/10 overflow-hidden shadow-inner bg-accent-primary/10">
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grow overflow-hidden">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
                  {t('navbar.user_menu.signed_in_as')}
                </p>
                <p className="text-sm font-bold text-white truncate">
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
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-white/90 hover:bg-white/[0.05] transition-all flex items-center justify-between focus:outline-none ${focusedIndex === 0 ? 'bg-white/[0.08]' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 0 ? 0 : -1}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20 group-hover:scale-110 transition-transform">
                  <FaUser className="text-sm" />
                </div>
                <span className="font-medium">{t('navbar.user_menu.view_profile')}</span>
              </div>
              <FaChevronRight className="text-[10px] text-white/20 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              ref={(el) => el && (menuItems.current[1] = el)}
              onClick={() => {
                onNavigateToSettings();
                onClose();
              }}
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-white/90 hover:bg-white/[0.05] transition-all flex items-center justify-between focus:outline-none ${focusedIndex === 1 ? 'bg-white/[0.08]' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 1 ? 0 : -1}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-accent-info/10 flex items-center justify-center text-accent-info border border-accent-info/20 group-hover:rotate-45 transition-transform">
                  <FaCog className="text-sm" />
                </div>
                <span className="font-medium">{t('navbar.user_menu.settings')}</span>
              </div>
              <FaChevronRight className="text-[10px] text-white/20 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Logout Section */}
          <div className="relative p-2 mt-1 border-t border-white/10 bg-red-500/[0.02]">
            <button
              ref={(el) => el && (menuItems.current[2] = el)}
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`group w-full px-3 py-2.5 rounded-xl text-left text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-3 focus:outline-none ${focusedIndex === 2 ? 'bg-red-500/15' : ''
                }`}
              role="menuitem"
              tabIndex={focusedIndex === 2 ? 0 : -1}
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-90 transition-transform">
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
