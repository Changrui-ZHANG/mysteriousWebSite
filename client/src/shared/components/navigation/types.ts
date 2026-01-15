/**
 * Type definitions for navigation components
 * Profile Access Improvement Feature
 */

export interface UserMenuData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserAvatarMenuProps {
  user: UserMenuData;
  onLogout: () => void;
  className?: string;
}

export interface AvatarButtonProps {
  userId?: string;
  avatarUrl?: string;
  userName: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export interface UserDropdownMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export interface MenuState {
  isOpen: boolean;
  activeItemIndex: number;
  position: {
    top: number;
    right: number;
  };
}
