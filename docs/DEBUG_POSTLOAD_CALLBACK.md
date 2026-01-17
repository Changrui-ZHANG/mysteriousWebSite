# Debug: Callback @PostLoad JPA

## Problème Identifié

Les réactions existent en base de données, mais ne s'affichent que quand on interagit avec un message spécifique. Cela suggère que le callback `@PostLoad` de JPA ne se déclenche pas lors du chargement initial des messages via `findAll()`.

## Cause Probable

Le callback `@PostLoad` n'est pas toujours appelé lors des requêtes `findAll()` ou `findAllByOrderByTimestampAsc()`. Il peut ne se déclencher que lors du chargement d'entités individuelles.

## Corrections Appliquées

### 1. Amélioration de `getReactions()`

```java
public List<MessageReaction> getReactions() {
    // Toujours vérifier et désérialiser si nécessaire
    if (reactions == null && reactionsJson != null && !reactionsJson.isEmpty() && !reactionsJson.equals("[]")) {
        try {
            reactions = objectMapper.readValue(reactionsJson,
                    objectMapper.getTypeFactory().constructCollectionType(LinkedList.class, MessageReaction.class));
        } catch (JsonProcessingException e) {
            reactions = new LinkedList<>();
        }
    } else if (reactions == null) {
        reactions = new LinkedList<>();
    }
    
    return reactions != null ? reactions : new LinkedList<>();
}
```

**Changements**:
- Vérification plus robuste de `reactionsJson`
- Exclusion explicite de `"[]"` (tableau vide)
- Initialisation systématique si `reactions == null`

### 2. Suppression du Callback @PostLoad

Le callback `@PostLoad` a été supprimé car il n'était pas fiable. Toute la logique de désérialisation est maintenant dans `getReactions()`.

### 3. Ajout d'un Getter pour Debug

```java
public String getReactionsJson() {
    return reactionsJson;
}
```

Permet de voir la valeur brute chargée depuis la base de données.

### 4. Logs Détaillés

**Dans `Message.getReactions()`**:
```java
System.out.println("[Message.getReactions] reactionsJson: " + this.reactionsJson);
System.out.println("[Message.getReactions] Deserializing JSON: " + reactionsJson);
```

**Dans `MessageController.getAllMessages()`**:
```java
System.out.println("  - reactionsJson from DB: '" + msg.getReactionsJson() + "'");
System.out.println("  - reactions size: " + reactions.size());
```

## Test de Vérification

### Étape 1: Redémarrer le Backend

```bash
# Docker
docker-compose restart server

# Local
# Arrêter (Ctrl+C) et redémarrer
```

### Étape 2: Actualiser MessageWall

1. Ouvrir MessageWall dans le navigateur
2. Actualiser la page (F5)
3. Regarder les logs du serveur

### Étape 3: Analyser les Logs

Cherchez dans les logs du serveur:

#### Scénario 1: reactionsJson chargé correctement

```
[MessageController] Message msg-123:
  - reactionsJson from DB: '[{"emoji":"👍","count":1,"users":[...]}]'
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: [{"emoji":"👍","count":1,"users":[...]}]
[Message.getReactions] Deserializing JSON: [{"emoji":"👍","count":1,"users":[...]}]
[Message.getReactions] Deserialized reactions: 1
[Message.getReactions] Returning 1 reactions
[MessageController] - reactions size: 1
    * 👍 (1 users)
```

**Résultat attendu**: Les réactions s'affichent immédiatement ✅

#### Scénario 2: reactionsJson vide ou null

```
[MessageController] Message msg-123:
  - reactionsJson from DB: 'null'
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: null
[Message.getReactions] No reactions to deserialize, creating empty list
[Message.getReactions] Returning 0 reactions
[MessageController] - reactions size: 0
```

**Signification**: La colonne `reactions` est NULL en base → Migration pas appliquée

#### Scénario 3: reactionsJson avec contenu mais erreur de parsing

```
[MessageController] Message msg-123:
  - reactionsJson from DB: '[{"emoji":"👍",...}]'
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: [{"emoji":"👍",...}]
[Message.getReactions] Deserializing JSON: [{"emoji":"👍",...}]
[Message.getReactions] JSON parsing error: Cannot deserialize...
[Message.getReactions] Returning 0 reactions
```

**Signification**: Problème de format JSON ou de classe `MessageReaction`

## Vérifications Complémentaires

### Vérifier les Données en Base

```sql
-- Voir les messages avec réactions
SELECT id, message, reactions 
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]' 
AND reactions != ''
LIMIT 5;
```

### Vérifier le Format JSON

```sql
-- Vérifier que le JSON est valide
SELECT id, 
       reactions,
       json_valid(reactions) as is_valid_json,
       json_array_length(reactions::json) as reaction_count
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]'
LIMIT 3;
```

## Solutions Selon le Scénario

### Si Scénario 2 (reactionsJson null)

La migration n'a pas été appliquée. Voir `docs/VERIFY_DATABASE_MIGRATION.md`.

### Si Scénario 3 (erreur de parsing)

Problème de format JSON. Vérifiez:
1. La classe `MessageReaction` correspond au JSON
2. Le JSON en base est valide
3. Les imports Jackson sont corrects

### Si Scénario 1 mais pas d'affichage frontend

Le problème est dans la sérialisation Jackson. Vérifiez les annotations `@JsonIgnore` et `@JsonProperty`.

## Résultat Attendu

Après correction, vous devriez voir:

**Logs backend**:
```
[MessageController] Message msg-123: reactions size: 2
    * 👍 (1 users)
    * ❤️ (1 users)
```

**Logs frontend**:
```
[MessageReactions] Rendering with reactions: {reactions: Array(2)}
```

**Résultat visuel**: Les réactions s'affichent immédiatement au chargement ✅

## Date

2026-01-16