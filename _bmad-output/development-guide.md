# Development Guide

## Overview
This guide provides comprehensive instructions for setting up, developing, and maintaining the Mysterious Website application.

## Prerequisites

### System Requirements
- **Node.js:** 18+ (for frontend)
- **Java:** 17+ (for backend)
- **Maven:** 3.6+ (for backend)
- **Docker:** Latest version
- **Docker Compose:** Latest version
- **PostgreSQL Client:** For database management

### Development Tools
- **IDE:** VS Code, IntelliJ IDEA, or similar
- **Git:** Version control
- **Browser:** Chrome/Firefox with developer tools

## Quick Start

### Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd mysteriousWebSite

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

### Manual Setup

#### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies and compile
mvn clean install

# Run the application
mvn spring-boot:run

# Or run from JAR
java -jar target/mysterious-backend-0.0.1-SNAPSHOT.jar
```

#### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

### Database Setup

#### PostgreSQL Configuration
```bash
# Connect to database
psql -h localhost -U postgres -d messagewall

# Run setup script
psql -h localhost -U postgres -d messagewall -f setup_complete.sql
```

#### Database Schema
- **Database Name:** `messagewall`
- **User:** `postgres`
- **Password:** `postgres`
- **Port:** `5432`

### Environment Configuration

#### Backend Environment (`server/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/messagewall
    username: postgres
    password: postgres
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    
server:
  port: 8080
```

#### Frontend Environment
Create `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/messages
```

## Code Structure and Standards

### Backend Development Standards

#### Package Structure
```
com.changrui.mysterious.domain.{domain}/
├── controller/    # REST endpoints
├── service/       # Business logic
├── repository/    # Data access
├── model/         # JPA entities
└── dto/           # Data transfer objects
```

#### Coding Conventions
- **Java 17** features (records, pattern matching)
- **Spring Boot** best practices
- **Domain-Driven Design** principles
- **RESTful API** design
- **JPA/Hibernate** for data access

#### API Standards
```java
@RestController
@RequestMapping("/api/{resource}")
public class ResourceController {
    
    @GetMapping
    public ResponseEntity<List<Resource>> getAll() { }
    
    @PostMapping
    public ResponseEntity<Resource> create(@RequestBody Resource resource) { }
    
    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable String id, @RequestBody Resource resource) { }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { }
}
```

### Frontend Development Standards

#### Component Structure
```
src/domain/{domain}/
├── components/    # React components
├── hooks/         # Custom hooks
├── services/      # API calls
├── types/         # TypeScript types
└── utils/         # Helper functions
```

#### Coding Conventions
- **TypeScript** strict mode
- **React 18** functional components with hooks
- **TailwindCSS** for styling
- **ESLint** and **Prettier** for code quality

#### Component Template
```tsx
import React from 'react';

interface ComponentProps {
  // Define props here
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic here
  
  return (
    <div className="component-class">
      {/* JSX here */}
    </div>
  );
};

export default Component;
```

## Testing

### Backend Testing
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=MessageControllerTest

# Generate test coverage
mvn jacoco:report
```

#### Test Structure
```java
@ExtendWith(MockitoExtension.class)
class MessageServiceTest {
    
    @Mock
    private MessageRepository messageRepository;
    
    @InjectMocks
    private MessageService messageService;
    
    @Test
    void shouldCreateMessage() {
        // Test implementation
    }
}
```

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Build and Deployment

### Development Build
```bash
# Frontend
cd client && npm run build

# Backend
cd server && mvn clean package
```

### Production Deployment

#### Docker Build
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

#### Environment Variables
```bash
# Production environment
export NODE_ENV=production
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Common Development Tasks

### Adding New Domain

#### Backend
1. Create domain package: `com.changrui.mysterious.domain.{domain}`
2. Implement controller, service, repository, model
3. Add JPA entity with proper annotations
4. Create DTOs for data transfer
5. Add unit tests

#### Frontend
1. Create domain folder: `src/domain/{domain}`
2. Implement components, hooks, services
3. Add TypeScript types
4. Integrate with routing
5. Add tests

### Database Migration
```bash
# Create new migration
mvn liquibase:generateChangeLog

# Run migrations
mvn liquibase:update

# Rollback migration
mvn liquibase:rollback
```

### Adding New API Endpoint
1. Define endpoint in controller
2. Implement business logic in service
3. Add data access in repository
4. Create/update DTOs
5. Add API documentation
6. Write tests

## Debugging

### Backend Debugging
- **IDE Debugger:** Connect to Spring Boot process
- **Logs:** Check application logs
- **Database:** Use psql or database tool
- **API Testing:** Postman or curl

### Frontend Debugging
- **Browser DevTools:** React DevTools, Network tab
- **Console Logs:** Check browser console
- **Network:** Inspect API calls and WebSocket connections
- **State:** React DevTools for component state

## Performance Optimization

### Backend Optimization
- **Database Indexing:** Add indexes for frequently queried fields
- **Connection Pooling:** Configure HikariCP settings
- **Caching:** Implement Redis or in-memory caching
- **Async Processing:** Use @Async for long-running tasks

### Frontend Optimization
- **Code Splitting:** Lazy load components and routes
- **Bundle Analysis:** Use webpack-bundle-analyzer
- **Image Optimization:** Compress and lazy load images
- **Caching:** Implement service worker for offline support

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

#### Frontend Build Issues
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### Backend Compilation Issues
```bash
# Clean Maven cache
mvn clean

# Rebuild dependencies
mvn dependency:resolve

# Skip tests temporarily
mvn package -DskipTests
```

## Monitoring and Logging

### Application Logs
- **Backend:** Console logs and file logging
- **Frontend:** Browser console and error tracking
- **Database:** PostgreSQL query logs

### Health Checks
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend availability
curl http://localhost
```

## Contributing

### Git Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Ensure code quality standards
4. Submit pull request for review
5. Merge after approval

### Code Review Checklist
- [ ] Tests pass
- [ ] Code follows standards
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Performance considered
