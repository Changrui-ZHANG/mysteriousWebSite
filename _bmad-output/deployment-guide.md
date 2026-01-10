# Deployment Guide

## Overview
This guide covers deployment strategies and configuration for the Mysterious Website application.

## Container Architecture

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: messagewall
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/messagewall
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
    environment:
      VITE_API_BASE_URL: http://localhost:8080

volumes:
  postgres_data:
```

## Deployment Environments

### Development Environment
```bash
# Start development stack
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale server=2

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Infrastructure Requirements

### Minimum System Requirements
- **CPU:** 2 cores
- **Memory:** 4GB RAM
- **Storage:** 20GB available space
- **Network:** 100Mbps bandwidth

### Recommended Production Setup
- **CPU:** 4+ cores
- **Memory:** 8GB+ RAM
- **Storage:** 50GB+ SSD
- **Load Balancer:** Nginx or cloud load balancer
- **SSL Certificate:** Let's Encrypt or commercial

## Database Deployment

### PostgreSQL Configuration
```sql
-- Production database setup
CREATE DATABASE messagewall_prod;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE messagewall_prod TO app_user;

-- Performance optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
```

### Database Migration
```bash
# Run migrations on production
mvn liquibase:update -Dspring.profiles.active=prod

# Verify migration status
mvn liquibase:status -Dspring.profiles.active=prod
```

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="messagewall_backup_$DATE.sql"

pg_dump -h localhost -U app_user messagewall_prod > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to cloud storage (AWS S3 example)
aws s3 cp $BACKUP_FILE.gz s3://backup-bucket/database/
```

## Application Configuration

### Production Environment Variables
```bash
# Backend Configuration
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://db-host:5432/messagewall_prod
export SPRING_DATASOURCE_USERNAME=app_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export SERVER_PORT=8080

# Frontend Configuration
export VITE_API_BASE_URL=https://api.yourdomain.com
export VITE_WS_URL=wss://api.yourdomain.com/ws/messages
```

### Spring Boot Production Config
```yaml
# application-prod.yml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate.format_sql: false

server:
  port: ${SERVER_PORT:8080}
  compression:
    enabled: true
  http2:
    enabled: true

logging:
  level:
    com.changrui.mysterious: INFO
    org.springframework.security: WARN
  file:
    name: logs/application.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## Security Configuration

### SSL/TLS Setup
```nginx
# Nginx configuration for SSL
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Security Headers
```yaml
# Spring Security configuration
security:
  headers:
    frame-options: DENY
    content-type-options: nosniff
    xss-protection: "1; mode=block"
    referrer-policy: strict-origin-when-cross-origin
```

## Monitoring and Logging

### Application Monitoring
```yaml
# Actuator configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

### Log Aggregation
```bash
# ELK Stack setup (optional)
# Elasticsearch for log storage
# Logstash for log processing
# Kibana for log visualization

# Fluentd alternative
# Collect logs from all containers
# Forward to centralized logging service
```

### Health Checks
```bash
# Application health endpoint
curl https://api.yourdomain.com/actuator/health

# Database connectivity check
curl https://api.yourdomain.com/actuator/health/db

# Custom health indicators
curl https://api.yourdomain.com/actuator/health/custom
```

## Performance Optimization

### Backend Optimization
```yaml
# JVM tuning
JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Connection pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# Cache configuration
spring.cache.type=redis
spring.redis.host=redis-host
spring.redis.port=6379
```

### Frontend Optimization
```javascript
// vite.config.ts production optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber'],
          ui: ['framer-motion', 'gsap']
        }
      }
    },
    minify: 'terser',
    sourcemap: false
  },
  server: {
    host: true,
    port: 80
  }
});
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd client && npm ci
          cd ../server && mvn dependency:resolve
      - name: Run tests
        run: |
          cd client && npm test
          cd ../server && mvn test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Deploy script
          ssh user@server 'cd /app && git pull && docker-compose up -d --build'
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Build and deploy services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Health check
if curl -f http://localhost:8080/actuator/health; then
    echo "Deployment successful!"
else
    echo "Deployment failed - rolling back..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi
```

## Scaling Considerations

### Horizontal Scaling
```yaml
# Docker Compose with multiple instances
services:
  server:
    build: ./server
    deploy:
      replicas: 3
    environment:
      SPRING_PROFILES_ACTIVE: prod

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - server
```

### Database Scaling
```bash
# Read replica setup
# Primary database for writes
# Read replicas for read operations

# Connection string example
jdbc:postgresql://primary-host:5432,replica1-host:5432,replica2-host:5432/messagewall
```

## Disaster Recovery

### Backup Strategy
1. **Database Backups:** Daily automated backups
2. **File Backups:** Weekly application backups
3. **Configuration Backups:** Version control for configs
4. **Recovery Testing:** Monthly recovery drills

### Recovery Procedures
```bash
# Database recovery
pg_restore -h localhost -U app_user -d messagewall_prod backup_file.sql

# Application recovery
docker-compose down
docker-compose up -d --force-recreate
```

## Troubleshooting

### Common Deployment Issues
1. **Database Connection:** Check network connectivity and credentials
2. **Port Conflicts:** Ensure ports are available
3. **Memory Issues:** Monitor JVM heap size
4. **SSL Certificate:** Verify certificate validity and paths

### Monitoring Commands
```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Application logs
docker-compose logs -f server
docker-compose logs -f client

# Database connections
SELECT * FROM pg_stat_activity WHERE datname = 'messagewall_prod';
```
