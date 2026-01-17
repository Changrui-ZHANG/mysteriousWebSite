# Bugfix: Erreur "Cannot read properties of undefined (reading 'filter')" dans MessageReactions

## Problème

Quand l'utilisateur clique sur le bouton de réaction, l'application crash avec l'erreur:
```
TypeError: Cannot read properties of undefined (reading 'filter')
at MessageReactions (MessageReactions.tsx:33:37)
```

## Cause Racine

Le problème avait deux causes:

### 1. Mauvaise extraction des réactions depuis la réponse API

Dans `useReactions.ts`, le code faisait:
```typescript
const data = await response.json();
setReactions(data.reactions);  // ❌ ERREUR
```

Mais le backend retourne une structure `ApiResponse<Message>`:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "message": "...",
    "reactions": [...]  // ← Les réactions sont ici
  },
  "message": "Success"
}
```

Donc il fallait accéder à `data.data.reactions` au lieu de `data.reactions`.

### 2. Pas de protection contre `undefined`

- Dans `useReactions`, l'état initial utilisait directement `initialReactions` sans garantir un tableau
- Dans `MessageReactions.tsx`, le code faisait `reactions.filter()` sans vérifier si `reactions` était défini

## Solution

### 1. Corriger l'extraction des réactions dans `useReactions.ts`

**Pour `addReaction()`:**
```typescript
const result = await response.json();
// Le backend retourne ApiResponse<Message>, donc result.data.reactions
const updatedReactions = result.data?.reactions || [];
setReactions(updatedReactions);

if (onReactionUpdate) {
  onReactionUpdate(updatedReactions);
}
```

**Pour `removeReaction()`:**
```typescript
const result = await response.json();
// Le backend retourne ApiResponse<Message>, donc result.data.reactions
const updatedReactions = result.data?.reactions || [];
setReactions(updatedReactions);

if (onReactionUpdate) {
  onReactionUpdate(updatedReactions);
}
```

### 2. Garantir que `reactions` est toujours un tableau

**Dans `useReactions.ts`:**
```typescript
// État initial avec fallback
const [reactions, setReactions] = useState<Reaction[]>(initialReactions || []);

// useEffect avec protection
useEffect(() => {
  if (initialReactions && initialReactions.length > 0) {
    setReactions(initialReactions);
  } else if (!initialReactions) {
    // Si initialReactions devient undefined, réinitialiser à tableau vide
    setReactions([]);
  }
}, [initialReactions]);
```

**Dans `MessageReactions.tsx`:**
```typescript
// Protection avec fallback
const activeReactions = (reactions || []).filter(r => r.count > 0);
```

## Flux Corrigé

### Scénario: Ajouter une réaction

1. **Utilisateur clique sur emoji**:
   - `toggleReaction()` appelé
   - Optimistic update: réaction ajoutée immédiatement dans l'état local
   - Requête POST envoyée au backend

2. **Backend répond**:
   ```json
   {
     "success": true,
     "data": {
       "id": "msg-123",
       "reactions": [
         {
           "emoji": "👍",
           "count": 1,
           "users": [{"userId": "user-1", "username": "Alice", "reactedAt": "..."}]
         }
       ]
     }
   }
   ```

3. **Frontend traite la réponse**:
   - Extrait `result.data.reactions` ✅
   - Met à jour l'état avec `setReactions(updatedReactions)` ✅
   - Notifie via WebSocket pour synchroniser les autres clients ✅

4. **Composant se re-render**:
   - `reactions` est garanti d'être un tableau ✅
   - `(reactions || []).filter()` fonctionne même si undefined ✅
   - Pas de crash ✅

## Tests Manuels

### Test 1: Ajouter une réaction
1. Ouvrir MessageWall
2. Survoler un message
3. Cliquer sur le bouton réaction (😊)
4. Sélectionner un emoji
5. **Résultat attendu**: Emoji apparaît sous le message avec compteur "1"

### Test 2: Retirer une réaction
1. Cliquer sur un emoji déjà ajouté
2. **Résultat attendu**: Emoji disparaît

### Test 3: Plusieurs utilisateurs
1. Ouvrir MessageWall dans deux navigateurs
2. Ajouter une réaction dans le premier
3. **Résultat attendu**: Réaction apparaît en temps réel dans le second

### Test 4: Message sans réactions
1. Afficher un message qui n'a jamais eu de réactions
2. **Résultat attendu**: Pas d'erreur, pas de section réactions affichée

## Fichiers Modifiés

- `client/src/domain/messagewall/hooks/useReactions.ts`
  - Correction de l'extraction des réactions depuis `result.data.reactions`
  - Protection contre `initialReactions` undefined
  
- `client/src/domain/messagewall/components/MessageReactions.tsx`
  - Protection avec `(reactions || []).filter()`

## Impact

- ✅ Plus de crash lors de l'ajout de réactions
- ✅ Les réactions s'affichent correctement
- ✅ Synchronisation WebSocket fonctionne
- ✅ Gestion robuste des cas edge (undefined, null, [])
- ✅ Optimistic updates fonctionnent correctement

## Notes Techniques

### Structure ApiResponse

Le backend utilise une classe `ApiResponse<T>` générique:
```java
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
}
```

Donc pour un `ApiResponse<Message>`, la structure JSON est:
```json
{
  "success": boolean,
  "data": Message,  // ← L'objet Message complet
  "message": string
}
```

Il faut toujours accéder à `response.data` pour obtenir l'objet métier.

### Optimistic Updates

Le système utilise des optimistic updates:
1. Mise à jour immédiate de l'UI (optimiste)
2. Requête au backend
3. Si succès: synchroniser avec la réponse du serveur
4. Si échec: garder l'update optimiste (mode dégradé)

Cela garantit une UX fluide même en cas de latence réseau.

## Date

2026-01-16
