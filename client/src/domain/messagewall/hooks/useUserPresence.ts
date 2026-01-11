import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { getAdminCode } from '../../../shared/constants/authStorage';
import { postJson } from '../../../shared/api/httpClient';

/**
 * Hook for managing user presence and online count
 * Handles online user tracking and visibility settings
 */
export function useUserPresence() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [showOnlineCountToAll, setShowOnlineCountToAll] = useState(false);

    // Fetch initial online count
    const fetchOnlineCount = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRESENCE.COUNT, {
                headers: { 
                    'Cache-Control': 'no-cache', 
                    'Pragma': 'no-cache' 
                }
            });
            const data = await response.json();
            if (data.data) {
                setOnlineCount(data.data.count);
                setShowOnlineCountToAll(data.data.showToAll);
            }
        } catch (error) {
            console.error('Failed to fetch online count:', error);
        }
    }, []);

    // Handle presence updates from WebSocket
    const handlePresenceUpdate = useCallback((update: { count: number; showToAll: boolean }) => {
        setOnlineCount(update.count);
        setShowOnlineCountToAll(update.showToAll);
    }, []);

    // Toggle online count visibility (admin only)
    const toggleOnlineCountVisibility = useCallback(async () => {
        const adminCode = getAdminCode();
        if (!adminCode) return;
        
        try {
            await postJson<{ showToAll: boolean }>(
                `${API_ENDPOINTS.PRESENCE.TOGGLE_VISIBILITY}?adminCode=${adminCode}`, 
                {}
            );
            // WebSocket will broadcast the update
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    }, []);

    return {
        // State
        onlineCount,
        showOnlineCountToAll,

        // Actions
        fetchOnlineCount,
        toggleOnlineCountVisibility,

        // WebSocket handler
        handlePresenceUpdate,
    };
}