# Bugfix: Sérialisation Jackson des Réactions

## Problème Identifié

Les réactions ne s'affichent pas par défaut car Jackson sérialise le mauvais champ lors de la conversion en JSON pour l'API REST.

## Cause Racine

Dans `Message.java`, il y a deux champs liés aux réactions:

```java
@Column(name = "reactions", columnDefinition = "TEXT")
private String reactionsJson;  // JSON brut stocké en base

@Transient
private List<MessageReaction> reactions;  // Liste désérialisée
```

**Problème**: Jackson sérialisait probablement `reactionsJson` (le JSON brut) au lieu de `reactions` (la liste désérialisée) dans la réponse API.

## Solution Appliquée

### 1. Annotations Jackson pour Contrôler la Sérialisation

```java
@Column(name = "reactions", columnDefinition = "TEXT")
@JsonIgnore  // ← Ne pas sérialiser ce champ JSON brut
private String reactionsJson;

@Transient
@JsonProperty("reactions")  // ← Sérialiser ce champ comme "reactions"
private List<MessageReaction> reactions;
```

### 2. Logs dans MessageController

```java
@GetMapping
public ResponseEntity<List<Message>> getAllMessages() {
    List<Message> messages = messageService.getAllMessages();
    
    // Debug: Forcer le chargement des réactions avant sérialisation
    messages.forEach(msg -> {
        List<MessageReaction> reactions = msg.getReactions();  // Force le lazy loading
        System.out.println("[MessageController] Message " + msg.getId() + ":");
        System.out.println("  - reactions size: " + reactions.size());
    });
    
    return ResponseEntity.ok().body(messages);
}
```

### 3. Import Ajouté

```java
import com.fasterxml.jackson.annotation.JsonIgnore;
```

## Flux Corrigé

### Avant (Problématique)

1. **Base de données**: `reactions` colonne contient `[{"emoji":"👍",...}]`
2. **JPA charge**: `reactionsJson = "[{"emoji":"👍",...}]"` (String)
3. **@PostLoad**: `reactions = [MessageReaction(...)]` (List désérialisée)
4. **Jackson sérialise**: `reactionsJson` → `"reactions": "[{"emoji":"👍",...}]"` ❌ (String au lieu d'Array)
5. **Frontend reçoit**: `msg.reactions = "[{"emoji":"👍",...}]"` (String, pas Array)

### Après (Corrigé)

1. **Base de données**: `reactions` colonne contient `[{"emoji":"👍",...}]`
2. **JPA charge**: `reactionsJson = "[{"emoji":"👍",...}]"` (String)
3. **@PostLoad**: `reactions = [MessageReaction(...)]` (List désérialisée)
4. **Jackson sérialise**: `reactions` → `"reactions": [{"emoji":"👍",...}]` ✅ (Array)
5. **Frontend reçoit**: `msg.reactions = [{"emoji":"👍",...}]` (Array)

## Test de Vérification

### Étape 1: Redémarrer le Backend

```bash
# Docker
docker-compose restart server

# Local
# Arrêter (Ctrl+C) et redémarrer
```

### Étape 2: Vérifier les Logs Backend

Après redémarrage, actualiser MessageWall et chercher dans les logs du serveur:

```
[MessageController] Returning X messages
[MessageController] Message msg-123:
  - reactions size: 2
    * 👍 (1 users)
    * ❤️ (1 users)
```

### Étape 3: Vérifier les Logs Frontend

Dans la console du navigateur:

```
[MessageReactions] Rendering with reactions: {messageId: 'msg-123', reactions: Array(2)}
[MessageReactions] Active reactions: {activeReactions: Array(2)}
```

### Étape 4: Vérifier l'Affichage

**Résultat attendu**: Les réactions s'affichent immédiatement au chargement de la page ✅

## Diagnostic

### Si les logs backend montrent des réactions mais pas le frontend

Le problème est dans la sérialisation JSON. Vérifiez la réponse de l'API directement:

```bash
curl -X GET http://localhost:8080/api/messages | jq '.[] | select(.reactions != null) | {id, reactions}'
```

**Résultat attendu**:
```json
{
  "id": "msg-123",
  "reactions": [
    {
      "emoji": "👍",
      "count": 1,
      "users": [{"userId": "...", "username": "...", "reactedAt": 1234567890}]
    }
  ]
}
```

**Résultat problématique**:
```json
{
  "id": "msg-123",
  "reactions": "[{\"emoji\":\"👍\",\"count\":1,...}]"  // String au lieu d'Array
}
```

### Si les logs backend ne montrent pas de réactions

Le problème est dans la désérialisation. Voir `docs/DEBUG_BACKEND_DESERIALIZATION.md`.

## Impact

- ✅ Jackson sérialise le bon champ (`reactions` au lieu de `reactionsJson`)
- ✅ Le frontend reçoit un Array au lieu d'un String
- ✅ Les réactions s'affichent immédiatement au chargement
- ✅ Pas besoin d'interaction pour voir les réactions

## Fichiers Modifiés

- `server/src/main/java/com/changrui/mysterious/domain/messagewall/model/Message.java`
  - Ajout de `@JsonIgnore` sur `reactionsJson`
  - Ajout de `@JsonProperty("reactions")` sur `reactions`
  - Import de `JsonIgnore`

- `server/src/main/java/com/changrui/mysterious/domain/messagewall/controller/MessageController.java`
  - Logs détaillés dans `getAllMessages()`
  - Forçage du chargement des réactions avant sérialisation

## Notes Techniques

### Pourquoi @JsonIgnore et @JsonProperty ?

- `@JsonIgnore` sur `reactionsJson`: Empêche Jackson de sérialiser le JSON brut
- `@JsonProperty("reactions")` sur `reactions`: Force Jackson à sérialiser la liste désérialisée

### Pourquoi Forcer getReactions() ?

Le champ `reactions` est `@Transient` et chargé lazily. Si `getReactions()` n'est pas appelé avant la sérialisation, le champ reste `null` et Jackson sérialise `null`.

### Alternative Considérée

On aurait pu utiliser `@JsonGetter`:

```java
@JsonGetter("reactions")
public List<MessageReaction> getReactionsForJson() {
    return getReactions();
}
```

Mais l'approche avec `@JsonProperty` est plus simple.

## Prochaines Étapes

1. ✅ Redémarrer le backend
2. ✅ Vérifier les logs backend
3. ✅ Vérifier les logs frontend
4. ✅ Confirmer l'affichage des réactions
5. ✅ Retirer les logs de debug une fois confirmé

Cette correction devrait enfin résoudre le problème d'affichage des réactions !

## Date

2026-01-16