# Bugfix: Le Picker de Réactions N'Appelle Pas le Backend

## Problème

Quand l'utilisateur clique sur le bouton de réaction (😊) et sélectionne un emoji, aucune requête n'est envoyée au backend. Les réactions s'affichent localement mais disparaissent après actualisation.

## Cause Racine

Le composant `MessageItem` avait son propre picker de réactions qui manipulait directement l'état local sans appeler le backend:

```typescript
// ❌ ANCIEN CODE - Manipulation locale uniquement
onClick={() => {
    if (onReactionUpdate) {
        const currentReactions = msg.reactions || [];
        // ... manipulation locale des réactions
        onReactionUpdate(msg.id, newReactions);
    }
    setShowReactionPicker(false);
}}
```

Ce code:
1. Modifiait les réactions localement
2. Appelait `onReactionUpdate` qui mettait à jour l'état React
3. **Ne faisait AUCUN appel au backend**
4. Les réactions n'étaient jamais sauvegardées en base de données

## Solution

Remplacer le code du picker pour utiliser le hook `useReactions` qui gère correctement:
- L'optimistic update (affichage immédiat)
- L'appel au backend (persistance)
- La synchronisation WebSocket (temps réel)

### Changements Appliqués

#### 1. Import du hook

```typescript
import { useReactions } from '../hooks/useReactions';
```

#### 2. Utilisation du hook dans le composant

```typescript
const { toggleReaction } = useReactions({ 
    messageId: msg.id, 
    initialReactions: msg.reactions || [],
    onReactionUpdate: onReactionUpdate ? (reactions) => onReactionUpdate(msg.id, reactions) : undefined
});
```

#### 3. Simplification du onClick

```typescript
// ✅ NOUVEAU CODE - Appel au backend via le hook
onClick={async () => {
    console.log('[MessageItem] Emoji clicked', { emoji, messageId: msg.id });
    await toggleReaction(emoji);
    setShowReactionPicker(false);
}}
```

## Flux Corrigé

### Avant (Broken)

1. User clique sur emoji
2. Code manipule `msg.reactions` localement
3. Appelle `onReactionUpdate(messageId, newReactions)`
4. État React mis à jour
5. **FIN** - Pas d'appel backend, pas de persistance

### Après (Fixed)

1. User clique sur emoji
2. `toggleReaction(emoji)` appelé
3. **Optimistic update**: Réaction ajoutée immédiatement dans l'UI
4. **Requête backend**: `POST /api/messages/reactions/add`
5. **Backend sauvegarde** en base de données
6. **Réponse backend**: Réactions mises à jour
7. **WebSocket broadcast**: Synchronisation avec autres clients
8. **État React mis à jour** avec les données du serveur

## Logs de Debug

Avec les logs ajoutés, vous devriez maintenant voir dans la console:

```
[MessageItem] Emoji clicked {emoji: "👍", messageId: "msg-123"}
[useReactions] toggleReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] addReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] Adding reaction... {emoji: "👍", userId: "user-123", username: "Alice"}
[useReactions] Sending request to backend {payload: {...}, url: "/api/messages/reactions/add"}
[useReactions] Response received {ok: true, status: 200}
[useReactions] Reactions updated from backend {updatedReactions: [...]}
```

## Test

### Test 1: Vérifier l'appel backend

1. Ouvrir MessageWall
2. Ouvrir DevTools (F12) → Onglet "Network"
3. Cliquer sur le bouton réaction (😊)
4. Sélectionner un emoji (ex: 👍)
5. **Résultat attendu**: 
   - Requête POST à `/api/messages/reactions/add` visible dans Network
   - Statut 200 OK
   - Réponse contient `{"success":true,"data":{...}}`

### Test 2: Vérifier la persistance

1. Ajouter une réaction
2. Actualiser la page (F5)
3. **Résultat attendu**: La réaction est toujours là ✅

### Test 3: Vérifier la synchronisation temps réel

1. Ouvrir MessageWall dans deux navigateurs
2. Ajouter une réaction dans le premier
3. **Résultat attendu**: La réaction apparaît immédiatement dans le second ✅

## Fichiers Modifiés

- `client/src/domain/messagewall/components/MessageItem.tsx`
  - Ajout de l'import `useReactions`
  - Ajout du hook dans le composant
  - Simplification du onClick du picker
  - Ajout d'un log de debug

## Impact

- ✅ Les réactions sont maintenant sauvegardées en base de données
- ✅ Les réactions persistent après actualisation
- ✅ Les réactions se synchronisent en temps réel via WebSocket
- ✅ Le code est plus simple et maintenable
- ✅ Utilise le système de réactions centralisé

## Notes

### Pourquoi l'ancien code ne fonctionnait pas ?

L'ancien code était un **prototype** qui simulait les réactions côté client uniquement. Il était prévu d'être remplacé par un vrai système avec backend, mais cela n'avait pas été fait.

Le commentaire dans le code l'indiquait:
```typescript
// Simuler le toggle (à améliorer avec userId)
```

### Optimistic Updates

Le hook `useReactions` utilise des **optimistic updates**:
- L'UI se met à jour immédiatement (pas d'attente)
- La requête backend se fait en arrière-plan
- Si le backend échoue, l'update optimiste est conservée (mode dégradé)
- Si le backend réussit, l'état est synchronisé avec la réponse

Cela garantit une UX fluide même avec de la latence réseau.

## Prochaines Étapes

1. ✅ Tester l'ajout de réactions
2. ✅ Vérifier les logs dans la console
3. ✅ Vérifier la requête dans Network
4. ✅ Tester la persistance (F5)
5. ✅ Appliquer la migration si nécessaire (voir `docs/FIX_REACTIONS_PERSISTENCE.md`)

## Date

2026-01-16
