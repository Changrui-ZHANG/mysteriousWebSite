# Source Tree Analysis

## Project Overview
This is a multi-part full-stack application with React frontend and Spring Boot backend, containerized with Docker.

## Repository Structure

```
mysteriousWebSite/
├── client/                    # React frontend (Part: client)
│   ├── src/
│   │   ├── domain/            # Domain-specific components
│   │   │   ├── calendar/      # Calendar functionality
│   │   │   ├── cv/           # CV/Resume components  
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── game/         # Game components (3D, physics)
│   │   │   ├── messagewall/  # Real-time chat system
│   │   │   ├── note/         # Note-taking
│   │   │   ├── suggestions/  # Suggestion system
│   │   │   ├── user/         # User management
│   │   │   └── vocabulary/   # Vocabulary learning
│   │   ├── shared/           # Shared utilities and components
│   │   ├── styles/           # Global styles
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Dependencies and scripts
│   ├── vite.config.ts       # Vite build configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── node_modules/        # Dependencies
├── server/                   # Spring Boot backend (Part: server)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/changrui/mysterious/
│   │       │   ├── domain/   # Domain-driven design structure
│   │       │   │   ├── calendar/      # Calendar domain
│   │       │   │   ├── game/          # Game domain
│   │       │   │   ├── messagewall/   # Message system
│   │       │   │   ├── note/          # Note domain
│   │       │   │   ├── onlinecount/   # Online user tracking
│   │       │   │   ├── settings/      # System settings
│   │       │   │   ├── suggestions/    # Suggestion system
│   │       │   │   ├── user/          # User management
│   │       │   │   └── vocabulary/    # Vocabulary domain
│   │       │   │       ├── Each domain contains:
│   │       │   │       ├── controller/    # REST endpoints
│   │       │   │       ├── service/       # Business logic
│   │       │   │       ├── repository/    # Data access
│   │       │   │       ├── model/         # JPA entities
│   │       │   │       └── dto/           # Data transfer objects
│   │       │   └── shared/        # Shared utilities
│   │       │       ├── dto/           # Common DTOs
│   │       │       ├── exception/     # Exception handling
│   │       │       └── ApiReponse.java # Standard response format
│   │       └── resources/       # Configuration files
│   │           ├── application.yml  # Spring Boot configuration
│   │           └── db/             # Database migrations
│   ├── pom.xml              # Maven dependencies
│   ├── Dockerfile           # Container configuration
│   └── target/              # Build output
├── docs/                     # Documentation (empty)
├── _bmad/                    # BMad framework files
├── _bmad-output/            # Generated documentation
├── docker-compose.yml        # Multi-container orchestration
├── README.md                # Project documentation
└── .gitignore               # Git ignore rules
```

## Critical Directories Analysis

### Frontend Critical Paths (`client/`)

#### `/client/src/domain/` - Business Logic Components
- **Purpose:** Domain-specific UI components and business logic
- **Key Areas:**
  - `game/` - 3D games with Three.js and physics
  - `messagewall/` - Real-time chat with WebSocket
  - `dashboard/` - Main application interface
- **Integration Points:** API calls to server domains

#### `/client/src/shared/` - Reusable Components
- **Purpose:** Shared utilities and common UI components
- **Contains:** API clients, WebSocket management, common hooks

#### Configuration Files
- `vite.config.ts` - Build tool configuration
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and build scripts

### Backend Critical Paths (`server/`)

#### `/server/src/main/java/com/changrui/mysterious/domain/` - Domain Architecture
- **Purpose:** Domain-driven design implementation
- **Structure:** Each domain follows Controller → Service → Repository → Entity pattern
- **Key Domains:**
  - `messagewall/` - Chat system with WebSocket support
  - `game/` - Game logic and scoring
  - `user/` - Authentication and user management
  - `suggestions/` - Suggestion system with comments

#### `/server/src/main/resources/` - Configuration
- **Purpose:** Application configuration and database setup
- **Contains:** Spring Boot config, Liquibase migrations

#### Integration Points
- **API Layer:** REST endpoints at `/api/*`
- **WebSocket:** Real-time communication at `/ws/messages`
- **Database:** PostgreSQL with JPA/Hibernate

## Multi-Part Architecture Integration

### Client ↔ Server Communication
- **REST API:** Client calls server REST endpoints
- **WebSocket:** Real-time updates for chat and game features
- **Data Flow:** JSON payloads with standardized response format

### Domain Mapping
| Client Domain | Server Domain | Integration Type |
|--------------|---------------|------------------|
| `messagewall/` | `messagewall/` | REST + WebSocket |
| `game/` | `game/` | REST + Real-time |
| `user/` | `user/` | REST |
| `suggestions/` | `suggestions/` | REST |
| `vocabulary/` | `vocabulary/` | REST |

### Container Architecture
- **Frontend Container:** React app served by Vite dev server
- **Backend Container:** Spring Boot application
- **Database Container:** PostgreSQL
- **Orchestration:** Docker Compose manages all services

## Entry Points

### Frontend Entry Point
- **File:** `client/src/main.tsx`
- **Purpose:** React application bootstrap
- **Features:** i18n initialization, root component mounting

### Backend Entry Point  
- **File:** `server/src/main/java/com/changrui/mysterious/MysteriousApplication.java`
- **Purpose:** Spring Boot application startup
- **Features:** Component scanning, WebSocket configuration

### Application URLs
- **Frontend:** http://localhost (Vite dev server)
- **Backend API:** http://localhost:8080
- **WebSocket:** ws://localhost:8080/ws/messages

## Development Workflow

### Local Development
1. **Database Setup:** PostgreSQL container
2. **Backend Start:** Spring Boot with Maven
3. **Frontend Start:** Vite development server
4. **Integration:** Docker Compose orchestrates all services

### Build Process
- **Frontend:** `npm run build` → Static files
- **Backend:** Maven compile → JAR file
- **Containerization:** Docker images for deployment

## Key Technologies by Directory

### Frontend Technologies
- **React 18.2.0:** Component framework
- **TypeScript:** Type safety
- **Vite:** Build tool and dev server
- **TailwindCSS:** Styling framework
- **Three.js:** 3D graphics
- **GSAP:** Animation library
- **i18next:** Internationalization

### Backend Technologies  
- **Spring Boot 3.2.1:** Application framework
- **Java 17:** Programming language
- **PostgreSQL:** Database
- **JPA/Hibernate:** ORM
- **Liquibase:** Database migrations
- **WebSocket:** Real-time communication

## Security and Configuration

### Environment Configuration
- **Frontend:** Environment variables in Vite
- **Backend:** Spring Boot application.yml
- **Database:** PostgreSQL connection settings
- **Docker:** Container networking configuration

### Access Control
- **Admin Codes:** Server-side admin verification
- **User Verification:** User existence validation
- **Anonymous Options:** Privacy features in chat system
