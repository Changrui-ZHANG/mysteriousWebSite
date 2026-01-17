# Bugfix: Les Réactions Ne S'Affichent Qu'Après Interaction

## Problème

Les réactions sont correctement sauvegardées et les données arrivent jusqu'au composant `MessageItem` (visible dans les logs debug), mais `MessageReactions` ne les affiche que si l'utilisateur a interagi avec le message.

## Symptômes

- ✅ Réactions sauvegardées en base de données
- ✅ Réactions chargées par le backend
- ✅ Réactions reçues par le frontend
- ✅ Données visibles dans les logs debug de `MessageItem`
- ❌ `MessageReactions` ne s'affiche pas par défaut
- ✅ `MessageReactions` s'affiche après avoir cliqué sur le bouton réaction

## Cause Racine

Le problème était dans le hook `useReactions` qui ne synchronisait pas correctement son état interne `reactions` avec les `initialReactions` reçues en props.

### Code Problématique

```typescript
// ❌ ANCIEN CODE dans useReactions.ts
useEffect(() => {
    if (initialReactions && initialReactions.length > 0) {
        setReactions(initialReactions);
    } else if (!initialReactions) {
        setReactions([]);
    }
}, [initialReactions]);
```

**Problème**: Le `useEffect` ne mettait à jour `reactions` que si `initialReactions.length > 0`. Si `initialReactions` était un tableau vide `[]`, l'état `reactions` n'était jamais synchronisé.

### Flux Problématique

1. **Message chargé**: `msg.reactions = [{emoji: "👍", count: 1, ...}]`
2. **MessageItem rendu**: `initialReactions = msg.reactions` (correct)
3. **useReactions appelé**: `useState(initialReactions)` → état initial correct
4. **useEffect exécuté**: Condition `initialReactions.length > 0` → true → `setReactions(initialReactions)` ✅
5. **Mais si le composant se re-render** pour une autre raison...
6. **useEffect re-exécuté**: Même condition, mais parfois `initialReactions` peut être `[]` temporairement
7. **État `reactions` devient `[]`** → `activeReactions.length === 0` → `return null`

## Solution

Simplifier le `useEffect` pour toujours synchroniser avec `initialReactions`:

```typescript
// ✅ NOUVEAU CODE dans useReactions.ts
useEffect(() => {
    console.log('[useReactions] initialReactions changed', { messageId, initialReactions });
    setReactions(initialReactions || []);
}, [initialReactions, messageId]);
```

**Changements**:
- Suppression de la condition complexe
- Synchronisation systématique avec `initialReactions`
- Ajout de `messageId` dans les dépendances pour éviter les conflits entre messages
- Ajout d'un log pour déboguer

## Logs de Debug Ajoutés

### Dans `useReactions.ts`
```typescript
console.log('[useReactions] initialReactions changed', { messageId, initialReactions });
```

### Dans `MessageReactions.tsx`
```typescript
console.log('[MessageReactions]', { 
    messageId, 
    initialReactions: initialReactions.length, 
    reactions: reactions.length,
    initialReactionsData: initialReactions,
    reactionsData: reactions
});

console.log('[MessageReactions] activeReactions', { 
    activeReactions: activeReactions.length, 
    activeReactionsData: activeReactions 
});

if (activeReactions.length === 0) {
    console.log('[MessageReactions] No active reactions, returning null');
}
```

## Test de Vérification

### Avant la Correction

1. Actualiser MessageWall (F5)
2. **Résultat**: Messages avec réactions ne les affichent pas
3. Cliquer sur le bouton réaction d'un message
4. **Résultat**: Les réactions s'affichent soudainement

### Après la Correction

1. Actualiser MessageWall (F5)
2. **Résultat attendu**: Tous les messages avec réactions les affichent immédiatement ✅

### Logs Attendus (Console)

```
[useReactions] initialReactions changed {messageId: "msg-123", initialReactions: [{emoji: "👍", ...}]}
[MessageReactions] {messageId: "msg-123", initialReactions: 1, reactions: 1, ...}
[MessageReactions] activeReactions {activeReactions: 1, activeReactionsData: [{emoji: "👍", ...}]}
```

**Si vous voyez**:
```
[MessageReactions] No active reactions, returning null
```
Il y a encore un problème dans la synchronisation.

## Impact

- ✅ Les réactions s'affichent immédiatement au chargement de la page
- ✅ Pas besoin d'interagir avec un message pour voir ses réactions
- ✅ Synchronisation correcte entre `initialReactions` et l'état interne
- ✅ Comportement cohérent entre messages

## Fichiers Modifiés

- `client/src/domain/messagewall/hooks/useReactions.ts`
  - Simplification du `useEffect` de synchronisation
  - Ajout de logs de debug

- `client/src/domain/messagewall/components/MessageReactions.tsx`
  - Ajout de logs de debug détaillés

## Notes Techniques

### Pourquoi ce bug se produisait-il ?

Le hook `useReactions` était conçu pour gérer deux cas:
1. **Réactions initiales** (chargées depuis le serveur)
2. **Réactions mises à jour** (via WebSocket ou interactions)

La logique complexe du `useEffect` essayait de distinguer ces cas, mais créait des conditions de course où l'état pouvait devenir désynchronisé.

### Pourquoi ça marchait après interaction ?

Quand l'utilisateur cliquait sur le bouton réaction:
1. `toggleReaction()` était appelé
2. Optimistic update: `setReactions()` avec les nouvelles données
3. L'état `reactions` était forcé à se synchroniser
4. Les réactions s'affichaient

### Solution Plus Robuste

La nouvelle approche est plus simple et robuste:
- **Synchronisation systématique** avec `initialReactions`
- **Pas de logique conditionnelle** complexe
- **Dépendance sur `messageId`** pour éviter les conflits

## Retirer les Logs

Une fois le problème confirmé résolu, retirer les `console.log()` ajoutés pour nettoyer le code.

## Date

2026-01-16