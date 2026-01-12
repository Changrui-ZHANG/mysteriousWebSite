# Mysterious Web Site - Full-Stack Application

This project is a comprehensive full-stack application featuring a React frontend, Spring Boot backend, and PostgreSQL database, all containerized with Docker. Built with Domain-Driven Design and robust error handling.

## 🏗️ Architecture

### Full-Stack Domain-Driven Design
- **Frontend**: React 18 + TypeScript avec architecture modulaire par domaine
- **Backend**: Spring Boot 3.2.1 + Java 17 avec Domain-Driven Design
- **Base de données**: PostgreSQL 15 avec migrations Liquibase
- **Communication**: API REST standardisée avec `ApiResponse<T>`

### Modules Métier
- **👤 Profile**: Gestion complète des profils utilisateur
- **💬 MessageWall**: Système de messagerie temps réel avec WebSocket
- **🎮 Game**: Jeux arcade avec système de scores
- **📚 Vocabulary**: Apprentissage linguistique interactif
- **📅 Calendar**: Configuration calendrier scolaire
- **📝 Note**: Système de notes personnelles
- **⚙️ Settings**: Paramètres système et administration

### Gestion d'Erreur Robuste
- **Circuit Breaker**: Prévention des boucles de requêtes infinies
- **Retry Intelligent**: Backoff exponentiel avec jitter
- **UI Gracieuse**: Boutons de retry manuels, pas de spam d'erreur
- **Logging Centralisé**: Gestion d'erreur unifiée frontend ↔ backend

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs/) folder:

- **[📋 Documentation Index](./docs/README.md)** - Complete documentation overview
- **[🏗️ Technical Overview](./docs/TECHNICAL_OVERVIEW.md)** - Complete full-stack architecture
- **[🖥️ Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)** - Detailed Spring Boot documentation
- **[🔧 Error Handling System](./docs/ERROR_HANDLING_SYSTEM.md)** - Advanced error management with circuit breaker
- **[🚫 No Error Loops](./docs/NO_ERROR_LOOPS_IMPLEMENTATION.md)** - Anti-loop error handling implementation
- **[📝 Contributing Guide](./docs/CONTRIBUTING.md)** - Full-stack development standards and processes
- **[📊 Changelog](./docs/CHANGELOG.md)** - Version history and changes

## 💻 Technology Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Zod** - TypeScript-first schema validation

### Backend
- **Spring Boot 3.2.1** - Enterprise Java framework
- **Java 17** - Latest LTS Java version with Records
- **Spring Data JPA** + **Hibernate** - ORM and database abstraction
- **PostgreSQL Driver** - Database connectivity
- **Liquibase** - Database migration management
- **Jakarta Validation** - Input validation framework

### Database & DevOps
- **PostgreSQL 15** - Robust relational database
- **Docker** + **Docker Compose** - Containerization and orchestration
- **Maven** - Backend dependency management
- **npm** - Frontend package management

## 🚀 Quick Start

### Prerequisites

-   Docker
-   Docker Compose

### How to Launch

1.  Open your terminal in the project root directory.
2.  Run the following command to build and start the application:

```bash
docker-compose up --build
```

3.  Wait for the containers to start. The initial build might take a few minutes.

### Accessing the Application

-   **Client Application**: [http://localhost](http://localhost)
-   **API Server**: [http://localhost:8080](http://localhost:8080)

## 🗄️ Database Information

The application uses a PostgreSQL database.

-   **Database Name**: `messagewall`
-   **User**: `postgres`
-   **Password**: `postgres`
-   **Port**: `5432` (mapped to host)

### Database Setup

To set up the database, run the following command:

```bash
psql -h localhost -U postgres -d messagewall -f setup_complete.sql
```

## 🔧 Development

For development setup and contribution guidelines, see:
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Full-stack development standards and processes
- **[Technical Overview](./docs/TECHNICAL_OVERVIEW.md)** - Complete system architecture
- **[Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)** - Spring Boot implementation details

### Development Setup

#### Frontend Development
```bash
cd client
npm install
npm run dev  # Starts Vite dev server on http://localhost:5173
```

#### Backend Development
```bash
cd server
mvn spring-boot:run  # Starts Spring Boot on http://localhost:8080
```

#### Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up database

# Run migrations (automatic with Spring Boot)
# Or manually: mvn liquibase:update
```

### Key Features

- ✅ **User Profile Management** - Complete profile system with privacy settings
- ✅ **Robust Error Handling** - Circuit breaker and intelligent retry mechanisms
- ✅ **Message Wall** - Real-time messaging system
- ✅ **Arcade Games** - Interactive gaming features
- ✅ **Multi-language Support** - English, French, Chinese
- ✅ **Responsive Design** - Mobile and desktop optimized

## 🛠️ Troubleshooting

If you encounter issues, try stopping the containers and removing volumes before rebuilding:

```bash
docker-compose down -v
docker-compose up --build
```

For specific error handling and debugging information, consult the [Error Handling System documentation](./docs/ERROR_HANDLING_SYSTEM.md).

## 📊 Project Status

- **Version**: 1.2.0
- **Status**: Active Development
- **Last Updated**: January 2026

See [CHANGELOG.md](./docs/CHANGELOG.md) for detailed version history.
