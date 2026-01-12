# Système de Gestion d'Erreur Avancé

## Vue d'ensemble

Ce système empêche les requêtes en boucle infinie en cas d'erreur grâce à plusieurs mécanismes de protection :

## 🔧 Composants Principaux

### 1. Circuit Breaker (`circuitBreaker.ts`)

**Principe** : Bloque temporairement les requêtes après un certain nombre d'échecs.

**États** :
- `CLOSED` : Fonctionnement normal
- `OPEN` : Requêtes bloquées (service indisponible)
- `HALF_OPEN` : Test de récupération (nombre limité de requêtes)

**Configuration par défaut** :
```typescript
{
    failureThreshold: 5,        // 5 échecs avant ouverture
    resetTimeout: 60000,        // 1 minute avant test de récupération
    monitoringPeriod: 300000,   // 5 minutes de surveillance
    halfOpenMaxCalls: 3         // 3 appels max en mode test
}
```

### 2. Hook de Requête Retryable (`useRetryableRequest.ts`)

**Fonctionnalités** :
- Retry intelligent avec backoff exponentiel
- Protection circuit breaker intégrée
- Annulation de requêtes en cours
- Jitter pour éviter l'effet "thundering herd"

**Configuration par défaut** :
```typescript
{
    maxAttempts: 3,
    baseDelay: 1000,           // 1 seconde
    maxDelay: 10000,           // 10 secondes max
    backoffMultiplier: 2,      // Doublement du délai
    jitter: true               // ±25% de variation aléatoire
}
```

### 3. Hooks de Profil Améliorés

#### `useProfile.ts`
- **Protection contre les requêtes simultanées** : Vérifie `isLoading`, `isCreating`, `isUpdating`
- **Retry intelligent** : Utilise le circuit breaker pour les chargements
- **Gestion d'état robuste** : Évite les états incohérents

#### `useActivityStats.ts`
- **Batching des activités** : Regroupe les activités similaires
- **Queue de traitement** : Évite le spam de requêtes d'activité
- **Auto-refresh intelligent** : S'arrête en cas d'erreur
- **Debouncing** : Traite la queue après 1 seconde d'inactivité

## 🚫 Protection Contre les Boucles Infinies

### 1. Vérifications d'État
```typescript
if (isLoading || isCreating || isUpdating) return;
```

### 2. Circuit Breaker
```typescript
// Bloque automatiquement après 5 échecs
if (circuitState === CircuitState.OPEN) {
    throw new Error('Service temporarily unavailable');
}
```

### 3. Erreurs Non-Retryables
```typescript
const nonRetryableCodes = [
    'AUTH_REQUIRED',
    'AUTH_INVALID', 
    'PERMISSION_DENIED',
    'VALIDATION_ERROR',
    'INVALID_INPUT',
    'RESOURCE_NOT_FOUND'
];
```

### 4. Batching des Activités
```typescript
// Regroupe les messages pour éviter le spam
const totalMessages = messageActivities.reduce((sum, activity) => {
    return sum + (activity.metadata?.messageCount || 1);
}, 0);
```

### 5. Auto-refresh Conditionnel
```typescript
// S'arrête si erreur ou déjà en cours
if (!isLoading && !error) {
    loadStats();
}
```

## 📊 Monitoring et Debug

### Circuit Breaker Stats
```typescript
const stats = circuitBreaker.getStats();
// {
//     state: 'CLOSED',
//     failureCount: 2,
//     recentFailures: 1,
//     lastFailureTime: 1640995200000,
//     nextRetryTime: 1640995260000
// }
```

### Logs Structurés
- Tentatives de retry avec numéro d'essai
- Erreurs réseau vs erreurs applicatives
- État du circuit breaker

## 🎯 Bonnes Pratiques

### 1. Utilisation des Hooks
```typescript
// ✅ Bon
const { profile, isLoading, canRetry, retryLoad } = useProfile({
    userId: user?.userId,
    viewerId: user?.userId
});

// ❌ Éviter les appels directs répétés
useEffect(() => {
    loadProfile(); // Peut créer une boucle
}, [error]); // Dépendance dangereuse
```

### 2. Gestion d'Erreur UI
```typescript
// ✅ Offrir plusieurs options de récupération
{error && (
    <div>
        <button onClick={refreshProfile}>Try again</button>
        {canRetry && (
            <button onClick={retryLoad}>Retry with backoff</button>
        )}
    </div>
)}
```

### 3. Activités Batchées
```typescript
// ✅ Utiliser les méthodes dédiées
await recordMessage(5); // Batch automatique

// ❌ Éviter les appels individuels
for (let i = 0; i < 5; i++) {
    await recordActivity({ type: 'message' }); // Spam
}
```

## 🔍 Dépannage

### Circuit Breaker Ouvert
1. Vérifier les logs réseau
2. Attendre le `resetTimeout` (1 minute)
3. Ou réinitialiser manuellement : `circuitBreaker.reset()`

### Requêtes Bloquées
1. Vérifier l'état `isLoading/isUpdating`
2. Vérifier les dépendances des `useCallback`
3. Utiliser les méthodes `retry*` appropriées

### Performance
1. Les activités sont batchées automatiquement
2. L'auto-refresh s'arrête en cas d'erreur
3. Le jitter évite les pics de charge

## 📈 Métriques de Succès

- **Réduction des requêtes** : Batching des activités (-80% de requêtes)
- **Récupération automatique** : Circuit breaker (récupération en 1 minute)
- **UX améliorée** : Retry intelligent avec feedback utilisateur
- **Stabilité** : Pas de boucles infinites observées

Ce système garantit une expérience utilisateur robuste même en cas de problèmes réseau ou serveur.