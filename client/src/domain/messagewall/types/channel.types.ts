/**
 * Channel Types
 * Types pour le système de channels du MessageWall
 */

export interface Channel {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  
  // Métadonnées
  messageCount: number;
  lastMessageAt?: Date;
  pinnedMessages: string[]; // messageIds
}

export interface ChannelCreateInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface ChannelUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
}

/**
 * Channels par défaut du système
 */
export const DEFAULT_CHANNELS: Omit<Channel, 'createdBy' | 'createdAt' | 'messageCount' | 'lastMessageAt' | 'pinnedMessages'>[] = [
  {
    id: 'general',
    name: 'Général',
    description: 'Discussions générales',
    icon: '💬',
    isDefault: true,
  },
  {
    id: 'announcements',
    name: 'Annonces',
    description: 'Annonces importantes',
    icon: '📢',
    isDefault: true,
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'Discussions informelles',
    icon: '💭',
    isDefault: true,
  },
];
