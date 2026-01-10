# Project Documentation Index

## Project Overview

### Project Classification
- **Type:** Multi-part with 2 parts
- **Primary Language:** TypeScript/Java
- **Architecture:** Client-Server with REST API + WebSocket

### Quick Reference

#### Client (Web Application)
- **Tech Stack:** React 18.2.0, TypeScript, Vite, TailwindCSS, Three.js, GSAP
- **Entry Point:** `client/src/main.tsx`
- **Architecture Pattern:** Component-based with domain organization
- **Build Tool:** Vite 5.0.8

#### Server (Backend API)
- **Tech Stack:** Spring Boot 3.2.1, Java 17, PostgreSQL, JPA, WebSocket
- **Entry Point:** `server/src/main/java/com/changrui/mysterious/MysteriousApplication.java`
- **Architecture Pattern:** Domain-driven design with layered architecture
- **Database:** PostgreSQL with Liquibase migrations

## Generated Documentation

### Core Documentation
- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)

### Architecture Documentation
- [Architecture - Client](./architecture-client.md)
- [Architecture - Server](./architecture-server.md)

### API and Data Documentation
- [API Contracts - Server](./api-contracts-server.md)
- [Data Models - Server](./data-models-server.md)
- [UI Component Inventory - Client](./ui-component-inventory-client.md)

### Development and Deployment
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

### Existing Documentation
- [README.md](../README.md) - Project setup and launch instructions
- [BACKEND_CODING_STANDARDS.md](../server/BACKEND_CODING_STANDARDS.md) - Backend coding standards

## Getting Started

### Quick Start with Docker
```bash
# Clone and start the application
git clone <repository-url>
cd mysteriousWebSite
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

### Manual Development Setup

#### Backend
```bash
cd server
mvn spring-boot:run
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

### Database Setup
```bash
# Setup PostgreSQL database
psql -h localhost -U postgres -d messagewall -f setup_complete.sql
```

## Project Structure

### Repository Organization
```
mysteriousWebSite/
├── client/                    # React frontend
│   ├── src/
│   │   ├── domain/            # Domain-specific components
│   │   ├── shared/           # Shared utilities
│   │   └── styles/           # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                   # Spring Boot backend
│   ├── src/main/java/com/changrui/mysterious/
│   │   └── domain/           # Domain-driven design
│   ├── src/main/resources/
│   └── pom.xml
├── docs/                     # Documentation (empty)
├── _bmad-output/            # Generated documentation
├── docker-compose.yml        # Container orchestration
└── README.md                # Project documentation
```

### Domain Mapping

| Client Domain | Server Domain | Purpose |
|---------------|---------------|---------|
| `messagewall/` | `messagewall/` | Real-time chat system |
| `game/` | `game/` | Interactive games and scoring |
| `user/` | `user/` | Authentication and user management |
| `suggestions/` | `suggestions/` | Collaborative suggestion system |
| `vocabulary/` | `vocabulary/` | Vocabulary learning tools |
| `calendar/` | `calendar/` | Calendar configuration |
| `note/` | `note/` | Note-taking functionality |

## Technology Stack Summary

### Frontend Technologies
- **Framework:** React 18.2.0 with TypeScript
- **Build Tool:** Vite 5.0.8
- **Styling:** TailwindCSS 4.1.18
- **3D Graphics:** Three.js 0.160.1, React Three Fiber 8.18.0
- **Animation:** GSAP 3.14.2, Framer Motion 10.18.0
- **Routing:** React Router DOM 7.10.1
- **Physics:** Matter.js 0.20.0
- **Real-time:** SockJS + STOMP WebSocket
- **Internationalization:** i18next

### Backend Technologies
- **Framework:** Spring Boot 3.2.1
- **Language:** Java 17
- **Database:** PostgreSQL with JPA/Hibernate
- **Migration:** Liquibase
- **Real-time:** WebSocket support
- **Architecture:** Domain-driven design

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 15
- **Development:** Hot reload, TypeScript, Maven

## Key Features

### Real-time Communication
- WebSocket-based messaging system
- Live chat with message threading
- Real-time game updates
- Admin moderation controls

### Interactive Gaming
- 3D games with Three.js
- Physics simulation with Matter.js
- High score tracking and leaderboards
- Multiplayer capabilities

### Modern UI/UX
- Responsive design with TailwindCSS
- Smooth animations and transitions
- 3D visualizations
- Internationalization support

## Development Workflow

### Code Quality
- **TypeScript:** Type safety in frontend
- **Java 17:** Modern language features
- **ESLint:** Code quality enforcement
- **Prettier:** Code formatting
- **Testing:** Comprehensive test coverage

### Build and Deployment
- **Development:** Hot reload with Vite and Spring Boot DevTools
- **Production:** Containerized deployment with Docker
- **CI/CD:** Automated testing and deployment
- **Monitoring:** Health checks and logging

## API Documentation

### REST Endpoints
- **Base URL:** `http://localhost:8080/api`
- **Authentication:** Admin codes and user verification
- **Response Format:** Standardized JSON responses
- **Error Handling:** Comprehensive error responses

### WebSocket Communication
- **Endpoint:** `ws://localhost:8080/ws/messages`
- **Protocol:** STOMP over SockJS
- **Events:** Real-time messaging and system updates

## Database Schema

### Key Entities
- **Messages:** Chat messages with threading and quotes
- **Users:** User accounts with verification status
- **Scores:** Game scores with high score tracking
- **Suggestions:** Collaborative suggestions with comments
- **Settings:** System configuration and preferences

### Migration Strategy
- **Tool:** Liquibase for version-controlled migrations
- **Environment:** Separate configurations for dev/prod
- **Backup:** Automated backup procedures

## Security Features

### Authentication
- User verification system
- Admin code protection
- Session management
- Token-based authentication

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## Performance Optimizations

### Frontend
- Code splitting and lazy loading
- Bundle optimization
- Service worker caching
- Hardware-accelerated animations

### Backend
- Database connection pooling
- Query optimization
- Caching strategies
- Async processing

## Contributing Guidelines

### Development Standards
- Follow domain-driven design principles
- Maintain consistent code style
- Write comprehensive tests
- Document architectural decisions

### Git Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Ensure code quality standards
4. Submit pull request for review
5. Merge after approval

## Troubleshooting

### Common Issues
- **Database Connection:** Check PostgreSQL status and credentials
- **Port Conflicts:** Ensure ports 80, 8080, 5432 are available
- **Build Failures:** Clear node_modules or target directories
- **WebSocket Issues:** Verify network connectivity

### Support Resources
- [Development Guide](./development-guide.md) - Detailed setup instructions
- [Deployment Guide](./deployment-guide.md) - Production deployment
- [API Documentation](./api-contracts-server.md) - Complete API reference

## Future Enhancements

### Planned Features
- Microservices architecture
- Event-driven design with message queues
- Advanced analytics and monitoring
- Mobile application development
- AI-powered features

### Technical Improvements
- Performance monitoring and optimization
- Enhanced security measures
- Scalability improvements
- Automated testing pipelines
- Documentation automation

---

*This documentation was generated by the BMad Document Project workflow on 2026-01-10. For the most up-to-date information, refer to the source code and project repository.*
