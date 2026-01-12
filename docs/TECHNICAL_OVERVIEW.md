# Vue d'Ensemble Technique

## 🏗️ Architecture Générale

### Stack Technologique
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Spring Boot 3.2.1 + Java 17
- **Base de données**: PostgreSQL 15
- **Containerisation**: Docker + Docker Compose
- **Styling**: TailwindCSS
- **State Management**: React Hooks + Context API
- **ORM**: Spring Data JPA + Hibernate
- **Migrations**: Liquibase
- **Communication**: REST API + WebSocket

### Structure du Projet
```
mysteriousWebSite/
├── client/                 # Application React frontend
│   ├── src/
│   │   ├── domain/        # Modules métier frontend
│   │   ├── shared/        # Code partagé frontend
│   │   └── App.tsx        # Point d'entrée frontend
│   ├── public/            # Assets statiques
│   └── package.json       # Dépendances frontend
├── server/                # Application Spring Boot backend
│   ├── src/main/java/     # Code Java
│   │   ├── domain/        # Modules métier backend
│   │   └── shared/        # Code partagé backend
│   ├── src/main/resources/ # Configuration et migrations
│   └── pom.xml           # Dépendances backend
├── docs/                  # Documentation technique
├── docker-compose.yml     # Configuration containers
└── README.md             # Documentation principale
```

## 🎯 Architecture Backend (Spring Boot)

### Domain-Driven Design
Le backend suit une architecture par domaines métier :

```
com.changrui.mysterious/
├── MysteriousApplication.java      # Point d'entrée Spring Boot
│
├── shared/                         # Infrastructure partagée
│   ├── config/                     # Configuration (CORS, WebSocket)
│   ├── dto/                        # DTOs partagés (ApiResponse)
│   └── exception/                  # Gestion d'erreur globale
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

### Structure d'un Domaine Backend
```
domain/{nom-domaine}/
├── controller/          # Endpoints REST (@RestController)
├── service/             # Logique métier (@Service)
├── repository/          # Accès données (Spring Data JPA)
├── model/               # Entités JPA (@Entity)
└── dto/                 # Data Transfer Objects (Records)
```

### Technologies Backend
- **Spring Boot 3.2.1** - Framework principal
- **Java 17** - Langage et runtime
- **Spring Data JPA** - ORM et repositories
- **PostgreSQL Driver** - Connecteur base de données
- **Liquibase** - Migrations de schéma
- **Spring WebSocket** - Communication temps réel
- **Jakarta Validation** - Validation des données
- **Maven** - Gestion des dépendances

## 🎯 Modules Frontend

### Domain-Driven Design
Chaque module domain encapsule une fonctionnalité métier complète :

#### 📋 Profile Module
```
domain/profile/
├── components/           # UI Components
│   ├── ProfileCard.tsx
│   ├── ProfileForm.tsx
│   ├── AvatarUpload.tsx
│   └── PrivacySettings.tsx
├── hooks/               # React Hooks
│   ├── useProfile.ts
│   ├── useActivityStats.ts
│   └── useAvatarUpload.ts
├── services/            # Business Logic
│   ├── ProfileService.ts
│   └── ActivityService.ts
├── repositories/        # Data Access
│   └── ProfileRepository.ts
├── schemas/            # Validation
│   └── profileSchemas.ts
├── types.ts            # TypeScript Types
└── index.ts            # Public Exports
```

#### 💬 MessageWall Module
- Système de messagerie en temps réel
- Traduction automatique des messages
- Gestion de présence utilisateur
- Modération et administration

#### 🎮 Game Module
- Jeux arcade intégrés
- Système de scores et classements
- Gestion des achievements
- Modes multijoueurs

### Shared Infrastructure
```
shared/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   └── ErrorBoundary.tsx
├── hooks/              # Hooks utilitaires
│   ├── useRetryableRequest.ts
│   ├── useSilentErrorHandler.ts
│   └── useErrorHandler.ts
├── utils/              # Utilitaires
│   ├── circuitBreaker.ts
│   └── errorHandling.ts
├── contexts/           # Contexts React
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
└── services/           # Services partagés
    └── BaseService.ts
```

## 🔧 Communication Frontend ↔ Backend

### Architecture API REST
```
Frontend Service → HTTP Client → Spring Controller → Service → Repository → Database
                ←              ← ApiResponse<T>   ←         ←            ←
```

### Format de Réponse Standardisé
```typescript
// Frontend (TypeScript)
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    timestamp: string;
}

// Backend (Java Record)
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {}
```

### Gestion d'Erreur Unifiée
```java
// Backend - GlobalExceptionHandler
@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
    return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
}
```

```typescript
// Frontend - Circuit Breaker + Retry
const { executeRequest } = useRetryableRequest('profile-api');
await executeRequest(async () => {
    return await profileService.getProfile(userId);
});
```

## 🔧 Système de Gestion d'Erreur

### Architecture Multi-Couches

#### Backend - Gestion Centralisée
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }
}
```

#### Frontend - Circuit Breaker Pattern
```typescript
// Protection contre les surcharges
const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,      // 5 échecs avant ouverture
    resetTimeout: 60000,      // 1 minute avant test
    monitoringPeriod: 300000, // 5 minutes de surveillance
    halfOpenMaxCalls: 3       // 3 appels max en test
});
```

#### Frontend - Retry Intelligent
```typescript
// Backoff exponentiel avec jitter
const retryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true  // ±25% variation
};
```

### Flux de Gestion d'Erreur
```
Backend Error → GlobalExceptionHandler → ApiResponse.error() → HTTP Response
                                                                      ↓
Frontend Circuit Breaker → Retry Logic → UI ErrorDisplay → Manual Retry
```

## 📊 Performance & Optimisation

### Backend - Optimisations
```java
// Transactions pour les opérations d'écriture
@Transactional
public Suggestion createSuggestion(SuggestionCreateDTO dto) {
    return suggestionRepository.save(new Suggestion(dto));
}

// Requêtes optimisées avec Spring Data JPA
@Query("SELECT s FROM Suggestion s ORDER BY s.timestamp DESC")
List<Suggestion> findAllByOrderByTimestampDesc();

// Validation avec Jakarta Bean Validation
public record SuggestionCreateDTO(
    @NotBlank(message = "User ID is required") String userId,
    @NotBlank(message = "Content is required") String suggestion
) {}
```

### Frontend - Batching des Requêtes
```typescript
// Regroupement automatique des activités similaires
const batchActivities = (activities: ActivityUpdate[]) => {
    const messageActivities = activities.filter(a => a.type === 'message');
    const totalMessages = messageActivities.reduce((sum, a) => 
        sum + (a.metadata?.messageCount || 1), 0
    );
    return [{ type: 'message', metadata: { messageCount: totalMessages } }];
};
```

### Frontend - Lazy Loading
```typescript
// Chargement différé des modules
const ProfilePage = React.lazy(() => 
    import('./domain/profile').then(m => ({ default: m.ProfilePage }))
);
```

## 🔒 Sécurité & Validation

### Backend - Validation Multi-Niveaux
```java
// 1. Validation Jakarta Bean Validation
@PostMapping
public ResponseEntity<ApiResponse<Suggestion>> create(
    @Valid @RequestBody SuggestionCreateDTO dto) {
    // ...
}

// 2. Validation métier dans les services
@Service
public class SuggestionService {
    public Suggestion createSuggestion(SuggestionCreateDTO dto) {
        // Validation des règles métier
        if (dto.suggestion().trim().isEmpty()) {
            throw new ValidationException("Suggestion cannot be empty");
        }
        // ...
    }
}

// 3. Contraintes base de données
@Entity
@Table(name = "suggestions")
public class Suggestion {
    @Column(nullable = false, length = 1000)
    private String content;
}
```

### Frontend - Validation Zod
```typescript
const profileSchema = z.object({
    displayName: z.string().min(2).max(30),
    bio: z.string().max(500).optional(),
    privacySettings: privacySettingsSchema
});
```

### Authentification & Autorisation
```java
// Backend - Validation admin
@Service
public class AdminService {
    public boolean validateAdminCode(String code) {
        return adminCode.equals(code) || superAdminCode.equals(code);
    }
}

// Frontend - Context d'authentification
const { user, isAdmin, adminLogin } = useAuth();
```

## 🗄️ Base de Données & Migrations

### Liquibase - Migrations Versionnées
```xml
<!-- Backend - Changeset Liquibase -->
<changeSet id="001-create-suggestions" author="changrui">
    <createTable tableName="suggestions">
        <column name="id" type="VARCHAR(36)">
            <constraints primaryKey="true"/>
        </column>
        <column name="user_id" type="VARCHAR(255)">
            <constraints nullable="false"/>
        </column>
        <column name="content" type="VARCHAR(1000)">
            <constraints nullable="false"/>
        </column>
        <column name="timestamp" type="TIMESTAMP">
            <constraints nullable="false"/>
        </column>
    </createTable>
</changeSet>
```

### Entités JPA
```java
@Entity
@Table(name = "suggestions", indexes = {
    @Index(name = "idx_user_timestamp", columnList = "user_id, timestamp")
})
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(nullable = false, length = 1000)
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
```

## 🚀 Déploiement & DevOps

### Containerisation
```yaml
# docker-compose.yml
services:
  client:
    build: ./client
    ports: ["80:80"]
    depends_on: [server]
    
  server:
    build: ./server
    ports: ["8080:8080"]
    depends_on: [database]
    environment:
      DB_URL: jdbc:postgresql://database:5432/messagewall
      
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: messagewall
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
```

### Build Process
#### Frontend
1. **Development** : `npm run dev` (Vite HMR)
2. **Production** : `npm run build` (Optimisé + code splitting)
3. **Testing** : `npm run test` (Jest/Vitest)

#### Backend
1. **Development** : `mvn spring-boot:run`
2. **Production** : `mvn clean package` → JAR executable
3. **Testing** : `mvn test`

## 📈 Métriques & KPIs

### Performance
- **Frontend TTI** : < 2s
- **API Response Time** : < 500ms moyenne
- **Database Query Time** : < 100ms
- **Error Rate** : < 1% grâce au circuit breaker

### Qualité Code
- **TypeScript Coverage** : 100% (Frontend)
- **Java Code Coverage** : En cours d'amélioration
- **Architecture Modulaire** : Domain-driven design
- **Error Handling** : Robuste et sans boucles

### Expérience Utilisateur
- **Responsive Design** : Mobile-first
- **Accessibility** : WCAG 2.1 AA
- **Internationalization** : 3 langues supportées
- **Error Recovery** : Options de retry intelligentes

## 🔮 Évolutions Futures

### Backend
- Tests unitaires et d'intégration complets
- Système de cache (Redis)
- Monitoring avec Micrometer/Actuator
- API versioning et documentation OpenAPI

### Frontend
- Tests unitaires et d'intégration complets
- Migration vers React Server Components
- Implémentation de PWA
- Analytics et métriques utilisateur

### Infrastructure
- CI/CD avec GitHub Actions
- Monitoring et observabilité (Prometheus/Grafana)
- Sécurité renforcée (OAuth2/JWT)
- Scalabilité horizontale

---

**Note** : Cette architecture full-stack privilégie la **maintenabilité**, la **performance** et l'**expérience utilisateur**, avec une attention particulière à la **cohérence** entre frontend et backend et à la **gestion d'erreur robuste**.