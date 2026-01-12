// Browser-compatible EventEmitter implementation
class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, listener: Function): this {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    emit(event: string, ...args: any[]): boolean {
        if (!this.events[event]) {
            return false;
        }
        this.events[event].forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
        return true;
    }

    off(event: string, listener?: Function): this {
        if (!this.events[event]) {
            return this;
        }
        if (!listener) {
            delete this.events[event];
        } else {
            this.events[event] = this.events[event].filter(l => l !== listener);
        }
        return this;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
        return this;
    }
}

export interface WebSocketMessage {
    type: string;
    payload: any;
    timestamp: number;
    userId?: string;
}

export interface WebSocketConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    debug?: boolean;
}

export enum WebSocketState {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error'
}

/**
 * WebSocket service for real-time communication
 * Handles connection management, reconnection, and message routing
 */
export class WebSocketService extends EventEmitter {
    private ws: WebSocket | null = null;
    private config: Required<WebSocketConfig>;
    private state: WebSocketState = WebSocketState.DISCONNECTED;
    private reconnectAttempts = 0;
    private reconnectTimer: number | null = null;
    private heartbeatTimer: number | null = null;
    private lastHeartbeat = 0;
    private messageQueue: WebSocketMessage[] = [];
    private subscriptions = new Map<string, Set<(data: any) => void>>();

    constructor(config: WebSocketConfig) {
        super();
        this.config = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000,
            debug: false,
            ...config
        };
    }

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.setState(WebSocketState.CONNECTING);
        this.log('Connecting to WebSocket server...');

        try {
            this.ws = new WebSocket(this.config.url);
            this.setupEventHandlers();
        } catch (error) {
            this.log('Failed to create WebSocket connection:', error);
            this.handleError(error);
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        this.clearTimers();
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        
        this.setState(WebSocketState.DISCONNECTED);
        this.reconnectAttempts = 0;
    }

    /**
     * Send message to server
     */
    send(type: string, payload: any, userId?: string): void {
        const message: WebSocketMessage = {
            type,
            payload,
            timestamp: Date.now(),
            userId
        };

        if (this.isConnected()) {
            this.sendMessage(message);
        } else {
            // Queue message for later sending
            this.messageQueue.push(message);
            this.log('Message queued (not connected):', type);
        }
    }

    /**
     * Subscribe to specific message types
     */
    subscribe(messageType: string, callback: (data: any) => void): () => void {
        if (!this.subscriptions.has(messageType)) {
            this.subscriptions.set(messageType, new Set());
        }
        
        this.subscriptions.get(messageType)!.add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscriptions.get(messageType);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscriptions.delete(messageType);
                }
            }
        };
    }

    /**
     * Get current connection state
     */
    getState(): WebSocketState {
        return this.state;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.state === WebSocketState.CONNECTED && 
               this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection statistics
     */
    getStats(): {
        state: WebSocketState;
        reconnectAttempts: number;
        lastHeartbeat: number;
        queuedMessages: number;
        subscriptions: number;
    } {
        return {
            state: this.state,
            reconnectAttempts: this.reconnectAttempts,
            lastHeartbeat: this.lastHeartbeat,
            queuedMessages: this.messageQueue.length,
            subscriptions: this.subscriptions.size
        };
    }

    // Private methods

    private setupEventHandlers(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.log('WebSocket connected');
            this.setState(WebSocketState.CONNECTED);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.processMessageQueue();
            this.emit('connected');
        };

        this.ws.onclose = (event) => {
            this.log('WebSocket disconnected:', event.code, event.reason);
            this.clearTimers();
            
            if (event.code !== 1000) { // Not a normal closure
                this.handleDisconnection();
            } else {
                this.setState(WebSocketState.DISCONNECTED);
            }
            
            this.emit('disconnected', event);
        };

        this.ws.onerror = (error) => {
            this.log('WebSocket error:', error);
            this.handleError(error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                this.log('Failed to parse WebSocket message:', error);
            }
        };
    }

    private handleMessage(message: WebSocketMessage): void {
        this.log('Received message:', message.type);

        // Handle system messages
        switch (message.type) {
            case 'heartbeat':
                this.lastHeartbeat = Date.now();
                this.send('heartbeat_ack', { timestamp: message.timestamp });
                return;
            
            case 'heartbeat_ack':
                this.lastHeartbeat = Date.now();
                return;
        }

        // Emit to general listeners
        this.emit('message', message);

        // Notify specific subscribers
        const callbacks = this.subscriptions.get(message.type);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(message.payload);
                } catch (error) {
                    this.log('Error in message callback:', error);
                }
            });
        }
    }

    private sendMessage(message: WebSocketMessage): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.log('Cannot send message - not connected');
            return;
        }

        try {
            this.ws.send(JSON.stringify(message));
            this.log('Sent message:', message.type);
        } catch (error) {
            this.log('Failed to send message:', error);
            this.handleError(error);
        }
    }

    private processMessageQueue(): void {
        if (this.messageQueue.length === 0) return;

        this.log(`Processing ${this.messageQueue.length} queued messages`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        
        messages.forEach(message => {
            this.sendMessage(message);
        });
    }

    private handleDisconnection(): void {
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.setState(WebSocketState.RECONNECTING);
            this.scheduleReconnect();
        } else {
            this.setState(WebSocketState.ERROR);
            this.emit('error', new Error('Max reconnection attempts reached'));
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;

        const delay = Math.min(
            this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
            30000 // Max 30 seconds
        );

        this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    private startHeartbeat(): void {
        this.clearHeartbeat();
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected()) {
                this.send('heartbeat', { timestamp: Date.now() });
                
                // Check if we've missed heartbeats
                const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
                if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 2) {
                    this.log('Heartbeat timeout - reconnecting');
                    this.handleDisconnection();
                }
            }
        }, this.config.heartbeatInterval);
        
        this.lastHeartbeat = Date.now();
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private clearTimers(): void {
        this.clearHeartbeat();
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setState(newState: WebSocketState): void {
        if (this.state !== newState) {
            const oldState = this.state;
            this.state = newState;
            this.emit('stateChange', { oldState, newState });
            this.log(`State changed: ${oldState} -> ${newState}`);
        }
    }

    private handleError(error: any): void {
        this.setState(WebSocketState.ERROR);
        this.emit('error', error);
    }

    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log('[WebSocket]', ...args);
        }
    }
}

// Singleton instance for global use
let globalWebSocketService: WebSocketService | null = null;

export function getWebSocketService(config?: WebSocketConfig): WebSocketService {
    if (!globalWebSocketService && config) {
        globalWebSocketService = new WebSocketService(config);
    }
    
    if (!globalWebSocketService) {
        throw new Error('WebSocket service not initialized. Provide config on first call.');
    }
    
    return globalWebSocketService;
}