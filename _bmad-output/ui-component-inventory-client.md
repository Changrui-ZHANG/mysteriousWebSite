# UI Component Inventory - Client

## Overview
This document describes the UI components and structure of the React client application.

## Technology Stack
- **Framework:** React 18.2.0 with TypeScript
- **Build Tool:** Vite 5.0.8
- **Styling:** TailwindCSS 4.1.18
- **3D/Graphics:** Three.js 0.160.1, React Three Fiber 8.18.0
- **Animation:** GSAP 3.14.2, Framer Motion 10.18.0
- **Routing:** React Router DOM 7.10.1
- **Physics:** Matter.js 0.20.0
- **Real-time:** SockJS + STOMP WebSocket
- **Internationalization:** i18next

## Directory Structure

```
client/src/
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── domain/                # Domain-specific components
│   ├── calendar/          # Calendar functionality
│   ├── cv/               # CV/Resume components
│   ├── dashboard/        # Dashboard components
│   ├── game/             # Game components
│   ├── messagewall/      # Message wall components
│   ├── note/             # Note-taking components
│   ├── suggestions/      # Suggestion system
│   ├── user/             # User management
│   └── vocabulary/       # Vocabulary learning
├── shared/               # Shared utilities and components
├── styles/               # Global styles
├── i18n.ts              # Internationalization config
└── vite-env.d.ts        # Vite type definitions
```

## Domain Components

### Calendar Domain (`/domain/calendar/`)
**Purpose:** Calendar configuration and display
**Components:**
- Calendar configuration interface
- Date/time selection components
- Event management UI

### CV Domain (`/domain/cv/`)
**Purpose:** Resume/CV display and editing
**Components:**
- CV template components
- Section editors (experience, education, skills)
- Print-friendly layouts

### Dashboard Domain (`/domain/dashboard/`)
**Purpose:** Main application dashboard
**Components:**
- Dashboard layout
- Widget containers
- Navigation components
- Status indicators

### Game Domain (`/domain/game/`)
**Purpose:** Game functionality and interfaces
**Components:**
- **Brick Breaker Game:**
  - Game canvas with Three.js/React Three Fiber
  - Paddle controls
  - Brick collision detection
  - Score display
  - Game state management

- **Maze Game:**
  - Maze generation and rendering
  - Player movement controls
  - Path finding visualization
  - Timer and scoring

- **Game Management:**
  - Game selection interface
  - High score display
  - Game settings
  - Pause/resume controls

### Message Wall Domain (`/domain/messagewall/`)
**Purpose:** Real-time chat and messaging
**Components:**
- **Message Display:**
  - Message list with infinite scroll
  - Message bubbles with user info
  - Quote/reply functionality
  - Timestamp formatting

- **Message Input:**
  - Text input with character limit
  - Anonymous toggle
  - Emoji support
  - File attachment options

- **Real-time Features:**
  - WebSocket connection management
  - Live message updates
  - Online user count
  - Typing indicators

- **Moderation:**
  - Admin controls
  - Message deletion
  - Mute functionality
  - User verification

### Note Domain (`/domain/note/`)
**Purpose:** Note-taking and organization
**Components:**
- Note editor
- Category management
- Search and filtering
- Export functionality

### Suggestions Domain (`/domain/suggestions/`)
**Purpose:** Suggestion system with voting
**Components:**
- Suggestion creation form
- Suggestion listing
- Voting interface
- Comment system
- Status tracking

### User Domain (`/domain/user/`)
**Purpose:** User management and preferences
**Components:**
- Login/registration forms
- User profile
- Settings management
- Preference controls

### Vocabulary Domain (`/domain/vocabulary/`)
**Purpose:** Vocabulary learning system
**Components:**
- Flashcard interface
- Word definitions
- Progress tracking
- Quiz components

## Shared Components (`/shared/`)

### Utilities
- API client services
- WebSocket management
- Authentication helpers
- Date/time utilities
- Validation functions

### UI Components
- Button variants
- Form inputs
- Modal dialogs
- Loading indicators
- Error boundaries
- Layout components

### Styling
- TailwindCSS configuration
- Custom CSS variables
- Animation presets
- Responsive utilities

## Key Features

### 3D Graphics Integration
- **React Three Fiber:** 3D scene management
- **GSAP:** Advanced animations
- **Three.js:** 3D rendering engine
- **Physics:** Matter.js integration for game physics

### Real-time Communication
- **SockJS + STOMP:** WebSocket client
- **Message Broadcasting:** Live updates
- **Connection Management:** Reconnection logic
- **Event Handling:** Message routing

### Internationalization
- **i18next:** Translation framework
- **Language Detection:** Browser language detection
- **Namespace Organization:** Domain-specific translations
- **Dynamic Loading:** On-demand translation loading

### Animation System
- **Framer Motion:** Component animations
- **GSAP:** Complex timeline animations
- **CSS Transitions:** Simple UI animations
- **Performance Optimized:** Hardware acceleration

## Component Architecture

### State Management
- **React Context:** Global state management
- **Local State:** Component-level state
- **Server State:** API data synchronization
- **Real-time State:** WebSocket updates

### Data Flow
- **Props Down:** Parent to child communication
- **Events Up:** Child to parent communication
- **Context API:** Cross-component data sharing
- **Custom Hooks:** Reusable state logic

### Component Patterns
- **Container/Presentational:** Separation of concerns
- **Higher-Order Components:** Cross-cutting concerns
- **Render Props:** Flexible component composition
- **Custom Hooks:** Logic reuse

## Performance Considerations

### Code Splitting
- **Route-based:** Lazy loading per domain
- **Component-based:** Dynamic imports
- **Vendor splitting:** Third-party library optimization

### Optimization
- **Memoization:** React.memo, useMemo, useCallback
- **Virtualization:** Large list rendering
- **Image Optimization:** Lazy loading, compression
- **Bundle Analysis:** Size monitoring

### Caching Strategy
- **Service Worker:** Offline support
- **Browser Cache:** Static asset caching
- **API Caching:** Response memoization
- **State Persistence:** Local storage integration

## Development Workflow

### Component Development
- **TypeScript:** Type safety
- **ESLint:** Code quality
- **Prettier:** Code formatting
- **Hot Reload:** Development efficiency

### Testing Strategy
- **Unit Tests:** Component logic testing
- **Integration Tests:** Component interaction
- **E2E Tests:** User flow testing
- **Visual Regression:** UI consistency

### Build Process
- **Vite:** Fast development and building
- **TypeScript:** Compilation and type checking
- **TailwindCSS:** CSS optimization
- **Asset Optimization:** Image and font optimization
