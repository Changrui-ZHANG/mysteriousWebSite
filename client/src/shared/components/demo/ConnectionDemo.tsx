import React from 'react';
import { useConnectionState, ConnectionState } from '../../hooks/useConnectionState';
import { ConnectionStatus } from '../ui/ConnectionStatus';

/**
 * Composant de démonstration pour tester le système de gestion de connexion
 * Montre comment éviter les boucles d'erreur avec des boutons retry manuels
 */
export const ConnectionDemo: React.FC = () => {
    // Simulation d'une fonction de retry qui peut échouer ou réussir
    const simulateRetry = async (): Promise<void> => {
        // Simuler un délai de réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 50% de chance de succès pour la démonstration
        if (Math.random() > 0.5) {
            throw new Error('Simulation d\'échec de connexion');
        }
    };

    const connectionState = useConnectionState(simulateRetry, 3);

    const simulateConnectionError = () => {
        connectionState.setDisconnected(
            'Erreur de connexion simulée - Serveur indisponible',
            true
        );
    };

    const simulateSuccess = () => {
        connectionState.setConnected();
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                    Démonstration - Gestion de Connexion Sans Boucle
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">État actuel :</h3>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {connectionState.connectionState}
                            </span>
                            {connectionState.isRetrying && (
                                <span className="text-yellow-600 text-sm">
                                    (Tentative {connectionState.retryCount}/3)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={simulateConnectionError}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Simuler Erreur
                        </button>
                        
                        <button
                            onClick={simulateSuccess}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Simuler Succès
                        </button>
                        
                        <button
                            onClick={connectionState.clearError}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Effacer Erreur
                        </button>
                    </div>
                </div>
            </div>

            {/* Affichage du statut de connexion */}
            <ConnectionStatus
                connectionState={connectionState.connectionState}
                lastError={connectionState.lastError}
                isRetrying={connectionState.isRetrying}
                retryCount={connectionState.retryCount}
                onRetry={connectionState.canRetry ? connectionState.manualRetry : undefined}
                onDismiss={connectionState.clearError}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                    ✅ Avantages de cette approche :
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Pas de boucles d'erreur</strong> - Les retry sont manuels uniquement</li>
                    <li>• <strong>Contrôle utilisateur</strong> - L'utilisateur décide quand réessayer</li>
                    <li>• <strong>Limite de tentatives</strong> - Maximum 3 tentatives pour éviter le spam</li>
                    <li>• <strong>Feedback clair</strong> - État de connexion visible et compréhensible</li>
                    <li>• <strong>Bouton dismiss</strong> - Possibilité d'ignorer l'erreur temporairement</li>
                </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                    🔧 Comment l'utiliser dans votre code :
                </h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`// Dans votre hook ou composant
const connectionState = useConnectionState(
    async () => {
        // Votre fonction de retry
        await fetchMessages();
    },
    3 // Max 3 tentatives
);

// En cas d'erreur réseau
connectionState.setDisconnected(
    'Impossible de se connecter au serveur',
    true // Peut retry
);

// En cas de succès
connectionState.setConnected();`}
                </pre>
            </div>
        </div>
    );
};