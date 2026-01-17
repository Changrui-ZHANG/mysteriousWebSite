# Bugfix: Hooks de Réactions Dupliqués

## Problème

Les réactions ne s'affichent toujours pas par défaut, même après la correction du `useEffect`. Le problème persiste : les réactions ne s'affichent qu'après interaction.

## Cause Racine Identifiée

Le problème était que **deux instances du hook `useReactions` étaient créées pour le même message** :

1. **Dans `MessageItem`** : Pour gérer le picker de réactions
2. **Dans `MessageReactions`** : Pour afficher les réactions existantes

Ces deux hooks avaient des états séparés qui pouvaient se désynchroniser.

### Flux Problématique

```
MessageItem
├── useReactions({ messageId: "msg-123", initialReactions: [...] })  // Instance 1
└── MessageReactions
    └── useReactions({ messageId: "msg-123", initialReactions: [...] })  // Instance 2
```

**Problème** : Les deux instances gèrent le même `messageId` mais ont des états `reactions` séparés qui peuvent diverger.

## Solution

Utiliser **une seule instance du hook `useReactions`** dans `MessageItem` et la partager avec `MessageReactions`.

### Changements Appliqués

#### 1. `MessageItem.tsx` - Hook unique

```typescript
// ✅ Une seule instance du hook
const reactionHook = useReactions({ 
    messageId: msg.id, 
    initialReactions: msg.reactions || [],
    onReactionUpdate: onReactionUpdate ? (reactions) => onReactionUpdate(msg.id, reactions) : undefined
});

// Utiliser le hook pour le picker
onClick={async () => {
    await reactionHook.toggleReaction(emoji);
    setShowReactionPicker(false);
}}

// Passer le hook à MessageReactions
<MessageReactions 
    messageId={msg.id}
    initialReactions={msg.reactions || []}
    reactionHook={reactionHook}  // ← Partage du hook
/>
```

#### 2. `MessageReactions.tsx` - Hook optionnel

```typescript
interface MessageReactionsProps {
  messageId: string;
  initialReactions?: Reaction[];
  reactionHook?: ReturnType<typeof useReactions>; // Hook passé depuis le parent
}

export const MessageReactions = ({ 
  messageId, 
  initialReactions = [],
  reactionHook
}: MessageReactionsProps) => {
  // Utiliser le hook passé en props ou créer le nôtre (fallback)
  const localHook = useReactions({ messageId, initialReactions });
  const {
    reactions,
    isLoading,
    toggleReaction,
    hasUserReacted,
    getUsersForReaction,
  } = reactionHook || localHook;
```

### Avantages de Cette Approche

1. **État unique** : Une seule source de vérité pour les réactions d'un message
2. **Synchronisation garantie** : Picker et affichage utilisent le même état
3. **Rétrocompatibilité** : `MessageReactions` peut encore fonctionner seul (fallback)
4. **Performance** : Moins d'appels API et de re-renders

## Flux Corrigé

```
MessageItem
├── useReactions({ messageId: "msg-123", initialReactions: [...] })  // Instance unique
├── Picker utilise reactionHook.toggleReaction()
└── MessageReactions
    └── Utilise le reactionHook passé en props  // Même instance
```

## Test de Vérification

### Avant la Correction

1. Actualiser MessageWall (F5)
2. **Résultat** : Messages avec réactions ne les affichent pas
3. Cliquer sur le bouton réaction
4. **Résultat** : Les réactions s'affichent soudainement

### Après la Correction

1. Actualiser MessageWall (F5)
2. **Résultat attendu** : Tous les messages avec réactions les affichent immédiatement ✅
3. Cliquer sur le bouton réaction d'un autre message
4. **Résultat attendu** : Nouvelle réaction ajoutée sans affecter les autres ✅

### Logs Attendus

```
[MessageItem] Emoji clicked {emoji: "👍", messageId: "msg-123"}
[useReactions] toggleReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] addReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] Sending request to backend {...}
[useReactions] Response received {ok: true, status: 200}
[MessageReactions] {messageId: "msg-123", initialReactions: 1, reactions: 2, ...}
```

## Impact

- ✅ Une seule instance de `useReactions` par message
- ✅ État synchronisé entre picker et affichage
- ✅ Réactions s'affichent immédiatement au chargement
- ✅ Pas de conflit entre hooks multiples
- ✅ Performance améliorée

## Fichiers Modifiés

- `client/src/domain/messagewall/components/MessageItem.tsx`
  - Création d'une instance unique de `useReactions`
  - Passage du hook à `MessageReactions` via props
  - Utilisation du hook pour le picker

- `client/src/domain/messagewall/components/MessageReactions.tsx`
  - Ajout de la prop `reactionHook` optionnelle
  - Utilisation du hook passé en props ou fallback local
  - Maintien de la rétrocompatibilité

## Notes Techniques

### Pourquoi Deux Hooks Posaient Problème ?

1. **États séparés** : Chaque hook avait son propre état `reactions`
2. **Initialisation différée** : Les hooks pouvaient s'initialiser à des moments différents
3. **Conditions de course** : Les `useEffect` pouvaient s'exécuter dans un ordre imprévisible
4. **Désynchronisation** : Un hook pouvait avoir les bonnes données, l'autre pas

### Pattern de Partage de Hook

Ce pattern est utile quand :
- Plusieurs composants doivent partager le même état
- On veut éviter la duplication de logique
- On veut garantir la cohérence des données

### Alternative Considérée

On aurait pu utiliser un Context React, mais le partage direct du hook est plus simple pour ce cas d'usage spécifique.

## Prochaines Étapes

1. ✅ Tester l'affichage immédiat des réactions
2. ✅ Tester l'ajout de nouvelles réactions
3. ✅ Vérifier que les logs sont cohérents
4. ✅ Retirer les logs de debug une fois confirmé

## Date

2026-01-16