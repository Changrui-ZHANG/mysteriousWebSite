# Data Models - Server Backend

## Overview
This document describes the database schema and data models for the Mysterious Website backend.

## Database Configuration
- **Database:** PostgreSQL
- **ORM:** JPA/Hibernate
- **Migrations:** Liquibase
- **Database Name:** `messagewall`
- **User:** `postgres`
- **Password:** `postgres`
- **Port:** `5432`

## Entity Models

### Message Entity
**Table:** `messages`

```java
@Entity
@Table(name = "messages")
public class Message {
    @Id
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 500)
    private String message;
    
    @Column(nullable = false)
    private long timestamp;
    
    @Column(name = "is_anonymous", nullable = false, columnDefinition = "boolean default false")
    private boolean isAnonymous;
    
    @Column(name = "is_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isVerified;
    
    @Column(name = "quoted_message_id")
    private String quotedMessageId;
    
    @Column(name = "quoted_name")
    private String quotedName;
    
    @Column(name = "quoted_message", length = 500)
    private String quotedMessage;
}
```

**Fields:**
- `id` (String, Primary Key) - Unique message identifier
- `userId` (String, Not Null) - User who posted the message
- `name` (String, Not Null) - Display name of the user
- `message` (String, Not Null, Max 500 chars) - Message content
- `timestamp` (Long, Not Null) - Unix timestamp of message creation
- `isAnonymous` (Boolean, Default false) - Whether message is anonymous
- `isVerified` (Boolean, Default false) - Whether user is verified
- `quotedMessageId` (String, Nullable) - ID of quoted message
- `quotedName` (String, Nullable) - Name of quoted user
- `quotedMessage` (String, Nullable, Max 500 chars) - Content of quoted message

### Game Status Entity
**Table:** `game_status`

```java
@Entity
public class GameStatus {
    @Id
    private String gameType;
    
    @Column(nullable = false)
    private boolean enabled;
    
    @Column(name = "last_updated")
    private long lastUpdated;
}
```

**Fields:**
- `gameType` (String, Primary Key) - Type of game (brick-breaker, maze, etc.)
- `enabled` (Boolean, Not Null) - Whether game is enabled
- `lastUpdated` (Long) - Last update timestamp

### Score Entity
**Table:** `scores`

```java
@Entity
public class Score {
    @Id
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "game_type", nullable = false)
    private String gameType;
    
    @Column(nullable = false)
    private long score;
    
    @Column(name = "achieved_at", nullable = false)
    private long achievedAt;
    
    @Column(name = "is_high_score", nullable = false)
    private boolean isHighScore;
}
```

**Fields:**
- `id` (String, Primary Key) - Unique score identifier
- `userId` (String, Not Null) - User who achieved the score
- `gameType` (String, Not Null) - Type of game
- `score` (Long, Not Null) - Score value
- `achievedAt` (Long, Not Null) - When score was achieved
- `isHighScore` (Boolean, Not Null) - Whether this is a high score

### Suggestion Entity
**Table:** `suggestions`

```java
@Entity
public class Suggestion {
    @Id
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at", nullable = false)
    private long createdAt;
    
    @Column(name = "updated_at")
    private long updatedAt;
    
    @Column(nullable = false)
    private boolean active;
}
```

**Fields:**
- `id` (String, Primary Key) - Unique suggestion identifier
- `userId` (String, Not Null) - User who created suggestion
- `title` (String, Not Null) - Suggestion title
- `description` (Text) - Detailed description
- `createdAt` (Long, Not Null) - Creation timestamp
- `updatedAt` (Long) - Last update timestamp
- `active` (Boolean, Not Null) - Whether suggestion is active

### Suggestion Comment Entity
**Table:** `suggestion_comments`

```java
@Entity
public class SuggestionComment {
    @Id
    private String id;
    
    @Column(name = "suggestion_id", nullable = false)
    private String suggestionId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String comment;
    
    @Column(name = "created_at", nullable = false)
    private long createdAt;
}
```

**Fields:**
- `id` (String, Primary Key) - Unique comment identifier
- `suggestionId` (String, Not Null) - Parent suggestion ID
- `userId` (String, Not Null) - User who wrote comment
- `comment` (String, Not Null) - Comment content
- `createdAt` (Long, Not Null) - Comment timestamp

### Chat Setting Entity
**Table:** `chat_settings`

```java
@Entity
public class ChatSetting {
    @Id
    private String settingKey;
    
    @Column(nullable = false)
    private String value;
    
    @Column(name = "updated_at", nullable = false)
    private long updatedAt;
}
```

**Fields:**
- `settingKey` (String, Primary Key) - Setting identifier
- `value` (String, Not Null) - Setting value
- `updatedAt` (Long, Not Null) - Last update timestamp

### Calendar Config Entity
**Table:** `calendar_config`

```java
@Entity
public class CalendarConfig {
    @Id
    private String configKey;
    
    @Column(nullable = false)
    private String value;
    
    @Column(name = "updated_at", nullable = false)
    private long updatedAt;
}
```

**Fields:**
- `configKey` (String, Primary Key) - Configuration key
- `value` (String, Not Null) - Configuration value
- `updatedAt` (Long, Not Null) - Last update timestamp

## Repository Interfaces

### MessageRepository
```java
@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByOrderByTimestampDesc();
    List<Message> findByUserIdOrderByTimestampDesc(String userId);
    void deleteById(String id);
    void deleteAll();
}
```

### GameStatusRepository
```java
@Repository
public interface GameStatusRepository extends JpaRepository<GameStatus, String> {
    Optional<GameStatus> findByGameType(String gameType);
}
```

### ScoreRepository
```java
@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findByGameTypeOrderByScoreDesc(String gameType);
    List<Score> findByUserIdAndGameTypeOrderByScoreDesc(String userId, String gameType);
    List<Score> findByGameTypeAndIsHighScoreTrueOrderByScoreDesc(String gameType);
}
```

## Database Relationships

### Message Relationships
- No explicit foreign keys
- Quoted messages linked by `quotedMessageId`
- User verification handled via service layer

### Score Relationships
- Linked to users via `userId`
- Categorized by `gameType`

### Suggestion Relationships
- One-to-many with SuggestionComment via `suggestionId`
- User ownership via `userId`

## Migration Strategy

### Liquibase Configuration
- Migration files in `src/main/resources/db/changelog/`
- Version-controlled schema changes
- Rollback support

### Initial Schema Setup
```sql
-- Database setup command
psql -h localhost -U postgres -d messagewall -f setup_complete.sql
```

## Data Access Patterns

### Transaction Management
- Spring Boot `@Transactional` annotations
- Service layer manages transactions
- Repository layer handles CRUD operations

### Query Optimization
- Indexed primary keys
- Timestamp-based ordering for messages
- Game type categorization for scores

### Data Validation
- JPA validation annotations
- Custom validation in service layer
- Input sanitization for user content

## Security Considerations

### Data Protection
- User anonymity options
- Admin code verification
- Input validation and sanitization

### Access Control
- Role-based permissions
- Admin-only operations
- User verification system
