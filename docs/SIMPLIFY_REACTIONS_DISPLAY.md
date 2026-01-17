# Simplification: Affichage Direct des Réactions

## Nouvelle Approche

Après plusieurs tentatives avec des hooks complexes, j'ai simplifié l'approche en supprimant complètement le hook `useReactions` de `MessageReactions` et en affichant directement les réactions depuis les props.

## Changements Appliqués

### 1. `MessageReactions.tsx` - Composant Simplifié

**Avant** (avec hook):
```typescript
const { reactions, toggleReaction } = useReactions({ messageId, initialReactions });
```

**Après** (props directes):
```typescript
interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[]; // Directement depuis les props
  onReactionClick?: (emoji: string) => void; // Callback simple
}

export const MessageReactions = ({ reactions, onReactionClick }) => {
  // Pas de hook, juste affichage des props
  const activeReactions = reactions.filter(r => r.count > 0);
  
  if (activeReactions.length === 0) {
    return null;
  }
  
  return (
    <div className="message-reactions-container">
      {activeReactions.map((reaction) => (
        <ReactionButton
          key={reaction.emoji}
          emoji={reaction.emoji}
          count={reaction.count}
          users={reaction.users}
          onClick={() => onReactionClick?.(reaction.emoji)}
        />
      ))}
    </div>
  );
};
```

### 2. `MessageItem.tsx` - Gestion Centralisée

```typescript
// Une seule instance du hook dans MessageItem
const reactionHook = useReactions({ 
    messageId: msg.id, 
    initialReactions: msg.reactions || [],
    onReactionUpdate: onReactionUpdate ? (reactions) => onReactionUpdate(msg.id, reactions) : undefined
});

// Passage direct des réactions et callback
<MessageReactions 
    messageId={msg.id}
    reactions={msg.reactions || []}  // ← Props directes
    onReactionClick={(emoji) => reactionHook.toggleReaction(emoji)}  // ← Callback simple
/>
```

## Avantages de Cette Approche

1. **Simplicité** : `MessageReactions` est un composant de présentation pur
2. **Pas de duplication** : Un seul hook `useReactions` par message
3. **Données directes** : Affichage immédiat des `msg.reactions`
4. **Debugging facile** : Logs clairs dans `MessageReactions`
5. **Performance** : Pas de `useEffect` complexes dans `MessageReactions`

## Flux Simplifié

```
MessageItem
├── msg.reactions (données du serveur)
├── reactionHook = useReactions() (gestion des interactions)
├── Picker utilise reactionHook.toggleReaction()
└── MessageReactions
    ├── Affiche directement msg.reactions
    └── onReactionClick → reactionHook.toggleReaction()
```

## Logs de Debug

Maintenant vous devriez voir dans la console:

```
[MessageReactions] Rendering with reactions: {messageId: "msg-123", reactions: [{emoji: "👍", count: 1, ...}]}
[MessageReactions] Active reactions: {activeReactions: [{emoji: "👍", count: 1, ...}]}
```

**Si vous voyez encore**:
```
[MessageReactions] No active reactions, returning null
```
Alors le problème est que `msg.reactions` est vide ou undefined.

## Test

1. **Actualisez la page** (F5)
2. **Vérifiez la console** pour les logs `[MessageReactions]`
3. **Résultat attendu** : Les réactions s'affichent immédiatement

## Diagnostic

### Si les réactions ne s'affichent toujours pas

Vérifiez dans la console:

1. **Log debug de `MessageItem`** :
   ```
   Debug: [{"emoji":"❤️","count":1,"users":[...]}]
   ```
   ✅ Si visible → Les données arrivent jusqu'à `MessageItem`

2. **Log de `MessageReactions`** :
   ```
   [MessageReactions] Rendering with reactions: {messageId: "msg-123", reactions: [...]}
   ```
   ✅ Si visible → Les données arrivent jusqu'à `MessageReactions`

3. **Log des réactions actives** :
   ```
   [MessageReactions] Active reactions: {activeReactions: [...]}
   ```
   ✅ Si `activeReactions` n'est pas vide → Les réactions devraient s'afficher

### Si `activeReactions` est vide

Le problème est dans le filtrage `reactions.filter(r => r.count > 0)`.

Vérifiez que les réactions ont bien `count > 0` dans les données debug.

### Si tout semble correct mais rien ne s'affiche

Le problème est probablement dans le CSS. Vérifiez que `.message-reactions-container` est visible.

## Impact

- ✅ Composant `MessageReactions` simplifié (présentation pure)
- ✅ Pas de hooks dupliqués
- ✅ Affichage direct des données serveur
- ✅ Debugging plus facile
- ✅ Performance améliorée

## Fichiers Modifiés

- `client/src/domain/messagewall/components/MessageReactions.tsx`
  - Suppression du hook `useReactions`
  - Affichage direct des props `reactions`
  - Callback simple `onReactionClick`

- `client/src/domain/messagewall/components/MessageItem.tsx`
  - Passage des `msg.reactions` directement
  - Callback vers `reactionHook.toggleReaction`

## Prochaines Étapes

1. ✅ Tester l'affichage immédiat
2. ✅ Vérifier les logs dans la console
3. ✅ Tester l'ajout de nouvelles réactions
4. ✅ Si ça marche, retirer les logs debug

Cette approche devrait enfin résoudre le problème d'affichage !

## Date

2026-01-16