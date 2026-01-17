# Vérification: Migration Base de Données

## Problème Confirmé

Les logs backend montrent `reactionsJson = null` pour tous les messages, même ceux qui ont des réactions. Cela signifie que **la colonne `reactions` n'existe pas en base de données**.

## Vérifications à Effectuer

### 1. Vérifier que les Colonnes Existent

Connectez-vous à PostgreSQL et exécutez :

```sql
-- Vérifier la structure de la table messages
\d messages

-- Ou avec une requête SQL
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;
```

**Résultat attendu** : Vous devriez voir les colonnes `channel_id` et `reactions`

**Si vous ne les voyez pas** : La migration n'a pas été appliquée

### 2. Vérifier l'Historique Liquibase

```sql
-- Vérifier que la migration a été enregistrée
SELECT id, author, filename, dateexecuted, orderexecuted 
FROM databasechangelog 
WHERE id = '027-add-channels-and-reactions-to-messages';
```

**Si aucun résultat** : La migration n'a jamais été exécutée

### 3. Vérifier les Logs du Backend au Démarrage

Cherchez dans les logs du serveur au démarrage :

```
Liquibase: Successfully applied changeset: 027-add-channels-and-reactions-to-messages
```

**Si vous ne voyez pas ce message** : Liquibase n'a pas appliqué la migration

## Solutions

### Solution 1: Redémarrer le Backend (Si Pas Encore Fait)

```bash
# Docker
docker-compose restart server

# Local
# Arrêter (Ctrl+C) et redémarrer le serveur Spring Boot
```

### Solution 2: Vérifier les Fichiers de Migration

Vérifiez que ces fichiers existent :

1. **`server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`**
2. **Référence dans `server/src/main/resources/db/changelog/db.changelog-master.xml`**

### Solution 3: Appliquer Manuellement la Migration

Si Liquibase ne fonctionne pas, appliquez manuellement :

```sql
-- Ajouter les colonnes manuellement
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS channel_id VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS reactions TEXT;

-- Vérifier que ça a fonctionné
\d messages

-- Enregistrer dans l'historique Liquibase pour éviter les conflits
INSERT INTO databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id)
VALUES ('027-add-channels-and-reactions-to-messages', 'changrui', 'db/changelog/changes/005-add-channels-and-reactions.xml', NOW(), 
        (SELECT COALESCE(MAX(orderexecuted), 0) + 1 FROM databasechangelog), 
        'EXECUTED', '8:manual', 'addColumn tableName=messages', 'Ajout des champs channel_id et reactions aux messages', NULL, '4.20.0', NULL, NULL, 
        EXTRACT(EPOCH FROM NOW())::TEXT);
```

### Solution 4: Vérifier la Configuration Liquibase

Si la migration ne s'applique toujours pas, vérifiez la configuration Liquibase dans `application.properties` ou `application.yml`.

## Test Après Correction

### 1. Vérifier les Colonnes

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('channel_id', 'reactions');
```

**Résultat attendu** :
```
 column_name 
-------------
 channel_id
 reactions
```

### 2. Ajouter une Réaction de Test

1. Ouvrir MessageWall
2. Ajouter une réaction à un message
3. Vérifier en base de données :

```sql
SELECT id, message, reactions 
FROM messages 
WHERE reactions IS NOT NULL 
AND reactions != '[]'
LIMIT 5;
```

**Résultat attendu** : La colonne `reactions` contient du JSON

### 3. Redémarrer le Backend et Tester

1. Redémarrer le backend
2. Actualiser MessageWall (F5)
3. Vérifier les logs backend :

```
[Message.getReactions] reactionsJson: [{"emoji":"👍",...}]
[MessageController] Message xxx: reactions size: 1
```

4. Vérifier que les réactions s'affichent immédiatement

## Commandes Utiles

### Se Connecter à PostgreSQL

```bash
# Docker
docker-compose exec postgres psql -U mysterious -d mysterious

# Local
psql -U mysterious -d mysterious
```

### Voir les Tables

```sql
\dt
```

### Voir la Structure d'une Table

```sql
\d messages
```

### Voir l'Historique Liquibase

```sql
SELECT * FROM databasechangelog ORDER BY dateexecuted DESC LIMIT 10;
```

## Diagnostic Rapide

Exécutez cette requête pour un diagnostic complet :

```sql
-- Diagnostic complet
SELECT 
    'Table exists' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
         THEN 'OK' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'Column channel_id exists',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'channel_id') 
         THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 
    'Column reactions exists',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reactions') 
         THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 
    'Migration recorded',
    CASE WHEN EXISTS (SELECT 1 FROM databasechangelog WHERE id = '027-add-channels-and-reactions-to-messages') 
         THEN 'OK' ELSE 'MISSING' END;
```

**Résultat attendu** : Tous les statuts doivent être 'OK'

## Prochaines Étapes

1. ✅ Exécuter le diagnostic SQL ci-dessus
2. ✅ Si des colonnes manquent, appliquer la Solution 3 (migration manuelle)
3. ✅ Redémarrer le backend
4. ✅ Tester l'ajout de réaction
5. ✅ Vérifier que les réactions s'affichent par défaut

Une fois les colonnes créées, le problème devrait être résolu !

## Date

2026-01-16