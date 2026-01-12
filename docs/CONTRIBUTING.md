# Guide de Contribution

Ce document décrit les processus et standards pour contribuer au projet.

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
mysteriousWebSite/
├── client/src/           # Frontend React + TypeScript
│   ├── domain/           # Modules métier frontend
│   ├── shared/           # Code partagé frontend
│   └── App.tsx          # Point d'entrée frontend
├── server/src/main/java/ # Backend Spring Boot + Java
│   ├── domain/           # Modules métier backend
│   ├── shared/           # Code partagé backend
│   └── MysteriousApplication.java # Point d'entrée backend
└── docs/                # Documentation technique
```

### Modules Domain (Frontend & Backend)
Architecture symétrique entre frontend et backend :

#### Frontend
```
domain/[module]/
├── components/       # Composants UI spécifiques
├── hooks/           # Hooks React personnalisés
├── services/        # Logique métier frontend
├── repositories/    # Accès aux données (HTTP)
├── schemas/         # Validation Zod
├── types.ts         # Types TypeScript
└── index.ts         # Exports publics
```

#### Backend
```
domain/[module]/
├── controller/      # Endpoints REST (@RestController)
├── service/         # Logique métier (@Service)
├── repository/      # Accès données (Spring Data JPA)
├── model/           # Entités JPA (@Entity)
└── dto/             # Data Transfer Objects (Records)
```

## 📋 Standards de Développement

### 1. **Gestion d'Erreur (Frontend & Backend)**

#### Frontend
- ✅ Utiliser `useSilentErrorHandler` pour éviter les boucles d'erreur
- ✅ Implémenter `ErrorDisplay` pour les erreurs UI
- ✅ Utiliser le circuit breaker pour les requêtes critiques
- ❌ Éviter les toasts d'erreur automatiques

```typescript
// ✅ Bon
const { handleError } = useSilentErrorHandler();
try {
    await operation();
} catch (err) {
    const { userMessage } = handleError(err);
    setError(userMessage); // Pour affichage UI
}

// ❌ Éviter
catch (err) {
    showErrorToast('Error occurred'); // Peut créer des boucles
}
```

#### Backend
- ✅ Utiliser `@RestControllerAdvice` pour la gestion globale
- ✅ Retourner des `ApiResponse<T>` standardisées
- ✅ Lancer des exceptions métier spécifiques
- ✅ Logger les erreurs avec le niveau approprié

```java
// ✅ Bon
@Service
public class ProfileService {
    public Profile findById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Profile", id));
    }
}

// ✅ Gestion globale
@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
    return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
}
```

### 2. **Validation (Frontend & Backend)**

#### Frontend - Validation Zod
```typescript
const profileSchema = z.object({
    displayName: z.string().min(2).max(30),
    bio: z.string().max(500).optional()
});
```

#### Backend - Validation Jakarta
```java
public record ProfileCreateDTO(
    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 30, message = "Display name must be 2-30 characters")
    String displayName,
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    String bio
) {}
```

### 3. **API Communication (Frontend ↔ Backend)**

#### Format de Réponse Standardisé
```typescript
// Frontend - Interface TypeScript
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    timestamp: string;
}

// Backend - Record Java
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {}
```

#### Endpoints REST
```java
// Backend - Controller
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Profile>> getById(@PathVariable String id) {
        Profile profile = profileService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Profile>> create(
        @Valid @RequestBody ProfileCreateDTO dto) {
        Profile created = profileService.create(dto);
        return ResponseEntity.ok(ApiResponse.success("Created successfully", created));
    }
}
```

```typescript
// Frontend - Service
export class ProfileService {
    async getProfile(id: string): Promise<UserProfile> {
        const response = await fetchJson<ApiResponse<UserProfile>>(`/api/profiles/${id}`);
        if (!response.success) {
            throw new AppError(response.message || 'Failed to fetch profile');
        }
        return response.data!;
    }
}
```

### 4. **Hooks React (Frontend)**
- ✅ Utiliser `useRetryableRequest` pour les requêtes avec retry
- ✅ Implémenter des vérifications d'état pour éviter les requêtes simultanées
- ✅ Batching des opérations similaires
- ✅ Cleanup approprié dans `useEffect`

```typescript
// ✅ Protection contre requêtes simultanées
const operation = useCallback(async () => {
    if (isLoading || isUpdating) return;
    
    try {
        setIsLoading(true);
        await service.operation();
    } finally {
        setIsLoading(false);
    }
}, [isLoading, isUpdating]);
```

### 5. **Services Backend (Spring Boot)**
- ✅ Utiliser `@Transactional` pour les opérations d'écriture
- ✅ Valider les règles métier dans les services
- ✅ Logger les opérations importantes
- ✅ Lancer des exceptions métier spécifiques

```java
@Service
public class ProfileService {
    
    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Transactional
    public Profile createProfile(ProfileCreateDTO dto) {
        log.info("Creating profile for user: {}", dto.userId());
        
        // Validation métier
        if (profileRepository.existsByUserId(dto.userId())) {
            throw new ValidationException("Profile already exists for this user");
        }
        
        Profile profile = new Profile(dto.userId(), dto.displayName(), dto.bio());
        return profileRepository.save(profile);
    }
    
    public Profile findById(String id) {
        return profileRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Profile", id));
    }
}
```

### 6. **Entités JPA (Backend)**
- ✅ Utiliser les annotations JPA appropriées
- ✅ Définir les index pour les requêtes fréquentes
- ✅ Respecter les conventions de nommage (snake_case)
- ✅ Documenter les entités avec Javadoc

```java
/**
 * Profile entity representing user profile information.
 * Maps to the 'profiles' table in the database.
 */
@Entity
@Table(name = "profiles", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id", unique = true),
    @Index(name = "idx_display_name", columnList = "display_name")
})
public class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;
    
    @Column(name = "display_name", nullable = false, length = 30)
    private String displayName;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Constructeurs, getters, setters...
}
```

### 7. **Composants UI (Frontend)**
- ✅ Utiliser `ErrorDisplay` pour les erreurs
- ✅ Implémenter des états de loading appropriés
- ✅ Fournir des options de retry manuelles
- ✅ Validation côté client avec Zod

```typescript
// ✅ Gestion d'erreur dans les composants
{error && (
    <ErrorDisplay
        error={error}
        onRetry={handleRetry}
        onRetryWithBackoff={handleSmartRetry}
        canRetry={canRetry}
    />
)}
```

### 8. **Migrations Base de Données (Backend)**
- ✅ Utiliser Liquibase pour toutes les modifications de schéma
- ✅ Un changeset par modification logique
- ✅ Jamais modifier un changeset existant
- ✅ Documenter le but de chaque migration

```xml
<!-- Liquibase Changeset -->
<changeSet id="001-create-profiles-table" author="changrui">
    <comment>Create profiles table for user profile management</comment>
    <createTable tableName="profiles">
        <column name="id" type="VARCHAR(36)">
            <constraints primaryKey="true" nullable="false"/>
        </column>
        <column name="user_id" type="VARCHAR(255)">
            <constraints nullable="false" unique="true"/>
        </column>
        <column name="display_name" type="VARCHAR(30)">
            <constraints nullable="false"/>
        </column>
        <column name="bio" type="TEXT"/>
        <column name="created_at" type="TIMESTAMP">
            <constraints nullable="false"/>
        </column>
    </createTable>
    
    <createIndex tableName="profiles" indexName="idx_user_id">
        <column name="user_id"/>
    </createIndex>
</changeSet>
```

### 9. **Services et Repositories (Frontend)**
- ✅ Validation des données avec Zod
- ✅ Gestion d'erreur appropriée
- ✅ Logique métier dans les services
- ✅ Accès aux données dans les repositories

```typescript
// ✅ Structure de service
export class ProfileService {
    private repository: ProfileRepository;
    
    async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
        // 1. Validation
        const validation = validateCreateProfile(data);
        if (!validation.success) {
            throw new AppError('Invalid data', ERROR_CODES.VALIDATION_ERROR);
        }
        
        // 2. Logique métier
        const sanitizedData = this.sanitizeData(data);
        
        // 3. Persistance
        return this.repository.create(sanitizedData);
    }
}
```

## 🔄 Processus de Développement

### 1. **Nouvelle Fonctionnalité Full-Stack**
1. Créer une spécification dans `.kiro/specs/`
2. **Backend** :
   - Définir les entités JPA dans `model/`
   - Créer les migrations Liquibase
   - Implémenter les repositories Spring Data
   - Développer les services avec logique métier
   - Créer les DTOs avec validation Jakarta
   - Implémenter les controllers REST
3. **Frontend** :
   - Définir les types TypeScript dans `types.ts`
   - Créer les schémas de validation Zod
   - Implémenter les repositories (HTTP clients)
   - Développer les services frontend
   - Créer les hooks React
   - Développer les composants UI
4. **Intégration** :
   - Tester la communication API
   - Vérifier la gestion d'erreur end-to-end
   - Documenter les endpoints et composants

### 2. **Correction de Bug Full-Stack**
1. Identifier si le bug est frontend, backend, ou communication
2. **Backend** : Vérifier logs, exceptions, validation
3. **Frontend** : Vérifier état, requêtes, gestion d'erreur
4. Créer un test de régression approprié
5. Implémenter la correction
6. Vérifier que les tests passent
7. Documenter dans CHANGELOG.md

### 3. **Migration de Base de Données**
1. Créer le changeset Liquibase
2. Vérifier la correspondance avec les entités JPA
3. Tester la migration sur une copie de la base
4. Prévoir un rollback si nécessaire
5. Appliquer en production avec supervision

## 🧪 Tests

### Types de Tests
#### Frontend
- **Unitaires** : Hooks et fonctions utilitaires
- **Composants** : Tests React Testing Library
- **Intégration** : Interaction entre composants
- **E2E** : Parcours utilisateur complets

#### Backend
- **Unitaires** : Services et utilitaires
- **Intégration** : Repositories et base de données
- **Controllers** : Tests d'API avec MockMvc
- **E2E** : Tests complets avec TestContainers

### Bonnes Pratiques
#### Frontend
- ✅ Tester les cas d'erreur et retry
- ✅ Mocker les appels API
- ✅ Tester les états de loading
- ✅ Vérifier les cleanup d'effets

```typescript
// Test d'un hook avec gestion d'erreur
test('useProfile should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    jest.spyOn(profileService, 'getProfile').mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useProfile({ userId: 'test' }));
    
    await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.canRetry).toBe(true);
    });
});
```

#### Backend
- ✅ Tester la validation des DTOs
- ✅ Tester les exceptions métier
- ✅ Tester les transactions
- ✅ Utiliser des profils de test

```java
@SpringBootTest
@Transactional
class ProfileServiceTest {
    
    @Test
    void createProfile_shouldThrowException_whenUserAlreadyHasProfile() {
        // Given
        ProfileCreateDTO dto = new ProfileCreateDTO("user1", "Test User", "Bio");
        profileService.createProfile(dto); // Premier profil
        
        // When & Then
        assertThatThrownBy(() -> profileService.createProfile(dto))
            .isInstanceOf(ValidationException.class)
            .hasMessage("Profile already exists for this user");
    }
}
```

## 📝 Documentation

### Obligatoire
- JSDoc pour les fonctions publiques
- README pour les nouveaux modules
- Mise à jour du CHANGELOG.md
- Spécifications pour les nouvelles fonctionnalités

### Format JSDoc
```typescript
/**
 * Hook for profile management with intelligent retry and circuit breaker protection
 * Prevents infinite request loops while providing robust error handling
 * 
 * @param userId - ID of the user whose profile to manage
 * @param viewerId - ID of the viewer (for privacy filtering)
 * @returns Profile management state and actions
 */
export function useProfile({ userId, viewerId }: UseProfileProps): UseProfileReturn {
    // ...
}
```

## 🚀 Déploiement

### Checklist Pré-Déploiement
#### Frontend
- [ ] Tests passent (`npm test`)
- [ ] Build réussit (`npm run build`)
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint

#### Backend
- [ ] Tests passent (`mvn test`)
- [ ] Build réussit (`mvn clean package`)
- [ ] Pas d'erreurs de compilation
- [ ] Migrations Liquibase validées

#### Global
- [ ] Documentation mise à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Tests d'intégration API passent
- [ ] Vérification des performances

### Environnements
#### Frontend
- **Development** : `npm run dev` (Vite HMR)
- **Staging** : `npm run build && npm run preview`
- **Production** : Build optimisé avec Docker

#### Backend
- **Development** : `mvn spring-boot:run`
- **Staging** : JAR avec profil `staging`
- **Production** : Container Docker avec profil `prod`

### Configuration par Environnement
```properties
# Backend - application-prod.properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.com.changrui.mysterious=INFO

# Backend - application-dev.properties
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
logging.level.com.changrui.mysterious=DEBUG
```

## 🔧 Outils de Développement

### Frontend
- **VSCode** avec extensions TypeScript/React
- **React DevTools** pour le debugging
- **Network tab** pour analyser les requêtes
- **Console** pour les logs de développement

### Backend
- **IntelliJ IDEA** ou **VSCode** avec extension Java
- **Spring Boot DevTools** pour le hot reload
- **Postman** ou **Insomnia** pour tester les APIs
- **pgAdmin** ou **DBeaver** pour la base de données

### Configuration Recommandée
#### Frontend
- TypeScript strict mode activé
- ESLint pour la qualité du code
- Prettier pour le formatage
- Vite pour le build rapide

#### Backend
- Java 17+ avec preview features
- Maven pour la gestion des dépendances
- Spring Boot DevTools pour le développement
- Liquibase pour les migrations

## 📞 Support

### Questions Techniques
- Consulter la documentation dans `/docs`
- Vérifier les spécifications dans `.kiro/specs/`
- Examiner les exemples dans le code
- Consulter les standards backend dans `server/BACKEND_CODING_STANDARDS.md`

### Problèmes Courants
#### Frontend
- **Boucles d'erreur** : Utiliser `useSilentErrorHandler`
- **Requêtes simultanées** : Vérifier les états `isLoading`
- **Performance** : Implémenter le batching approprié
- **Types** : Définir des interfaces claires

#### Backend
- **Erreurs de validation** : Vérifier les annotations Jakarta
- **Problèmes de transaction** : Utiliser `@Transactional` approprié
- **Migrations échouées** : Vérifier la correspondance JPA/Liquibase
- **Performance** : Optimiser les requêtes JPA

#### Communication API
- **Erreurs 404** : Vérifier les routes et mappings
- **Erreurs de sérialisation** : Vérifier les DTOs et types
- **CORS** : Vérifier la configuration WebConfig
- **Timeouts** : Implémenter le circuit breaker

### Debugging
#### Frontend
```typescript
// Activer les logs de développement
if (import.meta.env.DEV) {
    console.log('Debug info:', data);
}
```

#### Backend
```java
// Logs structurés
private static final Logger log = LoggerFactory.getLogger(ServiceClass.class);

log.debug("Processing request: {}", request);
log.info("Operation completed successfully");
log.error("Error occurred", exception);
```

---

**Rappel** : Toujours privilégier la stabilité et l'expérience utilisateur dans les décisions de développement.