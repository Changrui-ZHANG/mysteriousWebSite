# API Contracts - Server Backend

## Overview
This document describes the REST API endpoints and WebSocket contracts for the Mysterious Website backend.

## Base URL
```
http://localhost:8080
```

## Authentication
- Admin operations require `adminCode` parameter
- User verification based on user existence

## API Endpoints

### Messages API (`/api/messages`)

#### Get All Messages
```http
GET /api/messages
```

**Response:**
- Headers: `X-System-Muted` (boolean)
- Body: `Message[]` array

**Message Model:**
```json
{
  "id": "string",
  "userId": "string", 
  "name": "string",
  "message": "string",
  "timestamp": "long",
  "isAnonymous": "boolean",
  "isVerified": "boolean",
  "quotedMessageId": "string|null",
  "quotedName": "string|null", 
  "quotedMessage": "string|null"
}
```

#### Create Message
```http
POST /api/messages?adminCode={optional}
Content-Type: application/json

{
  "id": "string",
  "userId": "string",
  "name": "string", 
  "message": "string",
  "timestamp": "long",
  "isAnonymous": "boolean",
  "quotedMessageId": "string|null"
}
```

**Response:** `ApiResponse<Message>`

#### Toggle Mute
```http
POST /api/messages/toggle-mute?adminCode={required}
```

**Response:** `ApiResponse<Boolean>`

#### Delete Message
```http
DELETE /api/messages/{id}?userId={required}&adminCode={optional}
```

**Response:** `ApiResponse<Void>`

#### Clear All Messages
```http
POST /api/messages/clear?adminCode={required}
```

**Response:** `ApiResponse<Void>`

### Game APIs

#### Game Status (`/api/game-status`)
- Get/Set game enabled status
- Toggle game functionality

#### Scores (`/api/scores`) 
- Submit and retrieve high scores
- Score leaderboard functionality

#### Brick Breaker (`/api/brick-breaker`)
- Game-specific endpoints for brick breaker game

#### Maze (`/api/maze`)
- Maze game endpoints

### User Management (`/api/users`)

#### Authentication (`/api/auth`)
- User login/logout
- Session management

#### User Preferences (`/api/user-preferences`)
- User settings and preferences

#### User Management (`/api/user-management`)
- Admin user management

### Other APIs

#### Calendar (`/api/calendar-config`)
- Calendar configuration

#### Notes (`/api/notes`)
- Note management

#### Suggestions (`/api/suggestions`)
- Suggestion system with comments

#### Vocabulary (`/api/vocabulary`)
- Vocabulary management

#### System Settings (`/api/settings`)
- System configuration

## WebSocket Contracts

### Message WebSocket (`/ws/messages`)
Real-time message updates:

**Message Events:**
- `newMessage` - New message posted
- `deleteMessage` - Message deleted  
- `clearAll` - All messages cleared
- `muteStatus` - Chat mute status changed

**Connection:** WebSocket endpoint at `/ws/messages`
**Protocol:** STOMP over SockJS

## Data Models

### Core Entities

#### Message
- Table: `messages`
- Primary Key: `id` (String)
- Fields: userId, name, message, timestamp, isAnonymous, isVerified, quotedMessageId, quotedName, quotedMessage

#### Game Status
- Game enabled/disabled state
- Per-game configuration

#### Score  
- Game scores with user attribution
- High score tracking

#### User
- User accounts and preferences
- Authentication state

#### Suggestion
- Suggestion system with comments
- Voting/rating capabilities

## Error Responses

All endpoints return `ApiResponse<T>` format:

```json
{
  "success": "boolean",
  "message": "string", 
  "data": "T|null"
}
```

**Error Status Codes:**
- `401 Unauthorized` - Invalid admin code or permissions
- `404 Not Found` - Resource not found
- `400 Bad Request` - Invalid input data

## Integration Points

### Client Integration
- Base URL: `http://localhost:8080/api/*`
- WebSocket: `ws://localhost:8080/ws/messages`
- Real-time updates via WebSocket

### Database Integration
- PostgreSQL database
- JPA/Hibernate ORM
- Liquibase migrations

### External Services
- Docker containerization
- Environment-based configuration
