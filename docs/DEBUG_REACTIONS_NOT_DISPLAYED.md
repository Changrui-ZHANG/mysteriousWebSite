# Debug: Les Réactions Ne S'Affichent Pas Par Défaut

## Problème

Les réactions sont sauvegardées correctement (persistantes après actualisation), mais elles ne s'affichent pas automatiquement quand les messages sont chargés.

## Logs de Debug Ajoutés

Des logs ont été ajoutés pour tracer le flux des réactions:

### Backend (`MessageService.java`)
```java
// Dans getAllMessages()
System.out.println("[MessageService] Message " + msg.getId() + " has reactions: " + msg.getReactions().size());
```

### Frontend (`useMessages.ts`)
```typescript
// Quand les messages sont reçus du backend
console.log('[useMessages] Messages received from backend:', data);
data.forEach((msg, index) => {
    if (msg.reactions && msg.reactions.length > 0) {
        console.log(`[useMessages] Message ${index} has reactions:`, msg.reactions);
    }
});
```

### Frontend (`MessageItem.tsx`)
```jsx
// Affichage debug des réactions brutes
{msg.reactions && msg.reactions.length > 0 && (
    <div className="text-xs text-gray-500 mt-1">
        Debug: {JSON.stringify(msg.reactions)}
    </div>
)}
```

## Comment Déboguer

### Étape 1: Vérifier les Logs Backend

1. Ouvrir les logs du backend (console ou fichier)
2. Actualiser MessageWall (F5)
3. Chercher les logs `[MessageService]`

**Si vous voyez**:
```
[MessageService] Message msg-123 has reactions: 1
  - 👍 (1 users)
```
✅ Le backend charge correctement les réactions depuis la base de données

**Si vous ne voyez aucun log**:
❌ Aucune réaction en base de données OU problème de désérialisation

### Étape 2: Vérifier les Logs Frontend

1. Ouvrir la console du navigateur (F12)
2. Actualiser MessageWall (F5)
3. Chercher les logs `[useMessages]`

**Si vous voyez**:
```
[useMessages] Messages received from backend: [{id: "msg-123", reactions: [{emoji: "👍", count: 1, users: [...]}]}, ...]
[useMessages] Message 0 has reactions: [{emoji: "👍", count: 1, users: [...]}]
```
✅ Le frontend reçoit correctement les réactions du backend

**Si vous voyez**:
```
[useMessages] Messages received from backend: [{id: "msg-123", reactions: []}, ...]
```
❌ Le backend n'envoie pas les réactions OU elles sont vides

### Étape 3: Vérifier l'Affichage Debug

1. Regarder sous les messages dans MessageWall
2. Chercher les lignes "Debug: [...]"

**Si vous voyez**:
```
Debug: [{"emoji":"👍","count":1,"users":[{"userId":"user-123","username":"Alice","reactedAt":"2026-01-16T..."}]}]
```
✅ Les réactions arrivent jusqu'au composant `MessageItem`

**Si vous ne voyez aucune ligne debug**:
❌ Les réactions n'arrivent pas jusqu'au composant

### Étape 4: Vérifier MessageReactions

Si les réactions arrivent jusqu'à `MessageItem` mais ne s'affichent pas:

1. Ouvrir la console
2. Chercher des erreurs dans `MessageReactions` ou `useReactions`
3. Vérifier que `initialReactions` n'est pas vide

## Scénarios de Debug

### Scénario 1: Pas de réactions en base

**Logs backend**: Aucun log `[MessageService]`

**Cause**: Les réactions ne sont pas sauvegardées en base de données

**Solution**: 
1. Vérifier que la migration a été appliquée
2. Vérifier que les colonnes `reactions` existent
3. Ajouter une réaction et vérifier qu'elle est sauvegardée

### Scénario 2: Réactions en base mais pas désérialisées

**Logs backend**: Aucun log `[MessageService]` MAIS la base contient des réactions

**Cause**: Problème de désérialisation JSON dans `Message.java`

**Solution**: 
1. Vérifier le callback `@PostLoad`
2. Vérifier que `reactionsJson` n'est pas null
3. Vérifier le format JSON en base

### Scénario 3: Backend OK mais frontend ne reçoit pas

**Logs backend**: ✅ Messages avec réactions
**Logs frontend**: ❌ Pas de réactions dans les messages reçus

**Cause**: Problème de sérialisation JSON côté backend

**Solution**: 
1. Vérifier que `getReactions()` retourne les bonnes données
2. Vérifier la sérialisation Jackson
3. Tester l'endpoint directement avec curl

### Scénario 4: Frontend reçoit mais n'affiche pas

**Logs backend**: ✅ Messages avec réactions
**Logs frontend**: ✅ Messages avec réactions reçus
**Debug MessageItem**: ❌ Pas de ligne debug

**Cause**: Problème dans le passage des props à `MessageReactions`

**Solution**: 
1. Vérifier que `msg.reactions` n'est pas undefined
2. Vérifier que `MessageReactions` reçoit `initialReactions`
3. Vérifier les logs dans `useReactions`

### Scénario 5: Tout arrive mais MessageReactions ne s'affiche pas

**Logs backend**: ✅ Messages avec réactions
**Logs frontend**: ✅ Messages avec réactions reçus
**Debug MessageItem**: ✅ Ligne debug visible

**Cause**: Problème dans `MessageReactions` ou `useReactions`

**Solution**: 
1. Vérifier les logs `[useReactions]` dans la console
2. Vérifier que `activeReactions.length > 0`
3. Vérifier le CSS de `MessageReactions`

## Commandes de Vérification

### Vérifier la base de données

```sql
-- Voir les messages avec réactions
SELECT id, message, reactions 
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]' 
AND reactions != ''
LIMIT 10;

-- Voir le contenu JSON des réactions
SELECT id, message, 
       reactions,
       json_array_length(reactions::json) as reaction_count
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]'
LIMIT 5;
```

### Tester l'endpoint directement

```bash
# Tester l'endpoint des messages
curl -X GET http://localhost:8080/api/messages \
  -H "Accept: application/json" | jq '.[] | select(.reactions != null and (.reactions | length) > 0)'
```

### Vérifier les logs backend

```bash
# Docker
docker-compose logs -f server | grep -E "\[MessageService\]|reactions"

# Local
# Chercher dans les logs du serveur
```

## Prochaines Étapes

1. ✅ Ajouter une réaction à un message
2. ✅ Actualiser la page (F5)
3. ✅ Vérifier les logs backend dans la console serveur
4. ✅ Vérifier les logs frontend dans la console navigateur
5. ✅ Vérifier l'affichage debug sous les messages
6. ✅ Identifier à quelle étape les réactions se perdent
7. ✅ Appliquer la solution correspondante

## Retirer les Logs

Une fois le problème résolu, retirer les logs de debug:
- `MessageService.java` - Retirer les `System.out.println`
- `useMessages.ts` - Retirer les `console.log`
- `MessageItem.tsx` - Retirer la div debug

## Date

2026-01-16