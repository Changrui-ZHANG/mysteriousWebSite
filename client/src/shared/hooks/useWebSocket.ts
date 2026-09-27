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
                // Same-origin: proxied by Vite (dev) and nginx (prod)
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/ws/websocket`;

                const client = new Client({
                    brokerURL: wsUrl,
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    debug: () => { },

                    // Configuration pour production - fallback avec SockJS si WebSocket natif échoue
                    webSocketFactory: () => {
                        try {
                            return new WebSocket(wsUrl);
                        } catch (error) {
                            // Fallback vers SockJS en cas d'échec
                            const sockjsUrl = wsUrl.replace('/ws/websocket', '/ws');
                            return new WebSocket(sockjsUrl);
                        }
                    },

                    onConnect: () => {
                        setIsConnected(true);
                        onConnectRef.current?.();

                        // Subscribe to messages topic
                        client.subscribe('/topic/messages', (message: IMessage) => {
                            try {
                                const event: WebSocketMessageEvent = JSON.parse(message.body);
                                onMessageRef.current?.(event);
                            } catch (error) {
                                console.error('[WebSocket] Failed to parse message:', error);
                            }
                        });

                        // Subscribe to presence updates
                        client.subscribe('/topic/presence', (message: IMessage) => {
                            try {
                                const update: PresenceUpdate = JSON.parse(message.body);
                                onPresenceUpdateRef.current?.(update);
                            } catch (error) {
                                console.error('[WebSocket] Failed to parse presence:', error);
                            }
                        });
                    },

                    onDisconnect: () => {
                        setIsConnected(false);
                        onDisconnectRef.current?.();
                    },

                    onStompError: (frame) => {
                        console.error('[WebSocket] STOMP error:', frame.headers['message']);
                    },

                    onWebSocketError: (event) => {
                        console.error('[WebSocket] WebSocket error:', event);
                        setIsConnected(false);
                    },

                    onWebSocketClose: () => {
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
