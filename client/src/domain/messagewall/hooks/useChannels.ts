/**
 * useChannels Hook
 * Hook personnalisé pour gérer les channels
 */

import { useEffect } from 'react';
import { useChannelStore, selectActiveChannel } from '../stores/channelStore';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const useChannels = () => {
  const { user } = useAuth();
  
  const channels = useChannelStore(state => state.channels);
  const activeChannelId = useChannelStore(state => state.activeChannelId);
  const activeChannel = useChannelStore(selectActiveChannel);
  const isLoading = useChannelStore(state => state.isLoading);
  const error = useChannelStore(state => state.error);
  
  const setActiveChannel = useChannelStore(state => state.setActiveChannel);
  const addChannel = useChannelStore(state => state.addChannel);
  const updateChannel = useChannelStore(state => state.updateChannel);
  const removeChannel = useChannelStore(state => state.removeChannel);
  const initializeChannels = useChannelStore(state => state.initializeChannels);
  const incrementMessageCount = useChannelStore(state => state.incrementMessageCount);
  const updateLastMessageAt = useChannelStore(state => state.updateLastMessageAt);

  // Initialiser les channels au montage si nécessaire
  useEffect(() => {
    if (user && channels.length === 0) {
      initializeChannels(user.userId);
    }
  }, [user, channels.length, initializeChannels]);

  return {
    // État
    channels,
    activeChannelId,
    activeChannel,
    isLoading,
    error,
    
    // Actions
    setActiveChannel,
    addChannel,
    updateChannel,
    removeChannel,
    initializeChannels,
    incrementMessageCount,
    updateLastMessageAt,
  };
};
