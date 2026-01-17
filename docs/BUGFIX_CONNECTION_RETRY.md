# Bugfix: Modal "Erreur de Connexion" disparaît après retry échoué

## Problème

Quand l'utilisateur clique sur "Réessayer la connexion" dans le modal d'erreur, le modal disparaît immédiatement même si la connexion échoue. L'utilisateur ne voit pas que la tentative a échoué et ne peut pas réessayer.

## Cause Racine

Le problème était dans la logique de `useConnectionState` et `useMessages`:

1. **Dans `useConnectionState.manualRetry()`**: 
   - La fonction wrappait `onRetry()` dans un try-catch
   - Si `onRetry()` ne lançait pas d'exception, elle appelait automatiquement `setConnected()`
   - Mais `fetchMessages()` ne lance pas d'exception - elle gère ses erreurs en interne

2. **Dans `useMessages.fetchMessages()`**:
   - La condition `if (isLoading || !connectionState.isConnected) return;` empêchait le fetch si `isConnected` était `false`
   - Quand on cliquait sur "Réessayer", `manualRetry()` appelait `setReconnecting()` qui ne changeait pas `isConnected` à `true`
   - Donc `fetchMessages()` retournait immédiatement sans faire de requête
   - `manualRetry()` pensait que tout s'était bien passé et appelait `setConnected()`

3. **Dans `handleSubmit()` et `handleDelete()`**:
   - Vérifiaient `!connectionState.isConnected` qui bloquait aussi en état `RECONNECTING`

## Solution

### 1. Simplifier `manualRetry()` dans `useConnectionState`

```typescript
const manualRetry = useCallback(async () => {
    if (!onRetry || isRetrying || retryCount >= maxRetries) {
        return;
    }

    setReconnecting();
    setRetryCount(prev => prev + 1);
    
    // onRetry doit gérer ses propres erreurs et appeler setConnected/setDisconnected
    await onRetry();
}, [onRetry, isRetrying, retryCount, maxRetries, setReconnecting]);
```

**Changements**:
- Supprimé le try-catch qui appelait automatiquement `setConnected()`
- La responsabilité de mettre à jour l'état de connexion est maintenant dans `fetchMessages()`

### 2. Retirer la condition `!connectionState.isConnected` dans `fetchMessages()`

```typescript
const fetchMessages = useCallback(async () => {
    if (isLoading) return; // Seulement vérifier isLoading
    
    try {
        setIsLoading(true);
        connectionState.setReconnecting();
        
        const response = await fetch(API_ENDPOINTS.MESSAGES.LIST);
        
        if (response.ok) {
            // ... traiter les données
            connectionState.setConnected(); // ✅ Succès
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        // ... gérer l'erreur
        connectionState.setDisconnected(errorMessage, true); // ❌ Échec
    } finally {
        setIsLoading(false);
    }
}, [isLoading, connectionState, t]);
```

**Changements**:
- Retiré `!connectionState.isConnected` de la condition
- Maintenant `fetchMessages()` peut être appelé même en état déconnecté (pour le retry)
- `fetchMessages()` gère correctement les états de succès/échec

### 3. Corriger les vérifications dans `handleSubmit()` et `handleDelete()`

```typescript
// Avant
if (!connectionState.isConnected) { ... }

// Après
if (connectionState.connectionState === ConnectionState.ERROR) { ... }
```

**Changements**:
- Vérifier l'état `ERROR` au lieu de `!isConnected`
- Permet l'envoi/suppression en état `RECONNECTING` (pendant le retry)

## Flux Corrigé

### Scénario: Retry après échec de connexion

1. **État initial**: `ERROR` avec message d'erreur
2. **Utilisateur clique "Réessayer"**:
   - `manualRetry()` appelé
   - État → `RECONNECTING`
   - `retryCount` incrémenté
   - `fetchMessages()` appelé

3. **Si `fetchMessages()` réussit**:
   - Données chargées
   - État → `CONNECTED`
   - Modal disparaît ✅

4. **Si `fetchMessages()` échoue**:
   - Erreur capturée
   - État → `ERROR` avec nouveau message
   - Modal reste visible avec bouton "Réessayer" ✅
   - Utilisateur peut réessayer (jusqu'à 3 fois)

## Tests Manuels

### Test 1: Retry avec backend arrêté
1. Arrêter le backend
2. Ouvrir MessageWall
3. Voir le modal d'erreur
4. Cliquer "Réessayer la connexion"
5. **Résultat attendu**: Modal reste visible avec message d'erreur

### Test 2: Retry avec backend démarré
1. Arrêter le backend
2. Ouvrir MessageWall
3. Voir le modal d'erreur
4. Démarrer le backend
5. Cliquer "Réessayer la connexion"
6. **Résultat attendu**: Modal disparaît, messages chargés

### Test 3: Limite de retry
1. Arrêter le backend
2. Ouvrir MessageWall
3. Cliquer "Réessayer" 3 fois
4. **Résultat attendu**: Après 3 tentatives, bouton "Réessayer" désactivé avec message "Maximum retry attempts reached"

## Fichiers Modifiés

- `client/src/shared/hooks/useConnectionState.ts`
- `client/src/domain/messagewall/hooks/useMessages.ts`

## Impact

- ✅ Le modal d'erreur reste visible jusqu'à ce que la connexion soit vraiment établie
- ✅ L'utilisateur peut réessayer jusqu'à 3 fois
- ✅ Pas de boucle infinie de requêtes
- ✅ Feedback clair sur l'état de la connexion
- ✅ Expérience utilisateur améliorée

## Date

2026-01-16
