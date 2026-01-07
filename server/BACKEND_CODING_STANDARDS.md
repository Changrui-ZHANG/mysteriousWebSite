# Backend Coding Standards

> Standards de développement pour le backend **Java 17 + Spring Boot 3.2** avec Architecture Hexagonale
> 
> **Projet** : mysterious-backend (`com.changrui.mysterious`)

---

## 📐 Architecture Hexagonale

### Structure des Packages (Réelle du Projet)

```
com.changrui.mysterious/
├── domain/                                  # 🔷 Cœur métier (AUCUN Spring)
│   ├── model/user/
│   │   ├── User.java                        # Entité de domaine
│   │   └── UserId.java                      # Value Object
│   ├── exception/
│   │   ├── DomainException.java             # Exception de base
│   │   ├── UserNotFoundException.java
│   │   ├── UsernameAlreadyExistsException.java
│   │   └── InvalidCredentialsException.java
│   └── port/
│       ├── in/                              # Use Cases (interfaces)
│       │   ├── RegisterUserUseCase.java
│       │   └── LoginUserUseCase.java
│       └── out/                             # Ports de sortie
│           └── UserRepository.java
│
├── application/                             # 🔶 Orchestration
│   └── service/auth/
│       └── AuthenticationService.java       # Implémente les Use Cases
│
├── infrastructure/                          # 🔵 Détails techniques
│   ├── persistence/
│   │   ├── entity/
│   │   │   └── AppUserEntity.java           # Entité JPA
│   │   ├── repository/
│   │   │   ├── SpringDataUserRepository.java
│   │   │   └── JpaUserRepository.java       # Adapter du port
│   │   └── mapper/
│   │       └── UserMapper.java
│   ├── web/controller/
│   │   └── AuthController.java
│   └── config/
│       └── WebConfig.java
│
└── MysteriousApplication.java
```

### Règles de Dépendances

```
┌─────────────────────────────────────────────────────────────┐
│                    RÈGLE D'OR                               │
│  Les dépendances pointent TOUJOURS vers le centre (Domain) │
└─────────────────────────────────────────────────────────────┘

Infrastructure → Application → Domain
      ↓               ↓            ✗ (ne dépend de rien)
   Adapters       Services       Entities
```

| Couche | Peut importer | NE PEUT PAS importer |
|--------|---------------|----------------------|
| `domain.*` | `java.*` uniquement | `application`, `infrastructure`, Spring, JPA |
| `application.*` | `domain.*` | `infrastructure.*` |
| `infrastructure.*` | `domain.*`, `application.*`, Spring, JPA | - |

---

## 🧱 Principes SOLID (Exemples du Projet)

### S - Single Responsibility Principle (SRP)

```java
// ✅ AuthenticationService a UNE seule responsabilité : l'authentification
// Fichier: application/service/auth/AuthenticationService.java

@Service
@Transactional
public class AuthenticationService implements RegisterUserUseCase, LoginUserUseCase {
    
    private final UserRepository userRepository;
    
    @Override
    public User execute(RegisterUserCommand command) { /* inscription */ }
    
    @Override
    public User execute(LoginUserCommand command) { /* connexion */ }
}
```

### O - Open/Closed Principle (OCP)

```java
// ✅ UserRepository (port) peut avoir plusieurs implémentations
// Fichier: domain/port/out/UserRepository.java

public interface UserRepository {
    Optional<User> findById(UserId id);
    Optional<User> findByUsername(String username);
    User save(User user);
}

// Implémentation JPA (peut être remplacée par MongoDB, etc.)
// Fichier: infrastructure/persistence/repository/JpaUserRepository.java
@Component
public class JpaUserRepository implements UserRepository { ... }
```

### D - Dependency Inversion Principle (DIP)

```java
// ✅ Le service dépend de l'interface (port), pas de l'implémentation
// Fichier: application/service/auth/AuthenticationService.java

@Service
public class AuthenticationService implements RegisterUserUseCase {
    
    private final UserRepository userRepository; // Interface du domaine, pas JpaUserRepository
    
    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

---

## 📝 Conventions de Code

### Nommage (Exemples du Projet)

| Élément | Convention | Exemple Réel |
|---------|------------|--------------|
| Packages | `lowercase` | `com.changrui.mysterious.domain.model.user` |
| Classes Domaine | `PascalCase` | `User`, `UserId` |
| Use Cases | `*UseCase` | `RegisterUserUseCase`, `LoginUserUseCase` |
| Services | `*Service` | `AuthenticationService` |
| Entités JPA | `*Entity` | `AppUserEntity` |
| Repositories (port) | `*Repository` | `UserRepository` |
| Repositories (JPA) | `Jpa*Repository` | `JpaUserRepository` |
| Mappers | `*Mapper` | `UserMapper` |
| Exceptions | `*Exception` | `UserNotFoundException` |

### Structure d'un Use Case (RegisterUserUseCase.java)

```java
// Fichier: domain/port/in/RegisterUserUseCase.java

public interface RegisterUserUseCase {
    
    User execute(RegisterUserCommand command);
    
    // Command Pattern - valide à la construction
    record RegisterUserCommand(
        String username,
        String password
    ) {
        public RegisterUserCommand {
            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Username is required");
            }
        }
    }
}
```

### Structure d'une Entité de Domaine (User.java)

```java
// Fichier: domain/model/user/User.java

public class User {
    
    private final UserId id;
    private String username;
    private String password;
    
    // Constructeur privé - Factory methods obligatoires
    private User(UserId id, String username, String password) { ... }
    
    // Factory pour création
    public static User create(String username, String password) {
        validateUsername(username);
        validatePassword(password);
        return new User(null, username, password);
    }
    
    // Factory pour reconstitution depuis DB
    public static User reconstitute(UserId id, String username, ...) { ... }
    
    // Logique métier encapsulée
    public boolean checkPassword(String rawPassword) {
        return this.password.equals(rawPassword);
    }
}
```

### Structure d'un Value Object (UserId.java)

```java
// Fichier: domain/model/user/UserId.java

public record UserId(String value) {
    
    public UserId {
        Objects.requireNonNull(value, "User ID cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be blank");
        }
    }
    
    public static UserId of(String value) {
        return new UserId(value);
    }
}
```

---

## 🛡️ Gestion des Erreurs (Exemples du Projet)

### Hiérarchie d'Exceptions

```java
// Fichier: domain/exception/DomainException.java
public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) { super(message); }
    public abstract String getErrorCode();
}

// Fichier: domain/exception/UserNotFoundException.java
public class UserNotFoundException extends DomainException {
    private static final String ERROR_CODE = "USER_NOT_FOUND";
    
    public UserNotFoundException(String username) {
        super("User with username '" + username + "' not found");
    }
    
    @Override
    public String getErrorCode() { return ERROR_CODE; }
}

// Fichier: domain/exception/InvalidCredentialsException.java
public class InvalidCredentialsException extends DomainException {
    private static final String ERROR_CODE = "INVALID_CREDENTIALS";
    
    public InvalidCredentialsException() {
        super("Invalid username or password");
    }
    
    @Override
    public String getErrorCode() { return ERROR_CODE; }
}
```

---

## 🔄 Mappers (UserMapper.java)

```java
// Fichier: infrastructure/persistence/mapper/UserMapper.java

@Component
public class UserMapper {
    
    // JPA → Domain
    public User toDomain(AppUserEntity entity) {
        return User.reconstitute(
            UserId.of(entity.getId()),
            entity.getUsername(),
            entity.getPassword(),
            entity.getPlainPassword(),
            entity.getPreferredLanguage(),
            entity.getVocabularyFavorites()
        );
    }
    
    // Domain → JPA
    public AppUserEntity toEntity(User user) {
        AppUserEntity entity = new AppUserEntity();
        if (user.getId() != null) {
            entity.setId(user.getId().value());
        }
        entity.setUsername(user.getUsername());
        entity.setPassword(user.getPassword());
        return entity;
    }
}
```

---

## 🏗️ Adapter Repository (JpaUserRepository.java)

```java
// Fichier: infrastructure/persistence/repository/JpaUserRepository.java

@Component
public class JpaUserRepository implements UserRepository {

    private final SpringDataUserRepository springDataRepository;
    private final UserMapper mapper;

    public JpaUserRepository(SpringDataUserRepository springDataRepository, UserMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return springDataRepository.findByUsername(username)
                .map(mapper::toDomain);
    }

    @Override
    public User save(User user) {
        AppUserEntity entity = mapper.toEntity(user);
        AppUserEntity savedEntity = springDataRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
}
```

---

## ✅ Tests

### Test Unitaire d'un Use Case

```java
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private AuthenticationService authService;
    
    @Test
    @DisplayName("Should register user when username is unique")
    void shouldRegisterUser_WhenUsernameIsUnique() {
        // Arrange
        var command = new RegisterUserCommand("john_doe", "password123");
        when(userRepository.existsByUsername("john_doe")).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        
        // Act
        User result = authService.execute(command);
        
        // Assert
        assertThat(result.getUsername()).isEqualTo("john_doe");
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    @DisplayName("Should throw UsernameAlreadyExistsException when username taken")
    void shouldThrow_WhenUsernameTaken() {
        // Arrange
        var command = new RegisterUserCommand("existing_user", "password");
        when(userRepository.existsByUsername("existing_user")).thenReturn(true);
        
        // Act & Assert
        assertThatThrownBy(() -> authService.execute(command))
            .isInstanceOf(UsernameAlreadyExistsException.class);
    }
}
```

---

## 📋 Checklist Code Review

- [ ] Aucune annotation Spring/JPA dans `domain.*`
- [ ] Use Cases utilisent le pattern Command (record avec validation)
- [ ] Entités de domaine créées via factory methods (`create()`, `reconstitute()`)
- [ ] Value Objects immuables (records Java)
- [ ] Logique métier dans le domaine, pas dans les services
- [ ] Repositories du domaine = interfaces, adapters dans infrastructure
- [ ] Mappers séparent Entity JPA ↔ Entité Domain
- [ ] Exceptions métier étendent `DomainException`
- [ ] Services annotés `@Transactional`
- [ ] Injection par constructeur (pas `@Autowired` sur champs)
