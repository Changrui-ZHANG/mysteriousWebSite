# Backend Coding Standards

Ce document définit les règles de codage et l'architecture du backend Spring Boot. Tout nouveau code doit respecter ces standards pour garantir la lisibilité, la maintenabilité et la cohérence du projet.

---

## Architecture par Domaine (Domain-Driven Design)

### Structure des packages

```
com.changrui.mysterious/
├── MysteriousApplication.java      # Point d'entrée
│
├── shared/                         # Éléments partagés cross-domain
│   ├── config/                     # Configuration globale (CORS, etc.)
│   ├── dto/                        # DTOs partagés (ApiResponse)
│   └── exception/                  # Exceptions et handlers globaux
│
└── domain/                         # Domaines métier
    └── {nom-domaine}/              # Un dossier par domaine métier
```

### Domaines actuels

| Domaine | Description |
|---------|-------------|
| `user` | Authentification, préférences, gestion utilisateurs |
| `game` | Scores, statuts jeux, génération maps |
| `vocabulary` | Vocabulaire et favoris |
| `messagewall` | Messages et suggestions |
| `onlinecount` | Compteur utilisateurs en ligne |
| `calendar` | Configuration calendrier scolaire |
| `settings` | Paramètres système et status API |

### Structure d'un domaine

Chaque domaine suit cette organisation :

```
domain/{nom-domaine}/
├── controller/          # Endpoints REST (couche présentation)
├── service/             # Logique métier
├── repository/          # Accès données (Spring Data JPA)
├── model/               # Entités JPA
└── dto/                 # Data Transfer Objects du domaine
```

### Règles d'architecture

1. **Isolation des domaines** : Un domaine ne doit pas importer directement les classes d'un autre domaine, sauf via `shared/`
2. **Dépendances autorisées** :
   - `controller` → `service`, `dto`, `model`, `shared`
   - `service` → `repository`, `model`, `dto`, `shared`
   - `repository` → `model`
3. **Exception** : Le domaine `user` (AdminService) peut être utilisé par d'autres domaines pour la validation admin

---

## Conventions de Nommage

### Classes

| Type | Convention | Exemple |
|------|------------|---------|
| Controller | `{Nom}Controller` | `ScoreController` |
| Service | `{Nom}Service` | `ScoreService` |
| Repository | `{Nom}Repository` | `ScoreRepository` |
| Entity | Nom métier singulier | `Score`, `AppUser` |
| DTO | `{Nom}DTO` | `ScoreSubmissionDTO` |
| Exception | `{Nom}Exception` | `ValidationException` |

### Méthodes

```java
// Controllers - verbes HTTP implicites
getTopScores()          // GET
submitScore()           // POST
updateStatus()          // PUT
deleteScore()           // DELETE

// Services - verbes d'action explicites
findById()
findAll()
save()
delete()
calculateScore()
validateInput()

// Repository - conventions Spring Data
findByUserId()
findAllByOrderByTimestampDesc()
existsById()
```

### Variables

```java
// camelCase pour les variables
String userId;
List<Score> topScores;
boolean isEnabled;

// Constantes en SCREAMING_SNAKE_CASE
private static final int MAX_RESULTS = 50;
private static final String DEFAULT_LANGUAGE = "fr";
```

---

## Style de Code

### Formatage

```java
// Indentation : 4 espaces (pas de tabs)
// Longueur max ligne : 120 caractères
// Accolades : style K&R (ouvrante sur même ligne)

public class ExampleController {

    @Autowired
    private ExampleService exampleService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Example>> getById(@PathVariable String id) {
        Example result = exampleService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
```

### Imports

```java
// Ordre des imports :
// 1. java.*
// 2. jakarta.*
// 3. org.springframework.*
// 4. com.changrui.mysterious.*
// 5. Imports statiques en dernier

// Éviter les imports wildcard (*)
import java.util.List;           // ✓ Correct
import java.util.*;              // ✗ Éviter
```

### Espacement

```java
// Ligne vide entre les sections logiques
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping("/top/{gameType}")
    public ResponseEntity<ApiResponse<List<Score>>> getTopScores(
            @PathVariable String gameType) {
        // ...
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitScore(
            @Valid @RequestBody ScoreSubmissionDTO dto) {
        // ...
    }
}
```

---

## Documentation

### Javadoc obligatoire pour

1. **Classes publiques** : Description du rôle
2. **Méthodes de service** : Description, @param, @return, @throws
3. **Entités** : Description de la table mappée

```java
/**
 * Service for managing game scores.
 * Handles score submission, retrieval, and leaderboard logic.
 */
@Service
public class ScoreService {

    /**
     * Get top scores for a specific game type.
     * Returns top 3 unique scores (one per user).
     *
     * @param gameType the type of game (brick, maze, etc.)
     * @return list of top scores, sorted by best performance
     */
    public List<Score> getTopScores(String gameType) {
        // ...
    }
}
```

### Commentaires inline

```java
// Utiliser pour expliquer le "pourquoi", pas le "quoi"

// ✓ Bon commentaire
// Maze: lower scores are better (time-based)
if ("maze".equals(gameType)) {
    scores.sort(Comparator.comparingInt(Score::getScore));
}

// ✗ Mauvais commentaire (évident)
// Sort the list
scores.sort(...);
```

---

## Entités JPA

### Structure standard

```java
@Entity
@Table(name = "scores", indexes = {
    @Index(name = "idx_user_game", columnList = "user_id, game_type")
})
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "game_type", nullable = false)
    private String gameType;

    @Column(nullable = false)
    private int score;

    // Constructeur par défaut obligatoire pour JPA
    public Score() {
    }

    // Constructeur avec paramètres pour la création
    public Score(String userId, String gameType, int score) {
        this.userId = userId;
        this.gameType = gameType;
        this.score = score;
    }

    // Getters et Setters
    // ...
}
```

### Règles

1. **Nommage des tables** : snake_case pluriel (`app_users`, `vocabulary_items`)
2. **Nommage des colonnes** : snake_case (`user_id`, `game_type`)
3. **Clés primaires** : Préférer UUID pour les nouvelles entités
4. **Relations** : Documenter avec `@JoinColumn` explicite
5. **Index** : Ajouter pour les colonnes fréquemment recherchées

---

## DTOs

### Records Java (préféré)

```java
/**
 * DTO for score submission requests.
 */
public record ScoreSubmissionDTO(
    @NotBlank(message = "Game type is required")
    String gameType,

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be non-negative")
    Integer score,

    @NotBlank(message = "User ID is required")
    String userId,

    @NotBlank(message = "Username is required")
    String username,

    @Min(value = 1, message = "Attempts must be at least 1")
    Integer attempts
) {}
```

### Règles

1. **Validation** : Utiliser les annotations Jakarta Validation
2. **Messages** : Messages d'erreur explicites en anglais
3. **Immutabilité** : Préférer les records Java 17+
4. **Conversion** : Ajouter méthode statique `from(Entity)` si nécessaire

---

## Controllers

### Structure standard

```java
@RestController
@RequestMapping("/api/{resource}")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // GET collection
    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.findAll()));
    }

    // GET single
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Resource>> getById(@PathVariable String id) {
        Resource resource = resourceService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(resource));
    }

    // POST create
    @PostMapping
    public ResponseEntity<ApiResponse<Resource>> create(
            @Valid @RequestBody ResourceCreateDTO dto) {
        Resource created = resourceService.create(dto);
        return ResponseEntity.ok(ApiResponse.success("Created successfully", created));
    }

    // PUT update
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(
            @PathVariable String id,
            @Valid @RequestBody ResourceUpdateDTO dto) {
        resourceService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.successMessage("Updated successfully"));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Deleted successfully"));
    }
}
```

### Règles

1. **Réponses** : Toujours wrapper avec `ApiResponse<T>`
2. **Validation** : Utiliser `@Valid` sur les DTOs
3. **Codes HTTP** : 200 OK, 400 Bad Request, 403 Forbidden, 404 Not Found
4. **Pas de logique métier** : Déléguer aux services

---

## Services

### Structure standard

```java
@Service
public class ResourceService {

    private static final Logger log = LoggerFactory.getLogger(ResourceService.class);

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> findAll() {
        return resourceRepository.findAll();
    }

    public Resource findById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Resource", id));
    }

    @Transactional
    public Resource create(ResourceCreateDTO dto) {
        log.info("Creating resource: {}", dto.name());
        Resource resource = new Resource(dto.name(), dto.value());
        return resourceRepository.save(resource);
    }

    @Transactional
    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource", id);
        }
        resourceRepository.deleteById(id);
        log.info("Deleted resource: {}", id);
    }
}
```

### Règles

1. **@Transactional** : Sur les méthodes qui modifient les données
2. **Logging** : Logger les opérations importantes (INFO), erreurs (ERROR)
3. **Exceptions** : Lancer des exceptions métier, pas de return null
4. **Validation** : Valider les règles métier complexes

---

## Gestion des Erreurs

### Exceptions personnalisées

```java
// Utiliser les exceptions de shared/exception/

// Entité non trouvée
throw new EntityNotFoundException("Score", id);

// Validation échouée
throw new ValidationException("Username already taken");

// Accès non autorisé
throw new UnauthorizedException("Invalid admin code");
```

### GlobalExceptionHandler

Toutes les exceptions sont gérées centralement et retournent un `ApiResponse` avec `success: false`.

---

## Tests (Recommandations)

### Nommage des tests

```java
@Test
void getTopScores_shouldReturnTop3Scores_whenGameTypeIsValid() {
    // ...
}

@Test
void submitScore_shouldThrowValidationException_whenScoreIsNegative() {
    // ...
}
```

### Structure AAA

```java
@Test
void methodName_expectedBehavior_condition() {
    // Arrange
    ScoreSubmissionDTO dto = new ScoreSubmissionDTO("brick", 100, "user1", "User", null);

    // Act
    var result = scoreService.submitScore(dto);

    // Assert
    assertThat(result.isNewHighScore()).isTrue();
}
```

---

## Checklist avant commit

- [ ] Le code compile sans erreurs ni warnings
- [ ] Les classes sont dans le bon package domaine
- [ ] Les noms suivent les conventions
- [ ] Javadoc présente sur les classes et méthodes publiques
- [ ] Pas de logique métier dans les controllers
- [ ] DTOs validés avec Jakarta Validation
- [ ] Transactions sur les opérations d'écriture
- [ ] Exceptions métier utilisées (pas de return null)
- [ ] Logs ajoutés pour les opérations importantes
- [ ] Changeset Liquibase créé pour les modifications de schéma

---

## Migrations de Base de Données (Liquibase)

### Structure des fichiers

```
src/main/resources/db/changelog/
├── db.changelog-master.xml         # Fichier principal (inclut les autres)
└── changes/
    ├── 001-initial-schema.xml      # Schéma initial
    ├── 002-add-feature-x.xml       # Migrations suivantes
    └── ...
```

### Format d'un changeset

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <!-- Commentaire de section pour le domaine -->
    <!-- DOMAIN: NOM_DOMAINE -->
    
    <!-- Nom de l'entité concernée -->
    <changeSet id="001-create-table-name" author="changrui">
        <comment>Description de la migration</comment>
        <createTable tableName="nom_table">
            <column name="id" type="VARCHAR(36)">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="nom_colonne" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>

</databaseChangeLog>
```

### Règles Liquibase

1. **ID unique** : Format `{numero}-{description}` (ex: `014-add-user-email`)
2. **Un changeset = une modification logique** : Ne pas mélanger plusieurs tables
3. **Jamais modifier un changeset existant** : Créer un nouveau changeset pour les corrections
4. **Rollback** : Prévoir le rollback pour les migrations complexes
5. **Commentaires** : Toujours documenter le but de la migration et le domaine concerné
6. **Organisation** : Grouper les changesets par domaine avec des commentaires de section

### Correspondance Entity ↔ Liquibase

Le changelog doit correspondre **exactement** aux entités JPA. Règles de mapping :

| Annotation JPA | Type Liquibase |
|----------------|----------------|
| `@Id @GeneratedValue(UUID)` | `VARCHAR(36)` |
| `@Id` (String sans @GeneratedValue) | `VARCHAR(255)` |
| `@Id @GeneratedValue(IDENTITY)` | `INT autoIncrement="true"` |
| `String` (sans length) | `VARCHAR(255)` |
| `@Column(length = N)` | `VARCHAR(N)` |
| `@Column(columnDefinition = "TEXT")` | `TEXT` |
| `int` / `Integer` | `INT` |
| `long` / `Long` | `BIGINT` |
| `boolean` / `Boolean` | `BOOLEAN` |
| `LocalDateTime` | `TIMESTAMP` |
| `@ElementCollection` | Table séparée avec FK |

### Nommage des colonnes

Spring Boot utilise `SpringPhysicalNamingStrategy` par défaut :
- `userId` → `user_id`
- `gameType` → `game_type`
- `lastHeartbeat` → `last_heartbeat`

Si `@Column(name = "...")` est spécifié, utiliser ce nom exact.

### Exemple complet d'une entité

```java
@Entity
@Table(name = "scores")
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;                    // → VARCHAR(36)

    @Column(nullable = false)
    private String username;              // → VARCHAR(255) NOT NULL

    @Column(name = "user_id", nullable = false)
    private String userId;                // → user_id VARCHAR(255) NOT NULL

    @Column(nullable = false)
    private int score;                    // → INT NOT NULL

    @Column(nullable = true)
    private Integer attempts;             // → INT (nullable)
}
```

```xml
<createTable tableName="scores">
    <column name="id" type="VARCHAR(36)">
        <constraints primaryKey="true" nullable="false"/>
    </column>
    <column name="username" type="VARCHAR(255)">
        <constraints nullable="false"/>
    </column>
    <column name="user_id" type="VARCHAR(255)">
        <constraints nullable="false"/>
    </column>
    <column name="score" type="INT">
        <constraints nullable="false"/>
    </column>
    <column name="attempts" type="INT"/>
</createTable>
```

### Commandes utiles

```bash
# Appliquer les migrations (automatique au démarrage)
mvn spring-boot:run

# Valider le changelog sans l'appliquer
mvn liquibase:validate

# Voir le SQL qui serait exécuté
mvn liquibase:updateSQL

# Rollback de la dernière migration
mvn liquibase:rollback -Dliquibase.rollbackCount=1

# Marquer les changesets comme déjà appliqués (pour DB existante)
mvn liquibase:changelogSync
```

### Configuration

```properties
# application.properties
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml
spring.liquibase.enabled=true

# Désactiver Hibernate DDL auto (Liquibase gère le schéma)
spring.jpa.hibernate.ddl-auto=none
```

### Checklist Liquibase

- [ ] Le type Liquibase correspond exactement au type Hibernate généré
- [ ] Les noms de colonnes suivent le naming strategy (snake_case)
- [ ] Les contraintes (nullable, unique) correspondent à l'entité
- [ ] Les index définis dans `@Table(indexes = ...)` sont créés
- [ ] Les `@ElementCollection` ont leur table séparée avec FK
- [ ] Le changeset est dans le bon fichier et bien commenté
