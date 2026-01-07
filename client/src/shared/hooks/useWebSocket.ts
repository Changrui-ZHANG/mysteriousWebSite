/**
 * useWebSocket - Hook for WebSocket connection with STOMP protocol
 * Provides real-time messaging and presence tracking.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketMessageEvent<T = unknown> {
    type: 'NEW_MESSAGE' | 'DELETE_MESSAGE' | 'MUTE_STATUS' | 'CLEAR_ALL';
    payload: T;
}

interface PresenceUpdate {
    count: number;
    showToAll: boolean;
}

interface UseWebSocketOptions {
    onMessage?: (event: WebSocketMessageEvent) => void;
    onPresenceUpdate?: (update: PresenceUpdate) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { enabled = true } = options;
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const mountedRef = useRef(true);
    
    // Use refs for callbacks to avoid reconnection on callback changes
    const onMessageRef = useRef(options.onMessage);
    const onPresenceUpdateRef = useRef(options.onPresenceUpdate);
    const onConnectRef = useRef(options.onConnect);
    const onDisconnectRef = useRef(options.onDisconnect);
    
    // Update refs when callbacks change
    useEffect(() => {
        onMessageRef.current = options.onMessage;
        onPresenceUpdateRef.current = options.onPresenceUpdate;
        onConnectRef.current = options.onConnect;
        onDisconnectRef.current = options.onDisconnect;
    }, [options.onMessage, options.onPresenceUpdate, options.onConnect, options.onDisconnect]);

    useEffect(() => {
        if (!enabled) return;
        
        mountedRef.current = true;
        
        // Small delay to handle React StrictMode double-mount
        const timeoutId = setTimeout(() => {
            if (!mountedRef.current || clientRef.current?.active) return;

            try {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/ws/websocket`;
                
                console.log('[WebSocket] Connecting to:', wsUrl);
                
                const client = new Client({
                    brokerURL: wsUrl,
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    debug: (str) => {
                        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
                            console.log('[STOMP]', str);
                        }
                    },
                    
                    onConnect: () => {
                        console.log('[WebSocket] Connected!');
                        setIsConnected(true);
                        onConnectRef.current?.();
                        
                        // Subscribe to messages topic
                        client.subscribe('/topic/messages', (message: IMessage) => {
                            console.log('[WebSocket] Received message:', message.body);
                            try {
                                const event: WebSocketMessageEvent = JSON.parse(message.body);
                                onMessageRef.current?.(event);
                            } catch (error) {
                                console.error('[WebSocket] Failed to parse message:', error);
                            }
                        });

                        // Subscribe to presence updates
                        client.subscribe('/topic/presence', (message: IMessage) => {
                            console.log('[WebSocket] Received presence:', message.body);
                            try {
                                const update: PresenceUpdate = JSON.parse(message.body);
                                onPresenceUpdateRef.current?.(update);
                            } catch (error) {
                                console.error('[WebSocket] Failed to parse presence:', error);
                            }
                        });
                    },
                    
                    onDisconnect: () => {
                        console.log('[WebSocket] Disconnected');
                        setIsConnected(false);
                        onDisconnectRef.current?.();
                    },
                    
                    onStompError: (frame) => {
                        console.error('[WebSocket] STOMP error:', frame.headers['message']);
                    },

                    onWebSocketError: (event) => {
                        console.error('[WebSocket] Error:', event);
                        setIsConnected(false);
                    },

                    onWebSocketClose: () => {
                        console.log('[WebSocket] Connection closed');
                        setIsConnected(false);
                    }
                });

                client.activate();
                clientRef.current = client;
            } catch (error) {
                console.error('[WebSocket] Failed to create client:', error);
            }
        }, 100);

        return () => {
            mountedRef.current = false;
            clearTimeout(timeoutId);
            
            if (clientRef.current) {
                console.log('[WebSocket] Disconnecting...');
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
        };
    }, [enabled]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    return { isConnected, disconnect };
}
