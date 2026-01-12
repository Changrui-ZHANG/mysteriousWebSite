import { useRealTimeProfile } from '../hooks/useRealTimeProfile';

interface RealTimeStatusProps {
    userId?: string;
    showDetails?: boolean;
    className?: string;
}

/**
 * Component to display real-time connection status for profiles
 * Shows connection state and provides debugging information
 */
export function RealTimeStatus({ 
    userId, 
    showDetails = false, 
    className = '' 
}: RealTimeStatusProps) {
    const realTime = useRealTimeProfile({ userId });

    const getStatusColor = () => {
        switch (realTime.connectionState) {
            case 'connected':
                return 'text-green-600';
            case 'connecting':
            case 'reconnecting':
                return 'text-yellow-600';
            case 'disconnected':
                return 'text-gray-500';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (realTime.connectionState) {
            case 'connected':
                return '🟢';
            case 'connecting':
            case 'reconnecting':
                return '🟡';
            case 'disconnected':
                return '⚫';
            case 'error':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const getStatusText = () => {
        switch (realTime.connectionState) {
            case 'connected':
                return 'Real-time updates active';
            case 'connecting':
                return 'Connecting to real-time updates...';
            case 'reconnecting':
                return 'Reconnecting to real-time updates...';
            case 'disconnected':
                return 'Real-time updates offline';
            case 'error':
                return 'Real-time updates error';
            default:
                return 'Real-time status unknown';
        }
    };

    if (!showDetails && realTime.isConnected) {
        // Only show when there's an issue if showDetails is false
        return null;
    }

    return (
        <div className={`flex items-center space-x-2 text-sm ${className}`}>
            <span className="text-lg" role="img" aria-label="Connection status">
                {getStatusIcon()}
            </span>
            
            <span className={getStatusColor()}>
                {getStatusText()}
            </span>

            {showDetails && (
                <div className="ml-4 text-xs text-gray-500">
                    <button
                        onClick={() => {
                            const stats = realTime.getConnectionStats();
                            console.log('Real-time connection stats:', stats);
                        }}
                        className="underline hover:text-gray-700"
                        title="Log connection stats to console"
                    >
                        Debug Info
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Compact version for use in headers or status bars
 */
export function RealTimeStatusCompact({ userId }: { userId?: string }) {
    const realTime = useRealTimeProfile({ userId });

    if (realTime.isConnected) {
        return (
            <span 
                className="inline-block w-2 h-2 bg-green-500 rounded-full" 
                title="Real-time updates active"
            />
        );
    }

    return (
        <span 
            className="inline-block w-2 h-2 bg-gray-400 rounded-full" 
            title="Real-time updates offline"
        />
    );
}

/**
 * Detailed status panel for debugging
 */
export function RealTimeStatusPanel({ userId }: { userId?: string }) {
    const realTime = useRealTimeProfile({ userId });
    const stats = realTime.getConnectionStats();

    return (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Real-Time Connection Status</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 ${realTime.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {realTime.connectionState}
                    </span>
                </div>
                
                {stats && (
                    <>
                        <div>
                            <span className="font-medium text-gray-700">Reconnect Attempts:</span>
                            <span className="ml-2 text-gray-600">{stats.reconnectAttempts}</span>
                        </div>
                        
                        <div>
                            <span className="font-medium text-gray-700">Queued Messages:</span>
                            <span className="ml-2 text-gray-600">{stats.queuedMessages}</span>
                        </div>
                        
                        <div>
                            <span className="font-medium text-gray-700">Subscriptions:</span>
                            <span className="ml-2 text-gray-600">{stats.subscriptions}</span>
                        </div>
                        
                        {stats.lastHeartbeat > 0 && (
                            <div>
                                <span className="font-medium text-gray-700">Last Heartbeat:</span>
                                <span className="ml-2 text-gray-600">
                                    {new Date(stats.lastHeartbeat).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {userId && (
                <div className="pt-2 border-t">
                    <span className="font-medium text-gray-700">Subscribed to:</span>
                    <span className="ml-2 text-gray-600">{userId}</span>
                </div>
            )}
        </div>
    );
}