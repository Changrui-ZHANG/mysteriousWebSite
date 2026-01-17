# Vérification de la Migration des Réactions

## Problème

Les emojis disparaissent après actualisation de la page, ce qui signifie qu'ils ne sont pas persistés en base de données.

## Cause Probable

La migration Liquibase n'a pas été appliquée. Les colonnes `channel_id` et `reactions` n'existent pas dans la table `messages`.

## Vérification

### 1. Vérifier que le backend a été redémarré

Le backend doit être redémarré pour que Liquibase applique la migration.

**Si vous utilisez Docker:**
```bash
docker-compose restart server
```

**Si vous exécutez localement:**
- Arrêter le backend (Ctrl+C)
- Redémarrer avec `mvn spring-boot:run` ou votre commande habituelle

### 2. Vérifier les logs du backend

Chercher dans les logs du backend au démarrage:

**Succès:**
```
Liquibase: Successfully applied changeset: 027-add-channels-and-reactions-to-messages
```

**Échec:**
```
Liquibase: Error applying changeset...
```

### 3. Vérifier la base de données

Connectez-vous à PostgreSQL et exécutez:

```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('channel_id', 'reactions');
```

**Résultat attendu:**
```
 column_name | data_type | is_nullable | column_default 
-------------+-----------+-------------+----------------
 channel_id  | varchar   | YES         | 'general'
 reactions   | text      | YES         | NULL
```

**Si les colonnes n'existent pas**, la migration n'a pas été appliquée.

### 4. Vérifier l'historique Liquibase

```sql
-- Vérifier que la migration a été enregistrée
SELECT id, author, filename, dateexecuted, orderexecuted 
FROM databasechangelog 
WHERE id = '027-add-channels-and-reactions-to-messages';
```

**Si aucun résultat**, la migration n'a jamais été exécutée.

## Solutions

### Solution 1: Redémarrer le backend

Si vous n'avez pas redémarré le backend après avoir créé la migration:

```bash
# Docker
docker-compose restart server

# Local
# Arrêter (Ctrl+C) puis redémarrer
mvn spring-boot:run
```

### Solution 2: Forcer l'application de la migration

Si le backend a été redémarré mais la migration n'a pas été appliquée:

1. Vérifier que le fichier existe:
   - `server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`

2. Vérifier qu'il est référencé dans le master:
   - `server/src/main/resources/db/changelog/db.changelog-master.xml`
   - Doit contenir: `<include file="db/changelog/changes/005-add-channels-and-reactions.xml"/>`

3. Vérifier les logs d'erreur Liquibase au démarrage

### Solution 3: Appliquer manuellement (dernier recours)

Si Liquibase ne fonctionne pas, vous pouvez appliquer manuellement:

```sql
-- Ajouter les colonnes manuellement
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS channel_id VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS reactions TEXT;

-- Enregistrer dans l'historique Liquibase
INSERT INTO databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id)
VALUES ('027-add-channels-and-reactions-to-messages', 'changrui', 'db/changelog/changes/005-add-channels-and-reactions.xml', NOW(), 
        (SELECT COALESCE(MAX(orderexecuted), 0) + 1 FROM databasechangelog), 
        'EXECUTED', '8:manual', 'addColumn tableName=messages', 'Ajout des champs channel_id et reactions aux messages', NULL, '4.20.0', NULL, NULL, 
        EXTRACT(EPOCH FROM NOW())::TEXT);
```

## Test Après Correction

1. **Ajouter une réaction:**
   - Ouvrir MessageWall
   - Cliquer sur le bouton réaction (😊)
   - Sélectionner un emoji (ex: 👍)
   - Vérifier que l'emoji s'affiche

2. **Actualiser la page:**
   - Appuyer sur F5 ou Ctrl+R
   - **Résultat attendu**: L'emoji est toujours là ✅

3. **Vérifier en base de données:**
   ```sql
   SELECT id, message, reactions 
   FROM messages 
   WHERE reactions IS NOT NULL 
   LIMIT 5;
   ```
   
   **Résultat attendu**: La colonne `reactions` contient du JSON:
   ```json
   [{"emoji":"👍","count":1,"users":[{"userId":"user-123","username":"Alice","reactedAt":1737000000000}]}]
   ```

## Commandes Utiles

### Docker

```bash
# Voir les logs du backend
docker-compose logs -f server

# Redémarrer le backend
docker-compose restart server

# Se connecter à PostgreSQL
docker-compose exec postgres psql -U mysterious -d mysterious
```

### PostgreSQL

```bash
# Se connecter localement
psql -U mysterious -d mysterious

# Lister les colonnes de la table messages
\d messages

# Voir l'historique Liquibase
SELECT * FROM databasechangelog ORDER BY dateexecuted DESC LIMIT 10;
```

## Fichiers Concernés

- Migration: `server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`
- Master: `server/src/main/resources/db/changelog/db.changelog-master.xml`
- Entity: `server/src/main/java/com/changrui/mysterious/domain/messagewall/model/Message.java`
- Service: `server/src/main/java/com/changrui/mysterious/domain/messagewall/service/MessageService.java`

## Prochaines Étapes

1. ✅ Vérifier que le backend a été redémarré
2. ✅ Vérifier les logs Liquibase
3. ✅ Vérifier que les colonnes existent en base
4. ✅ Tester l'ajout de réaction
5. ✅ Actualiser et vérifier la persistance

Si le problème persiste après ces vérifications, partagez les logs du backend au démarrage.
