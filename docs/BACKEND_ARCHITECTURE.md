# Architecture Backend - Spring Boot

## 🏗️ Vue d'Ensemble

Le backend utilise **Spring Boot 3.2.1** avec **Java 17** et suit une architecture **Domain-Driven Design** pour une séparation claire des responsabilités.

### Stack Technique
- **Framework** : Spring Boot 3.2.1
- **Langage** : Java 17
- **Base de données** : PostgreSQL 15
- **ORM** : Spring Data JPA + Hibernate
- **Migrations** : Liquibase
- **Communication** : REST API + WebSocket
- **Validation** : Jakarta Bean Validation
- **Build** : Maven
- **Containerisation** : Docker

## 📁 Structure des Packages

```
com.changrui.mysterious/
├── MysteriousApplication.java      # Point d'entrée Spring Boot
│
├── shared/                         # Infrastructure partagée
│   ├── config/                     # Configuration globale
│   │   ├── WebConfig.java          # CORS, intercepteurs
│   │   ├── WebSocketConfig.java    # Configuration WebSocket
│   │   └── WebSocketEventListener.java
│   ├── dto/                        # DTOs partagés
│   │   └── ApiResponse.java        # Wrapper de réponse standard
│   └── exception/                  # Gestion d'erreur globale
│       ├── GlobalExceptionHandler.java
│       ├── EntityNotFoundException.java
│       ├── ValidationException.java
│       └── UnauthorizedException.java
│
└── domain/                         # Domaines métier
    ├── user/                       # Authentification & utilisateurs
    ├── messagewall/                # Messages & suggestions
    ├── game/                       # Scores & jeux
    ├── vocabulary/                 # Apprentissage linguistique
    ├── calendar/                   # Configuration calendrier
    ├── settings/                   # Paramètres système
    ├── note/                       # Notes personnelles
    └── onlinecount/                # Compteur utilisateurs
```

## 🎯 Architecture par Domaine

### Structure Standard d'un Domaine
```
domain/{nom-domaine}/
├── controller/          # Couche présentation (REST endpoints)
├── service/             # Couche logique métier
├── repository/          # Couche accès données (Spring Data JPA)
├── model/               # Entités JPA (mapping base de données)
└── dto/                 # Data Transfer Objects (communication API)
```

### Exemple : Domaine MessageWall
```
domain/messagewall/
├── controller/
│   ├── MessageController.java      # Endpoints /api/messages
│   └── SuggestionController.java   # Endpoints /api/suggestions
├── service/
│   ├── MessageService.java         # Logique métier messages
│   └── SuggestionService.java      # Logique métier suggestions
├── repository/
│   ├── MessageRepository.java      # Accès données messages
│   ├── SuggestionRepository.java   # Accès données suggestions
│   └── SuggestionCommentRepository.java
├── model/
│   ├── Message.java                # Entité JPA message
│   ├── Suggestion.java             # Entité JPA suggestion
│   └── SuggestionComment.java      # Entité JPA commentaire
└── dto/
    ├── MessageCreateDTO.java       # DTO création message
    ├── SuggestionCreateDTO.java    # DTO création suggestion
    ├── SuggestionResponseDTO.java  # DTO réponse suggestion
    └── CommentCreateDTO.java       # DTO création commentaire
```

## 🔧 Couches d'Architecture

### 1. Controllers (@RestController)
**Responsabilité** : Exposition des endpoints REST, validation des entrées, orchestration des appels

```java
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SuggestionResponseDTO>>> getAll() {
        List<SuggestionResponseDTO> suggestions = suggestionService.getAllSuggestions();
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Suggestion>> create(
            @Valid @RequestBody SuggestionCreateDTO dto) {
        Suggestion created = suggestionService.createSuggestion(dto);
        return ResponseEntity.ok(ApiResponse.success("Created successfully", created));
    }
}
```

**Règles** :
- Pas de logique métier dans les controllers
- Toujours wrapper les réponses avec `ApiResponse<T>`
- Utiliser `@Valid` pour la validation automatique
- Déléguer toute la logique aux services

### 2. Services (@Service)
**Responsabilité** : Logique métier, validation des règles business, orchestration des repositories

```java
@Service
public class SuggestionService {

    private static final Logger log = LoggerFactory.getLogger(SuggestionService.class);

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private SuggestionCommentRepository commentRepository;

    /**
     * Get all suggestions with comment counts.
     */
    public List<SuggestionResponseDTO> getAllSuggestions() {
        return suggestionRepository.findAllByOrderByTimestampDesc().stream()
                .map(s -> SuggestionResponseDTO.from(s, commentRepository.countBySuggestionId(s.getId())))
                .toList();
    }

    /**
     * Create a new suggestion with business validation.
     */
    @Transactional
    public Suggestion createSuggestion(SuggestionCreateDTO dto) {
        log.info("Creating suggestion for user: {}", dto.userId());
        
        // Validation métier
        String content = dto.suggestion().trim();
        if (content.isEmpty()) {
            throw new ValidationException("Suggestion content cannot be empty");
        }
        
        Suggestion suggestion = new Suggestion(dto.userId(), dto.username(), content);
        return suggestionRepository.save(suggestion);
    }
}
```

**Règles** :
- Utiliser `@Transactional` pour les opérations d'écriture
- Logger les opérations importantes (INFO) et erreurs (ERROR)
- Valider les règles métier complexes
- Lancer des exceptions métier spécifiques

### 3. Repositories (Spring Data JPA)
**Responsabilité** : Accès aux données, requêtes personnalisées

```java
@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, String> {
    
    List<Suggestion> findAllByOrderByTimestampDesc();
    
    List<Suggestion> findByUserIdOrderByTimestampDesc(String userId);
    
    @Query("SELECT s FROM Suggestion s WHERE s.status = :status ORDER BY s.timestamp DESC")
    List<Suggestion> findByStatus(@Param("status") String status);
    
    boolean existsByUserIdAndContent(String userId, String content);
}
```

**Règles** :
- Étendre `JpaRepository<Entity, ID>`
- Utiliser les conventions de nommage Spring Data
- Créer des requêtes personnalisées avec `@Query` si nécessaire
- Optimiser avec des index sur les colonnes fréquemment recherchées

### 4. Models/Entities (@Entity)
**Responsabilité** : Mapping objet-relationnel, définition du schéma

```java
/**
 * Suggestion entity representing user suggestions.
 * Maps to the 'suggestions' table in the database.
 */
@Entity
@Table(name = "suggestions", indexes = {
    @Index(name = "idx_user_timestamp", columnList = "user_id, timestamp"),
    @Index(name = "idx_status", columnList = "status")
})
public class Suggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String status = "pending";

    // Constructeur par défaut pour JPA
    public Suggestion() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructeur métier
    public Suggestion(String userId, String username, String content) {
        this();
        this.userId = userId;
        this.username = username;
        this.content = content;
    }

    // Getters et Setters...
}
```

**Règles** :
- Documenter avec Javadoc le mapping de table
- Utiliser des index pour les colonnes fréquemment recherchées
- Respecter les conventions de nommage (snake_case pour les colonnes)
- Constructeur par défaut obligatoire pour JPA

### 5. DTOs (Data Transfer Objects)
**Responsabilité** : Transport de données, validation des entrées/sorties

```java
/**
 * DTO for creating a new suggestion.
 */
public record SuggestionCreateDTO(
    @NotBlank(message = "User ID is required")
    String userId,

    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Suggestion content is required")
    @Size(max = 1000, message = "Suggestion cannot exceed 1000 characters")
    String suggestion
) {}

/**
 * DTO for suggestion responses with computed fields.
 */
public record SuggestionResponseDTO(
    String id,
    String userId,
    String username,
    String content,
    LocalDateTime timestamp,
    String status,
    long commentCount
) {
    public static SuggestionResponseDTO from(Suggestion suggestion, long commentCount) {
        return new SuggestionResponseDTO(
            suggestion.getId(),
            suggestion.getUserId(),
            suggestion.getUsername(),
            suggestion.getContent(),
            suggestion.getTimestamp(),
            suggestion.getStatus(),
            commentCount
        );
    }
}
```

**Règles** :
- Utiliser les Records Java 17+ pour l'immutabilité
- Valider avec les annotations Jakarta Bean Validation
- Messages d'erreur explicites en anglais
- Méthodes statiques `from()` pour la conversion depuis les entités

## 🔧 Infrastructure Partagée

### Configuration Globale
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Gestion d'Erreur Globale
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        
        log.warn("Validation error: {}", message);
        return ResponseEntity.badRequest().body(ApiResponse.error(message));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
}
```

### Réponse API Standardisée
```java
/**
 * Generic API response wrapper for consistent response format.
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        LocalDateTime timestamp) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }
}
```

## 🗄️ Gestion de Base de Données

### Migrations Liquibase
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog">
    
    <!-- DOMAIN: MESSAGEWALL -->
    <changeSet id="001-create-suggestions-table" author="changrui">
        <comment>Create suggestions table for user suggestions feature</comment>
        <createTable tableName="suggestions">
            <column name="id" type="VARCHAR(36)">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="user_id" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="username" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="content" type="VARCHAR(1000)">
                <constraints nullable="false"/>
            </column>
            <column name="timestamp" type="TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="status" type="VARCHAR(50)" defaultValue="pending">
                <constraints nullable="false"/>
            </column>
        </createTable>
        
        <createIndex tableName="suggestions" indexName="idx_user_timestamp">
            <column name="user_id"/>
            <column name="timestamp"/>
        </createIndex>
        
        <createIndex tableName="suggestions" indexName="idx_status">
            <column name="status"/>
        </createIndex>
    </changeSet>
    
</databaseChangeLog>
```

### Configuration Base de Données
```properties
# application.properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/messagewall}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none  # Liquibase gère le schéma
spring.jpa.show-sql=${JPA_SHOW_SQL:true}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Liquibase
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml
spring.liquibase.enabled=true
```

## 🔒 Sécurité & Validation

### Validation Multi-Niveaux
1. **Validation Jakarta** : Annotations sur les DTOs
2. **Validation Métier** : Règles business dans les services
3. **Contraintes DB** : Contraintes PostgreSQL

### Authentification Simple
```java
@Service
public class AdminService {
    
    @Value("${app.admin.code}")
    private String adminCode;
    
    @Value("${app.super-admin.code}")
    private String superAdminCode;
    
    public boolean validateAdminCode(String code) {
        return adminCode.equals(code) || superAdminCode.equals(code);
    }
    
    public boolean isSuperAdmin(String code) {
        return superAdminCode.equals(code);
    }
}
```

## 📊 Performance & Optimisation

### Requêtes Optimisées
```java
// Utiliser les index définis
@Query("SELECT s FROM Suggestion s WHERE s.userId = :userId ORDER BY s.timestamp DESC")
List<Suggestion> findByUserIdOrderByTimestampDesc(@Param("userId") String userId);

// Éviter N+1 queries avec JOIN FETCH
@Query("SELECT s FROM Suggestion s LEFT JOIN FETCH s.comments WHERE s.id = :id")
Optional<Suggestion> findByIdWithComments(@Param("id") String id);
```

### Transactions Appropriées
```java
@Transactional(readOnly = true)  // Pour les lectures
public List<Suggestion> getAllSuggestions() {
    return suggestionRepository.findAllByOrderByTimestampDesc();
}

@Transactional  // Pour les écritures
public Suggestion createSuggestion(SuggestionCreateDTO dto) {
    return suggestionRepository.save(new Suggestion(dto));
}
```

### Logging Structuré
```java
private static final Logger log = LoggerFactory.getLogger(SuggestionService.class);

// Logs d'information
log.info("Creating suggestion for user: {}", dto.userId());

// Logs d'erreur avec contexte
log.error("Failed to create suggestion for user: {}", dto.userId(), exception);

// Logs de debug (dev uniquement)
log.debug("Processing suggestion: {}", dto);
```

## 🚀 Déploiement & Configuration

### Profils d'Environnement
```properties
# application-dev.properties
spring.jpa.show-sql=true
logging.level.com.changrui.mysterious=DEBUG

# application-prod.properties
spring.jpa.show-sql=false
logging.level.com.changrui.mysterious=INFO
server.error.include-message=never
```

### Docker Configuration
```dockerfile
FROM openjdk:17-jre-slim

COPY target/mysterious-backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📈 Métriques & Monitoring

### Actuator (Future)
```properties
# Endpoints de monitoring
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

### Logs Applicatifs
- **INFO** : Opérations importantes (création, modification, suppression)
- **WARN** : Erreurs récupérables (validation, entité non trouvée)
- **ERROR** : Erreurs système (exceptions non gérées, problèmes DB)
- **DEBUG** : Détails techniques (dev uniquement)

---

Cette architecture backend garantit la **maintenabilité**, la **scalabilité** et la **robustesse** tout en maintenant une **séparation claire des responsabilités** et une **cohérence** avec l'architecture frontend.