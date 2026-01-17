# Fix: Les Réactions Disparaissent Après Actualisation

## Problème

Les emojis de réaction s'affichent correctement quand on les ajoute, mais disparaissent après actualisation de la page (F5).

## Cause

La migration de base de données n'a pas été appliquée. Les colonnes `channel_id` et `reactions` n'existent pas dans la table `messages`, donc les réactions ne peuvent pas être sauvegardées.

## Solution Rapide

### Étape 1: Redémarrer le Backend

**Si vous utilisez Docker Compose:**
```bash
docker-compose restart server
```

**Si vous exécutez le backend localement:**
1. Arrêter le serveur (Ctrl+C dans le terminal)
2. Redémarrer avec votre commande habituelle:
   ```bash
   cd server
   mvn spring-boot:run
   ```

### Étape 2: Vérifier les Logs

Cherchez dans les logs du backend cette ligne:
```
Liquibase: Successfully applied changeset: 027-add-channels-and-reactions-to-messages
```

**Si vous voyez cette ligne** ✅ → La migration a été appliquée, passez à l'étape 3

**Si vous ne voyez pas cette ligne** ❌ → Voir "Dépannage" ci-dessous

### Étape 3: Tester

1. Ouvrir MessageWall dans le navigateur
2. Ajouter une réaction à un message (cliquer sur 😊, choisir un emoji)
3. Actualiser la page (F5)
4. **Résultat attendu**: L'emoji est toujours là ✅

## Dépannage

### Si la migration ne s'applique pas automatiquement

1. **Vérifier que les fichiers existent:**
   - `server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`
   - Doit être référencé dans `server/src/main/resources/db/changelog/db.changelog-master.xml`

2. **Vérifier les logs d'erreur:**
   - Chercher "Liquibase" dans les logs
   - Chercher "ERROR" ou "WARN" près des lignes Liquibase

3. **Appliquer manuellement (si nécessaire):**

   Connectez-vous à PostgreSQL:
   ```bash
   # Docker
   docker-compose exec postgres psql -U mysterious -d mysterious
   
   # Local
   psql -U mysterious -d mysterious
   ```

   Exécutez:
   ```sql
   -- Vérifier si les colonnes existent déjà
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'messages' 
   AND column_name IN ('channel_id', 'reactions');
   
   -- Si elles n'existent pas, les créer
   ALTER TABLE messages 
   ADD COLUMN IF NOT EXISTS channel_id VARCHAR(50) DEFAULT 'general',
   ADD COLUMN IF NOT EXISTS reactions TEXT;
   
   -- Vérifier que ça a fonctionné
   \d messages
   ```

   Vous devriez voir:
   ```
   channel_id  | character varying(50) | | default 'general'::character varying
   reactions   | text                  | |
   ```

### Si les colonnes existent mais les réactions ne persistent pas

1. **Vérifier les logs backend lors de l'ajout de réaction:**
   - Chercher "addReaction" ou "MessageService"
   - Chercher des erreurs SQL

2. **Vérifier en base de données:**
   ```sql
   -- Ajouter une réaction via l'UI, puis exécuter:
   SELECT id, message, reactions 
   FROM messages 
   WHERE reactions IS NOT NULL 
   ORDER BY timestamp DESC 
   LIMIT 5;
   ```
   
   La colonne `reactions` devrait contenir du JSON comme:
   ```json
   [{"emoji":"👍","count":1,"users":[{"userId":"user-123","username":"Alice","reactedAt":1737000000000}]}]
   ```

3. **Si `reactions` est toujours NULL:**
   - Le backend ne sauvegarde pas correctement
   - Vérifier que `MessageService.addReaction()` appelle bien `messageRepository.save(message)`
   - Vérifier les logs pour des erreurs de sérialisation JSON

## Vérification Complète

Pour vérifier que tout fonctionne:

```sql
-- 1. Vérifier la structure de la table
\d messages

-- 2. Vérifier l'historique Liquibase
SELECT id, author, filename, dateexecuted 
FROM databasechangelog 
WHERE id = '027-add-channels-and-reactions-to-messages';

-- 3. Vérifier les données
SELECT id, message, channel_id, reactions 
FROM messages 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Commandes Docker Utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f server

# Redémarrer juste le backend
docker-compose restart server

# Redémarrer tout
docker-compose restart

# Se connecter à PostgreSQL
docker-compose exec postgres psql -U mysterious -d mysterious

# Voir les processus
docker-compose ps
```

## Résumé

1. ✅ Redémarrer le backend pour appliquer la migration
2. ✅ Vérifier les logs Liquibase
3. ✅ Tester l'ajout de réaction + actualisation
4. ✅ Si problème: vérifier en base de données
5. ✅ Si nécessaire: appliquer manuellement

**La cause la plus probable est simplement que le backend n'a pas été redémarré après la création de la migration.**

## Besoin d'Aide?

Si le problème persiste:
1. Partagez les logs du backend au démarrage
2. Partagez le résultat de `\d messages` dans PostgreSQL
3. Partagez le résultat de la requête sur `databasechangelog`
