/**
 * ChannelTabs Component
 * Navigation entre les différents channels avec badges de non-lus
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChannels } from '../hooks/useChannels';
import { Channel } from '../types/channel.types';
import './ChannelTabs.css';

interface ChannelTabsProps {
  unreadCounts?: Record<string, number>;
  onCreateChannel?: () => void; // Admin only
}

export const ChannelTabs = ({ unreadCounts = {}, onCreateChannel }: ChannelTabsProps) => {
  const { channels, activeChannelId, setActiveChannel } = useChannels();
  const [searchParams, setSearchParams] = useSearchParams();

  // Synchroniser avec l'URL au montage
  useEffect(() => {
    const channelParam = searchParams.get('channel');
    if (channelParam && channels.some(c => c.id === channelParam)) {
      setActiveChannel(channelParam);
    } else if (activeChannelId) {
      // Mettre à jour l'URL si pas de paramètre
      setSearchParams({ channel: activeChannelId }, { replace: true });
    }
  }, []);

  const handleChannelChange = (channelId: string) => {
    setActiveChannel(channelId);
    setSearchParams({ channel: channelId });
  };

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="channel-tabs-container">
      <div className="channel-tabs">
        {channels.map((channel) => (
          <ChannelTab
            key={channel.id}
            channel={channel}
            isActive={channel.id === activeChannelId}
            unreadCount={unreadCounts[channel.id] || 0}
            onClick={() => handleChannelChange(channel.id)}
          />
        ))}
        
        {onCreateChannel && (
          <button
            onClick={onCreateChannel}
            className="channel-tab channel-tab-add"
            aria-label="Créer un nouveau channel"
          >
            <span className="channel-icon">➕</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface ChannelTabProps {
  channel: Channel;
  isActive: boolean;
  unreadCount: number;
  onClick: () => void;
}

const ChannelTab = ({ channel, isActive, unreadCount, onClick }: ChannelTabProps) => {
  return (
    <button
      onClick={onClick}
      className={`channel-tab ${isActive ? 'channel-tab-active' : ''}`}
      aria-label={`Channel ${channel.name}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {channel.icon && (
        <span className="channel-icon" aria-hidden="true">
          {channel.icon}
        </span>
      )}
      <span className="channel-name">{channel.name}</span>
      
      {unreadCount > 0 && (
        <span className="channel-badge" aria-label={`${unreadCount} messages non lus`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
