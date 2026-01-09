import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface WebSocketDiagnosticProps {
    isConnected: boolean;
    onlineCount: number;
    showOnlineCountToAll: boolean;
}

export function WebSocketDiagnostic({ isConnected, onlineCount, showOnlineCountToAll }: WebSocketDiagnosticProps) {
    const { t } = useTranslation();
    const [showDiagnostic, setShowDiagnostic] = useState(false);
    const [connectionHistory, setConnectionHistory] = useState<string[]>([]);

    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString();
        const status = isConnected ? 'Connected' : 'Disconnected';
        setConnectionHistory(prev => [...prev.slice(-9), `${timestamp}: ${status}`]);
    }, [isConnected]);

    // Afficher automatiquement si problème de connexion
    useEffect(() => {
        if (!isConnected) {
            const timer = setTimeout(() => setShowDiagnostic(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [isConnected]);

    if (!showDiagnostic) {
        return (
            <button
                onClick={() => setShowDiagnostic(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs opacity-50 hover:opacity-100"
                title="WebSocket Diagnostic"
            >
                WS
            </button>
        );
    }

    const testWebSocket = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/websocket`;

        console.log('Testing WebSocket connection to:', wsUrl);

        try {
            const testWs = new WebSocket(wsUrl);
            testWs.onopen = () => {
                console.log('✅ WebSocket test connection successful');
                testWs.close();
            };
            testWs.onerror = (error) => {
                console.error('❌ WebSocket test connection failed:', error);
            };
        } catch (error) {
            console.error('❌ WebSocket test failed:', error);
        }
    };

    const testAPI = async () => {
        try {
            const response = await fetch('/api/presence/count');
            const data = await response.json();
            console.log('✅ API test successful:', data);
        } catch (error) {
            console.error('❌ API test failed:', error);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">WebSocket Diagnostic</h3>
                <button
                    onClick={() => setShowDiagnostic(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ×
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Online Count:</span>
                    <span>{onlineCount}</span>
                </div>

                <div className="flex justify-between">
                    <span>Visible to All:</span>
                    <span>{showOnlineCountToAll ? '✅' : '❌'}</span>
                </div>

                <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span>{window.location.protocol}</span>
                </div>

                <div className="flex justify-between">
                    <span>Host:</span>
                    <span>{window.location.host}</span>
                </div>

                <div className="border-t border-gray-700 pt-2">
                    <div className="text-gray-400 mb-1">Connection History:</div>
                    <div className="max-h-20 overflow-y-auto text-xs">
                        {connectionHistory.map((entry, index) => (
                            <div key={index} className="text-gray-300">{entry}</div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-2 space-y-1">
                    <button
                        onClick={testWebSocket}
                        className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                    >
                        Test WebSocket
                    </button>
                    <button
                        onClick={testAPI}
                        className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
                    >
                        Test API
                    </button>
                </div>
            </div>
        </div>
    );
}