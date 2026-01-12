# Structure des Fichiers du Projet

## 📁 Organisation Générale

```
mysteriousWebSite/
├── 📁 client/                    # Application React Frontend
├── 📁 server/                    # Application Spring Boot Backend  
├── 📁 docs/                      # 📚 Documentation technique
├── 📁 .kiro/                     # Configuration Kiro et spécifications
├── 🐳 docker-compose.yml         # Configuration Docker
└── 📖 README.md                  # Documentation principale
```

## 🎨 Frontend (client/)

### Structure Principale
```
client/
├── 📁 src/                       # Code source
│   ├── 📁 domain/               # 🏗️ Modules métier
│   ├── 📁 shared/               # 🔧 Code partagé
│   ├── 🎯 App.tsx               # Point d'entrée principal
│   └── 🎨 index.css             # Styles globaux
├── 📁 public/                    # Assets statiques
│   ├── 📁 locales/              # 🌍 Traductions i18n
│   └── 🖼️ favicon.ico           # Icône du site
├── 📁 dist/                      # Build de production
├── ⚙️ package.json              # Dépendances et scripts
├── 🔧 vite.config.ts            # Configuration Vite
└── 📝 tsconfig.json             # Configuration TypeScript
```

### Modules Domain
```
domain/
├── 👤 profile/                   # Gestion des profils utilisateur
│   ├── 🧩 components/           # Composants UI
│   ├── 🪝 hooks/                # Hooks React
│   ├── 🏢 services/             # Logique métier
│   ├── 🗄️ repositories/         # Accès aux données
│   ├── ✅ schemas/              # Validation Zod
│   ├── 📋 types.ts              # Types TypeScript
│   ├── 📄 ProfilePage.tsx       # Page principale
│   └── 📦 index.ts              # Exports publics
├── 💬 messagewall/              # Système de messagerie
├── 🎮 game/                     # Jeux arcade
├── 📅 calendar/                 # Calendrier
├── 📚 vocabulary/               # Apprentissage linguistique
├── 📝 note/                     # Système de notes
├── 💡 suggestions/              # Boîte à suggestions
├── 👨‍💼 user/                     # Authentification
├── 🏠 dashboard/                # Tableau de bord
└── 📄 cv/                       # CV interactif
```

### Infrastructure Partagée
```
shared/
├── 🧩 components/               # Composants réutilisables
│   ├── 🎨 ui/                   # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── ErrorDisplay.tsx     # 🚨 Affichage d'erreur
│   │   └── Toast.tsx
│   ├── 🎵 audio/                # Composants audio
│   ├── 🛡️ ErrorBoundary.tsx     # Gestion d'erreur globale
│   └── 📦 index.ts              # Exports
├── 🪝 hooks/                    # Hooks utilitaires
│   ├── useRetryableRequest.ts   # 🔄 Requêtes avec retry
│   ├── useSilentErrorHandler.ts # 🤫 Gestion d'erreur silencieuse
│   ├── useErrorHandler.ts       # 🚨 Gestion d'erreur
│   └── useThemeManager.ts       # 🎨 Gestion des thèmes
├── 🔧 utils/                    # Utilitaires
│   ├── circuitBreaker.ts        # ⚡ Circuit breaker
│   └── errorHandling.ts         # 🛠️ Gestion d'erreur
├── 🌐 contexts/                 # Contexts React
│   ├── AuthContext.tsx          # 🔐 Authentification
│   ├── ToastContext.tsx         # 🍞 Notifications
│   └── SettingsContext.tsx      # ⚙️ Paramètres
├── 🏢 services/                 # Services partagés
│   └── BaseService.ts           # Service de base
├── 📡 api/                      # Client HTTP
└── 🎨 layouts/                  # Layouts de page
    └── Navbar.tsx               # Navigation principale
```

## 🖥️ Backend (server/)

### Structure Principale
```
server/
├── 📁 src/main/java/            # Code source Java
│   └── com/changrui/mysterious/ # Package principal
│       ├── 🚀 MysteriousApplication.java # Point d'entrée Spring Boot
│       ├── 📁 domain/           # 🏗️ Modules métier backend
│       └── 📁 shared/           # 🔧 Infrastructure partagée
├── 📁 src/main/resources/       # Ressources et configuration
│   ├── ⚙️ application.properties # Configuration Spring Boot
│   ├── 📁 db/changelog/         # 🗄️ Migrations Liquibase
│   └── 📁 static/               # Assets statiques
├── 📁 target/                   # Build Maven
└── 📋 pom.xml                   # Dépendances Maven
```

### Modules Domain Backend
```
domain/
├── 👤 user/                     # Authentification & utilisateurs
│   ├── 🎯 controller/           # Endpoints REST
│   ├── 🏢 service/              # Logique métier
│   ├── 🗄️ repository/          # Accès données (Spring Data JPA)
│   ├── 📊 model/                # Entités JPA
│   └── 📋 dto/                  # Data Transfer Objects
├── 💬 messagewall/              # Messages & suggestions
│   ├── 🎯 controller/           # MessageController, SuggestionController
│   ├── 🏢 service/              # MessageService, SuggestionService
│   ├── 🗄️ repository/          # MessageRepository, SuggestionRepository
│   ├── 📊 model/                # Message, Suggestion, ChatSetting
│   └── 📋 dto/                  # MessageDTO, SuggestionDTO
├── 🎮 game/                     # Scores & jeux
│   ├── 🎯 controller/           # ScoreController, GameController
│   ├── 🏢 service/              # ScoreService, GameService
│   ├── 🗄️ repository/          # ScoreRepository
│   ├── 📊 model/                # Score, GameStatus
│   └── 📋 dto/                  # ScoreSubmissionDTO
├── 📚 vocabulary/               # Apprentissage linguistique
│   ├── 🎯 controller/           # VocabularyController
│   ├── 🏢 service/              # VocabularyService
│   ├── 🗄️ repository/          # VocabularyRepository
│   └── 📊 model/                # VocabularyItem
├── 📅 calendar/                 # Configuration calendrier
│   ├── 🎯 controller/           # CalendarController
│   ├── 🏢 service/              # CalendarService
│   ├── 🗄️ repository/          # CalendarRepository
│   └── 📊 model/                # CalendarConfig
├── ⚙️ settings/                 # Paramètres système
│   ├── 🎯 controller/           # SettingsController
│   ├── 🏢 service/              # SettingsService
│   ├── 🗄️ repository/          # SettingsRepository
│   └── 📊 model/                # SystemSetting
├── 📝 note/                     # Notes personnelles
│   ├── 🎯 controller/           # NoteController
│   ├── 🏢 service/              # NoteService
│   ├── 🗄️ repository/          # NoteRepository
│   ├── 📊 model/                # Note
│   └── 📋 dto/                  # NoteDTO
└── 👥 onlinecount/              # Compteur utilisateurs en ligne
    ├── 🎯 controller/           # OnlineCountController
    └── 🏢 service/              # OnlineCountService
```

### Infrastructure Partagée Backend
```
shared/
├── ⚙️ config/                   # Configuration globale
│   ├── WebConfig.java           # CORS, intercepteurs
│   ├── WebSocketConfig.java     # Configuration WebSocket
│   └── WebSocketEventListener.java # Événements WebSocket
├── 📋 dto/                      # DTOs partagés
│   └── ApiResponse.java         # Wrapper de réponse standard
└── 🚨 exception/                # Gestion d'erreur globale
    ├── GlobalExceptionHandler.java # Handler global
    ├── EntityNotFoundException.java # Entité non trouvée
    ├── ValidationException.java  # Erreur de validation
    └── UnauthorizedException.java # Accès non autorisé
```

### Base de Données & Migrations
```
src/main/resources/db/changelog/
├── 📋 db.changelog-master.xml   # Fichier principal Liquibase
└── 📁 changes/                  # Migrations par version
    ├── 001-initial-schema.xml   # Schéma initial
    ├── 002-add-notes.xml        # Ajout système de notes
    └── 002-cleanup-online-users.xml # Nettoyage utilisateurs
```

## 📚 Documentation (docs/)

```
docs/
├── 📖 README.md                 # Index de la documentation
├── 🏗️ TECHNICAL_OVERVIEW.md     # Vue d'ensemble technique
├── 📋 ARCHITECTURE_IMPROVEMENTS_APPLIED.md
├── 🔧 ERROR_HANDLING_SYSTEM.md  # Système de gestion d'erreur
├── 🚫 NO_ERROR_LOOPS_IMPLEMENTATION.md
├── 🤝 CONTRIBUTING.md           # Guide de contribution
├── 📊 CHANGELOG.md              # Historique des versions
├── 📁 FILE_STRUCTURE.md         # Ce fichier
├── 🐛 BUGFIX_MESSAGING_SYSTEM.md
├── 🚨 EMERGENCY_FIXES.md
├── 📏 CODING_STANDARDS.md
└── 🏗️ ARCHITECTURE_IMPROVEMENTS.md
```

## ⚙️ Configuration (.kiro/)

```
.kiro/
├── 📁 specs/                    # Spécifications techniques
│   └── user-profile-management/ # Spec gestion de profil
│       ├── requirements.md      # Exigences
│       ├── design.md           # Design technique
│       └── tasks.md            # Tâches d'implémentation
└── 📁 settings/                 # Paramètres Kiro
```

## 🔧 Fichiers de Configuration

### Frontend
- `📝 package.json` - Dépendances et scripts npm
- `🔧 vite.config.ts` - Configuration du bundler Vite
- `📝 tsconfig.json` - Configuration TypeScript
- `🎨 tailwind.config.js` - Configuration TailwindCSS
- `📋 .eslintrc.js` - Règles de linting

### Backend
- `📋 pom.xml` - Dépendances Maven et configuration build
- `⚙️ application.properties` - Configuration Spring Boot
- `🗄️ db.changelog-master.xml` - Migrations Liquibase
- `🐳 Dockerfile` - Image Docker backend

### DevOps
- `🐳 docker-compose.yml` - Orchestration des containers
- `🐳 Dockerfile` (client & server) - Images Docker
- `📋 .gitignore` - Fichiers ignorés par Git

## 📊 Métriques des Fichiers

### Par Type
- **📄 TypeScript/React** : ~80 fichiers (Frontend)
- **☕ Java/Spring Boot** : ~60 fichiers (Backend)
- **📚 Documentation** : ~15 fichiers  
- **⚙️ Configuration** : ~15 fichiers
- **🎨 Styles/Assets** : ~20 fichiers
- **🗄️ Migrations DB** : ~5 fichiers

### Par Module Domain
#### Frontend
- **👤 Profile** : ~15 fichiers (complet)
- **💬 MessageWall** : ~12 fichiers
- **🎮 Game** : ~10 fichiers
- **🏠 Dashboard** : ~5 fichiers

#### Backend
- **💬 MessageWall** : ~15 fichiers (Messages, Suggestions, WebSocket)
- **🎮 Game** : ~10 fichiers (Scores, GameStatus)
- **👤 User** : ~8 fichiers (Auth, Verification)
- **📚 Vocabulary** : ~6 fichiers
- **📝 Note** : ~6 fichiers
- **⚙️ Settings** : ~5 fichiers
- **📅 Calendar** : ~5 fichiers
- **👥 OnlineCount** : ~3 fichiers

## 🎯 Conventions de Nommage

### Fichiers
- **Components** : `PascalCase.tsx` (ex: `ProfileCard.tsx`)
- **Hooks** : `camelCase.ts` avec préfixe `use` (ex: `useProfile.ts`)
- **Services** : `PascalCase.ts` avec suffixe `Service` (ex: `ProfileService.ts`)
- **Types** : `camelCase.ts` (ex: `types.ts`)
- **Utils** : `camelCase.ts` (ex: `errorHandling.ts`)

### Dossiers
- **Modules** : `lowercase` (ex: `profile/`, `messagewall/`)
- **Catégories** : `lowercase` (ex: `components/`, `hooks/`, `services/`)

### Exports
- **Index files** : Chaque module a un `index.ts` pour les exports publics
- **Barrel exports** : Regroupement des exports par catégorie
- **Named exports** : Préférés aux default exports pour la lisibilité

## 🔍 Navigation Rapide

### Développement Frontend
```bash
# Composants UI principaux
client/src/shared/components/ui/

# Hooks utilitaires
client/src/shared/hooks/

# Module de profil complet
client/src/domain/profile/

# Configuration et routing
client/src/App.tsx
```

### Développement Backend
```bash
# Point d'entrée Spring Boot
server/src/main/java/com/changrui/mysterious/MysteriousApplication.java

# Infrastructure partagée
server/src/main/java/com/changrui/mysterious/shared/

# Exemple de domaine complet (MessageWall)
server/src/main/java/com/changrui/mysterious/domain/messagewall/

# Configuration base de données
server/src/main/resources/application.properties

# Migrations Liquibase
server/src/main/resources/db/changelog/
```

### Documentation
```bash
# Vue d'ensemble
docs/README.md

# Architecture technique complète
docs/TECHNICAL_OVERVIEW.md

# Architecture backend détaillée
docs/BACKEND_ARCHITECTURE.md

# Guide de contribution full-stack
docs/CONTRIBUTING.md
```

### Configuration
```bash
# Docker full-stack
docker-compose.yml

# Frontend build
client/vite.config.ts
client/package.json

# Backend build
server/pom.xml
```

---

Cette structure favorise la **maintenabilité**, la **scalabilité** et la **collaboration** en équipe.