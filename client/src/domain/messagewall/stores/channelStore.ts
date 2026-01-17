/**
 * Channel Store
 * Store Zustand pour la gestion de l'état des channels
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, DEFAULT_CHANNELS } from '../types/channel.types';

interface ChannelState {
  channels: Channel[];
  activeChannelId: string;
  isLoading: boolean;
  error: string | null;
}

interface ChannelActions {
  // Sélection de channel
  setActiveChannel: (channelId: string) => void;
  
  // CRUD operations
  addChannel: (channel: Channel) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  removeChannel: (channelId: string) => void;
  
  // Initialisation
  initializeChannels: (userId: string) => void;
  
  // Métadonnées
  incrementMessageCount: (channelId: string) => void;
  updateLastMessageAt: (channelId: string, timestamp: Date) => void;
  
  // Gestion d'état
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

type ChannelStore = ChannelState & ChannelActions;

const initialState: ChannelState = {
  channels: [],
  activeChannelId: 'general', // Channel par défaut
  isLoading: false,
  error: null,
};

export const useChannelStore = create<ChannelStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveChannel: (channelId: string) => {
        const { channels } = get();
        const channelExists = channels.some(c => c.id === channelId);
        
        if (channelExists) {
          set({ activeChannelId: channelId });
        } else {
          console.warn(`Channel ${channelId} does not exist`);
        }
      },

      addChannel: (channel: Channel) => {
        set(state => ({
          channels: [...state.channels, channel],
        }));
      },

      updateChannel: (channelId: string, updates: Partial<Channel>) => {
        set(state => ({
          channels: state.channels.map(channel =>
            channel.id === channelId
              ? { ...channel, ...updates }
              : channel
          ),
        }));
      },

      removeChannel: (channelId: string) => {
        const { channels, activeChannelId } = get();
        const channel = channels.find(c => c.id === channelId);
        
        // Ne pas supprimer les channels par défaut
        if (channel?.isDefault) {
          console.warn('Cannot remove default channel');
          return;
        }

        set(state => ({
          channels: state.channels.filter(c => c.id !== channelId),
          // Si le channel actif est supprimé, revenir au channel général
          activeChannelId: activeChannelId === channelId ? 'general' : activeChannelId,
        }));
      },

      initializeChannels: (userId: string) => {
        const now = new Date();
        
        const defaultChannels: Channel[] = DEFAULT_CHANNELS.map(channel => ({
          ...channel,
          createdBy: userId || 'system',
          createdAt: now,
          messageCount: 0,
          lastMessageAt: undefined,
          pinnedMessages: [],
        }));

        set({
          channels: defaultChannels,
          activeChannelId: 'general',
          isLoading: false,
          error: null,
        });
      },

      incrementMessageCount: (channelId: string) => {
        set(state => ({
          channels: state.channels.map(channel =>
            channel.id === channelId
              ? { ...channel, messageCount: channel.messageCount + 1 }
              : channel
          ),
        }));
      },

      updateLastMessageAt: (channelId: string, timestamp: Date) => {
        set(state => ({
          channels: state.channels.map(channel =>
            channel.id === channelId
              ? { ...channel, lastMessageAt: timestamp }
              : channel
          ),
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'messagewall-channels', // Clé pour localStorage
      partialize: (state) => ({
        // Persister uniquement le channel actif
        activeChannelId: state.activeChannelId,
      }),
    }
  )
);

// Sélecteurs pour faciliter l'accès aux données
export const selectActiveChannel = (state: ChannelStore) =>
  state.channels.find(c => c.id === state.activeChannelId);

export const selectChannelById = (channelId: string) => (state: ChannelStore) =>
  state.channels.find(c => c.id === channelId);

export const selectDefaultChannels = (state: ChannelStore) =>
  state.channels.filter(c => c.isDefault);

export const selectCustomChannels = (state: ChannelStore) =>
  state.channels.filter(c => !c.isDefault);
