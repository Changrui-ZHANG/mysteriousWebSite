# Correction : Boucle infinie de requêtes dans MessageWall

## Problème identifié

Le MessageWall envoyait des requêtes en boucle au backend, causant :
- Affichage répété du modal de reconnexion
- Surcharge du serveur avec des requêtes infinies
- Mauvaise expérience utilisateur

## Cause racine

Dans `client/src/domain/messagewall/hooks/useMessages.ts`, il y avait **deux useEffect** qui créaient une boucle infinie :

```typescript
// ❌ AVANT (PROBLÉMATIQUE)
const fetchMessages = useCallback(async () => {
    // ... fetch logic avec filtrage par activeChannelId
}, [isLoading, connectionState, t, activeChannelId]); // activeChannelId dans les dépendances

useEffect(() => {
    fetchMessages();
}, []); // Fetch initial

useEffect(() => {
    if (activeChannelId) {
        fetchMessages(); // ❌ Refetch à chaque changement de channel
    }
}, [activeChannelId, fetchMessages]); // ❌ fetchMessages change à cause de activeChannelId
```

**Problème** : 
1. `fetchMessages` a `activeChannelId` dans ses dépendances
2. Le second `useEffect` a `fetchMessages` dans ses dépendances
3. Quand `activeChannelId` change → `fetchMessages` change → `useEffect` se déclenche → `fetchMessages()` est appelé → boucle infinie

## Solution implémentée

### 1. Séparation des responsabilités

```typescript
// ✅ APRÈS (CORRIGÉ)
const [allMessages, setAllMessages] = useState<Message[]>([]); // Tous les messages
const [messages, setMessages] = useState<Message[]>([]); // Messages filtrés
```

### 2. Fetch unique au démarrage

```typescript
const fetchMessages = useCallback(async () => {
    // Charge TOUS les messages UNE SEULE FOIS
    const data = await fetch(API_ENDPOINTS.MESSAGES.LIST);
    setAllMessages(data); // Pas de filtrage ici
}, [isLoading, connectionState, t]); // activeChannelId RETIRÉ

useEffect(() => {
    fetchMessages(); // UNE SEULE FOIS au démarrage
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### 3. Filtrage côté client

```typescript
// Filtrer les messages par channel actif (côté client, SANS refetch)
useEffect(() => {
    if (activeChannelId && allMessages.length > 0) {
        const filteredMessages = allMessages.filter((msg: Message) => {
            const msgChannelId = msg.channelId || 'general';
            return msgChannelId === activeChannelId;
        });
        setMessages(filteredMessages);
    }
}, [activeChannelId, allMessages]); // Pas de fetchMessages ici
```

### 4. WebSocket mis à jour

```typescript
case 'NEW_MESSAGE': {
    const newMessage = event.payload as Message;
    // Ajouter à TOUS les messages (pas seulement au channel actif)
    setAllMessages(prev => [...prev, newMessage]);
    // Le filtrage se fera automatiquement via l'useEffect
    break;
}
```

## Avantages de la solution

1. **Pas de boucle** : Fetch unique au démarrage, filtrage côté client
2. **Performance** : Pas de requêtes réseau à chaque changement de channel
3. **Simplicité** : Logique claire et prévisible
4. **Scalabilité** : Fonctionne même avec beaucoup de channels

## Règles à respecter

### ❌ À NE JAMAIS FAIRE

```typescript
// Ne JAMAIS mettre une fonction dans les dépendances d'un useEffect
// si cette fonction a elle-même des dépendances qui changent souvent
useEffect(() => {
    fetchData();
}, [fetchData]); // ❌ DANGEREUX

const fetchData = useCallback(() => {
    // ...
}, [frequentlyChangingValue]); // ❌ Crée une boucle
```

### ✅ À FAIRE

```typescript
// Option 1 : Fetch une seule fois, filtrer côté client
useEffect(() => {
    fetchData();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Option 2 : Utiliser une ref pour éviter les dépendances
const fetchDataRef = useRef(fetchData);
useEffect(() => {
    fetchDataRef.current = fetchData;
});

useEffect(() => {
    fetchDataRef.current();
}, [dependency]); // Pas de boucle
```

## Tests de validation

- [x] Aucune requête en boucle au backend
- [x] Modal de reconnexion ne s'affiche plus en boucle
- [x] Changement de channel instantané (filtrage client)
- [x] Nouveaux messages apparaissent dans le bon channel
- [x] WebSocket fonctionne correctement

## Date de correction

16 janvier 2026
