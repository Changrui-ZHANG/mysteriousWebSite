# Debug: Désérialisation Backend des Réactions

## Problème Identifié

Les logs frontend montrent que `msg.reactions` arrive vide (`Array(0)`) alors que la div debug montre qu'il y a des réactions en base de données.

**Log frontend**:
```
[MessageReactions] Rendering with reactions: {messageId: '1767815423118rq8cvvqam', reactions: Array(0)}
```

**Div debug** (visible après interaction):
```
Debug: [{"emoji":"❤️","count":1,"users":[...]}]
```

Cela indique un problème de désérialisation côté backend lors du chargement initial des messages.

## Logs Ajoutés

Des logs ont été ajoutés dans `Message.java` pour tracer la désérialisation:

```java
public List<MessageReaction> getReactions() {
    System.out.println("[Message.getReactions] Called for message " + this.id);
    System.out.println("[Message.getReactions] reactionsJson: " + this.reactionsJson);
    System.out.println("[Message.getReactions] reactions field: " + this.reactions);
    
    // ... désérialisation
    
    System.out.println("[Message.getReactions] Returning " + result.size() + " reactions");
    return result;
}
```

## Comment Déboguer

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

### Étape 3: Analyser les Logs Backend

Cherchez dans les logs du serveur:

#### Scénario 1: Pas de logs `[Message.getReactions]`

**Signification**: `getReactions()` n'est jamais appelé

**Cause possible**: 
- Les messages n'ont pas de réactions en base
- La requête `/api/messages` ne charge pas les messages
- Problème de mapping JPA

#### Scénario 2: Logs avec `reactionsJson: null`

```
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: null
[Message.getReactions] Returning 0 reactions
```

**Signification**: La colonne `reactions` est NULL en base

**Cause**: Migration pas appliquée OU réactions pas sauvegardées

#### Scénario 3: Logs avec `reactionsJson` vide

```
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: 
[Message.getReactions] Returning 0 reactions
```

**Signification**: La colonne `reactions` existe mais est vide

#### Scénario 4: Logs avec JSON mais erreur de parsing

```
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: [{"emoji":"👍",...}]
[Message.getReactions] JSON parsing error: Cannot deserialize...
[Message.getReactions] Returning 0 reactions
```

**Signification**: Problème de désérialisation JSON

**Cause**: Format JSON incompatible avec `MessageReaction.class`

#### Scénario 5: Logs avec désérialisation réussie

```
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: [{"emoji":"👍",...}]
[Message.getReactions] Deserialized reactions: 2
[Message.getReactions] Returning 2 reactions
```

**Signification**: Désérialisation OK côté backend

**Cause du problème**: Sérialisation JSON vers frontend

## Vérifications Complémentaires

### Vérifier la Base de Données

```sql
-- Voir les messages avec réactions
SELECT id, message, reactions 
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]' 
AND reactions != ''
LIMIT 5;

-- Vérifier le format JSON
SELECT id, 
       reactions,
       json_valid(reactions) as is_valid_json,
       json_array_length(reactions::json) as reaction_count
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]'
LIMIT 3;
```

### Tester l'Endpoint Directement

```bash
# Tester l'API des messages
curl -X GET http://localhost:8080/api/messages | jq '.[] | select(.reactions != null and (.reactions | length) > 0) | {id, message, reactions}'
```

### Vérifier le Callback @PostLoad

Le callback `@PostLoad` devrait être appelé automatiquement par JPA:

```java
@PostLoad
private void loadReactions() {
    System.out.println("[Message.@PostLoad] Loading reactions for " + this.id);
    // ...
}
```

Si ce log n'apparaît pas, JPA ne charge pas correctement les entités.

## Solutions Possibles

### Solution 1: Forcer le Callback

Si `@PostLoad` ne fonctionne pas, forcer l'appel dans `getReactions()`:

```java
public List<MessageReaction> getReactions() {
    if (reactions == null) {
        loadReactions(); // Forcer le chargement
    }
    return reactions != null ? reactions : new LinkedList<>();
}
```

### Solution 2: Vérifier le Mapping JPA

S'assurer que la colonne est correctement mappée:

```java
@Column(name = "reactions", columnDefinition = "TEXT")
private String reactionsJson;
```

### Solution 3: Debug de la Sérialisation JSON

Ajouter un log dans `MessageService.getAllMessages()`:

```java
public List<Message> getAllMessages() {
    List<Message> messages = messageRepository.findAllByOrderByTimestampAsc();
    
    // Debug: Vérifier la sérialisation JSON
    messages.forEach(msg -> {
        try {
            String json = new ObjectMapper().writeValueAsString(msg);
            System.out.println("[MessageService] Message JSON: " + json);
        } catch (Exception e) {
            System.out.println("[MessageService] JSON serialization error: " + e.getMessage());
        }
    });
    
    return profileIntegrationService.enrichMessagesWithProfiles(messages);
}
```

## Prochaines Étapes

1. ✅ Redémarrer le backend
2. ✅ Actualiser MessageWall
3. ✅ Analyser les logs `[Message.getReactions]`
4. ✅ Identifier le scénario correspondant
5. ✅ Appliquer la solution appropriée

## Résultat Attendu

Après correction, vous devriez voir:

**Logs backend**:
```
[Message.getReactions] Called for message msg-123
[Message.getReactions] reactionsJson: [{"emoji":"👍","count":1,"users":[...]}]
[Message.getReactions] Deserialized reactions: 1
[Message.getReactions] Returning 1 reactions
```

**Logs frontend**:
```
[MessageReactions] Rendering with reactions: {messageId: 'msg-123', reactions: Array(1)}
[MessageReactions] Active reactions: {activeReactions: Array(1)}
```

**Résultat visuel**: Les réactions s'affichent immédiatement ✅

## Date

2026-01-16