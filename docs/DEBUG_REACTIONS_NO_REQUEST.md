# Debug: Pas de Requête Envoyée au Backend pour les Réactions

## Problème

Quand on clique sur le bouton de réaction et sélectionne un emoji, aucune requête n'est envoyée au backend (visible dans l'onglet Network des DevTools).

## Logs de Debug Ajoutés

Des logs ont été ajoutés dans `useReactions.ts` pour identifier où le code s'arrête:

### Dans `addReaction()`:
```typescript
console.log('[useReactions] addReaction called', { emoji, user, messageId });
console.log('[useReactions] Adding reaction...', { emoji, userId, username });
console.log('[useReactions] Sending request to backend', { payload, url });
console.log('[useReactions] Response received', { ok, status });
console.log('[useReactions] Reactions updated from backend', { updatedReactions });
console.error('[useReactions] Error in addReaction', err);
```

### Dans `removeReaction()`:
```typescript
console.log('[useReactions] removeReaction called', { emoji, user, messageId });
console.log('[useReactions] Removing reaction...', { emoji, userId });
```

## Comment Déboguer

### Étape 1: Ouvrir la Console du Navigateur

1. Ouvrir MessageWall
2. Appuyer sur F12 pour ouvrir les DevTools
3. Aller dans l'onglet "Console"
4. Cliquer sur le bouton réaction (😊) et sélectionner un emoji

### Étape 2: Analyser les Logs

#### Scénario 1: Aucun log n'apparaît

**Signification**: Le clic sur l'emoji ne déclenche pas `toggleReaction()`

**Causes possibles**:
- Le composant `MessageReactions` n'est pas rendu
- L'événement `onClick` n'est pas attaché
- Le picker d'emoji ne retourne pas l'emoji sélectionné

**Solution**: Vérifier que le picker d'emoji appelle bien `onEmojiSelect` avec l'emoji

#### Scénario 2: Log "addReaction called" mais pas "Adding reaction..."

**Signification**: `user` est `null` ou `undefined`

**Log attendu**:
```
[useReactions] addReaction called {emoji: "👍", user: null, messageId: "msg-123"}
[useReactions] No user, cannot add reaction
```

**Causes possibles**:
- L'utilisateur n'est pas connecté
- Le contexte `AuthContext` ne fournit pas `user`
- Le composant n'a pas accès au contexte

**Solution**: 
1. Vérifier que l'utilisateur est connecté
2. Vérifier `useAuth()` dans la console:
   ```javascript
   // Dans la console du navigateur
   window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.get(1).getCurrentFiber()
   ```
3. Vérifier que `AuthProvider` enveloppe bien l'application

#### Scénario 3: Log "Adding reaction..." mais pas "Sending request..."

**Signification**: Le code plante pendant l'optimistic update

**Causes possibles**:
- Erreur dans `setReactions()`
- Erreur dans la construction du payload
- `user.userId` ou `user.username` est undefined

**Solution**: Vérifier la structure de `user` dans les logs

#### Scénario 4: Log "Sending request..." mais pas "Response received"

**Signification**: La requête est bloquée ou plante

**Causes possibles**:
- Erreur réseau (backend arrêté)
- CORS bloqué
- URL incorrecte
- Exception dans le `fetch()`

**Solution**: 
1. Vérifier l'onglet "Network" des DevTools
2. Chercher une requête à `/api/messages/reactions/add`
3. Si la requête est rouge: voir le statut et la réponse
4. Si pas de requête: le `fetch()` n'a pas été appelé (exception avant)

#### Scénario 5: Log "Response received" avec `ok: false`

**Signification**: Le backend a répondu avec une erreur (4xx ou 5xx)

**Log attendu**:
```
[useReactions] Response received {ok: false, status: 500}
[useReactions] Response not OK, keeping optimistic update {status: 500}
```

**Solution**: 
1. Vérifier les logs du backend
2. Vérifier que la migration a été appliquée
3. Vérifier que les colonnes `channel_id` et `reactions` existent

#### Scénario 6: Log "Response received" avec `ok: true` mais erreur après

**Signification**: Erreur lors du parsing de la réponse JSON

**Causes possibles**:
- Le backend ne retourne pas du JSON valide
- La structure de la réponse ne correspond pas à `ApiResponse<Message>`

**Solution**: 
1. Vérifier la réponse dans l'onglet "Network"
2. Vérifier que le backend retourne bien:
   ```json
   {
     "success": true,
     "data": {
       "id": "...",
       "reactions": [...]
     }
   }
   ```

## Cas Typiques

### Cas 1: User est null

**Logs**:
```
[useReactions] addReaction called {emoji: "👍", user: null, messageId: "msg-123"}
[useReactions] No user, cannot add reaction
```

**Solution**: L'utilisateur doit être connecté. Vérifier `AuthContext`.

### Cas 2: Backend arrêté

**Logs**:
```
[useReactions] addReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] Adding reaction... {emoji: "👍", userId: "user-123", username: "Alice"}
[useReactions] Sending request to backend {payload: {...}, url: "/api/messages/reactions/add"}
[useReactions] Error in addReaction TypeError: Failed to fetch
```

**Solution**: Démarrer le backend.

### Cas 3: Migration non appliquée

**Logs**:
```
[useReactions] addReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] Adding reaction... {emoji: "👍", userId: "user-123", username: "Alice"}
[useReactions] Sending request to backend {payload: {...}, url: "/api/messages/reactions/add"}
[useReactions] Response received {ok: false, status: 500}
[useReactions] Response not OK, keeping optimistic update {status: 500}
```

**Backend logs**:
```
ERROR: column "reactions" of relation "messages" does not exist
```

**Solution**: Appliquer la migration (redémarrer le backend).

### Cas 4: Tout fonctionne

**Logs**:
```
[useReactions] addReaction called {emoji: "👍", user: {...}, messageId: "msg-123"}
[useReactions] Adding reaction... {emoji: "👍", userId: "user-123", username: "Alice"}
[useReactions] Sending request to backend {payload: {...}, url: "/api/messages/reactions/add"}
[useReactions] Response received {ok: true, status: 200}
[useReactions] Reactions updated from backend {updatedReactions: [{emoji: "👍", count: 1, users: [...]}]}
```

**Network tab**: Requête POST à `/api/messages/reactions/add` avec statut 200

## Commandes Utiles

### Vérifier l'état de l'utilisateur dans la console

```javascript
// Ouvrir la console du navigateur et taper:
localStorage.getItem('userId')
localStorage.getItem('username')
```

### Forcer un log du contexte Auth

Ajouter temporairement dans `MessageWall.tsx`:
```typescript
console.log('[MessageWall] Auth context', { user, isAdmin });
```

### Vérifier que le backend répond

```bash
# Dans un terminal
curl -X POST http://localhost:8080/api/messages/reactions/add \
  -H "Content-Type: application/json" \
  -d '{"messageId":"test","userId":"user-1","username":"Test","emoji":"👍"}'
```

## Prochaines Étapes

1. ✅ Ouvrir la console du navigateur
2. ✅ Cliquer sur le bouton réaction
3. ✅ Analyser les logs selon les scénarios ci-dessus
4. ✅ Identifier où le code s'arrête
5. ✅ Appliquer la solution correspondante

## Retirer les Logs

Une fois le problème résolu, vous pouvez retirer les `console.log()` de `useReactions.ts` pour nettoyer le code.
