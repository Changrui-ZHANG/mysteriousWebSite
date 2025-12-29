# Coding Standards & Architecture Guidelines

> **Version**: 3.1  
> **Status**: Active  
> **Scope**: Frontend — React.js, TypeScript, Tailwind CSS  
> **Audience**: Human developers & AI coding agents

This document defines the **single source of truth** for code quality, architecture, and maintainability.  
**All generated or written code MUST comply with these rules.**

---

## Core Philosophy

- Code must prioritize **readability and long-term maintainability** over premature optimization.
- Duplication is tolerated while a behavior is unstable.
- Abstractions must be **progressive** and justified by a clear gain in clarity or code reduction.
- Code must be **understandable without external context**.
- All code must be **automatically verified** before delivery.
- Any file must be **understandable in less than 30 seconds**.
- If not, it must be renamed, simplified, or split.

---

## File Size & Structure

- **No file may exceed 250 lines.**
- Files exceeding this limit **MUST** be split or refactored.
- If understanding a file requires excessive scrolling, refactoring is mandatory.

---

## Architecture Rules

- The project is organized **by feature**, not by technical type.
- Each feature owns its components, hooks, services, and types.
- Global directories are allowed **ONLY** for truly cross-feature logic.
- Global folders (`api`, `hooks`, `utils`, `types`) must contain **exclusively transversal code**.
- Feature-specific logic **MUST** remain inside the feature directory.

```
/src
├── api/              # Global API client, HTTP utilities
├── components/ui/    # Global reusable UI components
├── hooks/            # Global cross-feature hooks
├── types/            # Global shared types
├── utils/            # Global pure utility functions
├── features/
│   ├── auth/         # Feature: authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── messages/     # Feature: messaging
│   └── games/        # Feature: games
├── layouts/          # App layouts (Navbar, Footer)
├── pages/            # Route entry points (thin wrappers)
└── constants/        # Global constants (endpoints, config, storage keys)
```

---

## Constants & Configuration

- Constants **MUST** be placed in `constants/` directory for global values.
- Feature-specific constants belong in the feature directory.
- Constant names **MUST** use `UPPER_SNAKE_CASE`.
- Constants **MUST** be typed explicitly.
- Related constants **MUST** be grouped in objects or files.

```typescript
// ✅ Good: Global constants
// constants/endpoints.ts
export const API_ENDPOINTS = {
    MESSAGES: '/api/messages',
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
    },
} as const;

// ✅ Good: Feature-specific constants
// features/games/constants.ts
export const GAME_CONFIG = {
    MAX_SCORE: 1000,
    TIME_LIMIT: 300,
} as const;

// ❌ Bad: Magic numbers/strings scattered
if (status === 'pending') { }  // 'pending' should be a constant
```

---

## React Router & Navigation

- Routes **MUST** be defined in `App.tsx` or a dedicated routes file.
- Route components are **thin wrappers** that pass props to feature components.
- Navigation links **MUST** use `react-router-dom`'s `Link` component.
- Protected routes **MUST** check authentication before rendering.
- Route paths **MUST** use kebab-case: `/user-profile`, `/game-settings`.

```typescript
// ✅ Good: Route definition
<Route 
    path="/messages" 
    element={
        isEnabled('PAGE_MESSAGES_ENABLED') 
            ? <MessageWall {...props} />
            : <MaintenancePage />
    } 
/>

// ✅ Good: Protected route pattern
const ProtectedRoute = ({ children, requiresAuth }) => {
    const { user } = useAuth();
    if (requiresAuth && !user) return <Navigate to="/login" />;
    return children;
};

// ❌ Bad: Direct window.location
window.location.href = '/messages';  // Use navigate() instead
```

---

## React Components

React components are responsible **ONLY** for:
- Rendering UI
- Managing local UI state
- Handling user interactions

Components **MUST NOT**:
- Contain business logic
- Contain complex validation rules
- Perform direct API calls

All business logic is delegated to **hooks**, **services**, or **pure functions**.

---

## Props Rules

- Props **MUST** be destructured in function signature.
- Default values use destructuring defaults, not `||`.
- Callback props start with `on` prefix: `onClick`, `onSubmit`, `onDelete`.

```typescript
// ✅ Good
function Button({ label, size = 'md', onClick }: ButtonProps) { }

// ❌ Bad
function Button(props: ButtonProps) {
    const size = props.size || 'md';
}
```

---

## Form Handling

- Forms **MUST** be controlled components using `useState` or form libraries.
- Validation **MUST** be performed before submission.
- Error states **MUST** be displayed clearly to users.
- Loading states **MUST** prevent multiple submissions.
- Form submission **MUST** use `e.preventDefault()`.

```typescript
// ✅ Good: Controlled form with validation
function LoginForm({ onSubmit }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError(t('form.email_required'));
            return;
        }

        setLoading(true);
        try {
            await onSubmit(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('form.submit_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}
            <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />
            <button type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('form.submit')}
            </button>
        </form>
    );
}

// ❌ Bad: Uncontrolled form
<form onSubmit={() => {
    const email = document.getElementById('email').value;
    submit(email);
}}>
```

**Validation Rules:**
- Client-side validation is for **UX**, never for security.
- Server validation errors **MUST** be displayed to users.
- Form fields **MUST** have proper `label` and `aria-label` attributes.

---

## Conditional Rendering

- Use **early returns** for guard clauses.
- **Avoid nested ternaries** (max 1 level).
- Extract complex conditions into **named variables**.

```typescript
// ✅ Good: Early return
if (!user) return <LoginPrompt />;
return <Dashboard user={user} />;

// ✅ Good: Named condition
const canEdit = isOwner && !isLocked;
{canEdit && <EditButton />}

// ❌ Bad: Nested ternary
{isLoading ? <Spinner /> : error ? <Error /> : <Content />}
```

---

## Hooks & Logic Encapsulation

- All reusable logic **MUST** be implemented in custom hooks.
- Hooks **MUST** start with the `use` prefix.
- Hooks encapsulate **logic, orchestration, and side effects**.
- Hooks **MUST** return an object, not an array, except for hooks intentionally mimicking React APIs (e.g. useState-like patterns).

```typescript
// ✅ Good: Returns object
function useMessages() {
    return { messages, sendMessage, deleteMessage };
}

// ❌ Bad: Returns array (except for useState-like patterns)
function useMessages() {
    return [messages, sendMessage];
}
```

---

## Refs (useRef, forwardRef)

- Refs are used **ONLY** when direct DOM access is necessary.
- Common use cases: focus management, imperative animations, third-party library integration, measuring DOM elements.
- Refs **MUST NOT** be used to store mutable values that don't trigger re-renders (prefer `useState`).
- Ref variables **MUST** use the `Ref` suffix: `inputRef`, `containerRef`.

```typescript
// ✅ Good: DOM access for focus
function SearchInput() {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return <input ref={inputRef} />;
}

// ✅ Good: forwardRef for reusable components
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, ...props }, ref) => (
        <button ref={ref} {...props}>{children}</button>
    )
);

// ❌ Bad: Ref used as state storage
const countRef = useRef(0);  // Use useState instead
countRef.current += 1;
```

---

## useEffect Rules

`useEffect` is a **coordination mechanism**, not a place for business logic.

**Purpose:**
- Each `useEffect` **MUST** have a single, clearly identifiable purpose.
- If the purpose cannot be explained in **one short sentence**, the effect is too complex and must be refactored.

**Business Logic:**
- Business rules, data transformations, and decision logic **MUST** live outside `useEffect`.
- `useEffect` is **ONLY** responsible for triggering side effects: data fetching, subscriptions, timers, synchronization with external systems.

**Dependencies:**
- Dependencies **MUST** always be explicit and exhaustive.
- Disabling `exhaustive-deps` is **forbidden** unless a written justification is present and the effect is provably safe.

**Separation:**
- Multiple unrelated side effects **MUST NOT** be grouped in the same `useEffect`.
- Separate effects for separate concerns.

**Cleanup:**
- Cleanup functions are **mandatory** for subscriptions, listeners, intervals, and observers.
- Effects without cleanup must be justified by their lifecycle.

**Derived State:**
- If `useEffect` is used to derive state from other state, it is a **design error**.
- Derived values must be computed synchronously or memoized, not stored in state.

**Intentionality:**
- An effect must **never** run "just because it works".
- Trigger conditions and lifecycle must be intentional, predictable, and understandable within seconds.

```typescript
// ✅ Good: Single purpose, clear cleanup
useEffect(() => {
    const subscription = messageService.subscribe(onNewMessage);
    return () => subscription.unsubscribe();
}, [onNewMessage]);

// ✅ Good: Derived value via useMemo, not useEffect
const filteredMessages = useMemo(
    () => messages.filter(m => m.isVisible),
    [messages]
);

// ❌ Bad: Derived state in useEffect
useEffect(() => {
    setFilteredMessages(messages.filter(m => m.isVisible));
}, [messages]);

// ❌ Bad: Multiple concerns in one effect
useEffect(() => {
    fetchMessages();
    trackPageView();
    setupWebSocket();
}, []);
```

---

## Services & API Layer

- All API calls and external interactions are **isolated in dedicated services**.
- Components **MUST NEVER** communicate directly with an API.
- Services contain **no UI or presentation logic**.

---

## Error Handling

- All async operations **MUST** have explicit error handling.
- User-facing errors **MUST** be translated (i18n).
- Error boundaries **MUST** wrap major sections.
- **Never swallow errors silently.**

---

## Error Boundaries

- Error boundaries **MUST** be class components (or use a library that provides functional error boundaries).
- Error boundaries **MUST** be placed at strategic points in the component tree.
- Error boundaries **MUST** provide fallback UI and error reporting.
- Error boundaries **MUST NOT** catch errors in event handlers, async code, or SSR.

**Placement Guidelines:**
- Wrap route-level components in `App.tsx`.
- Wrap feature sections that should fail independently.
- Wrap third-party component libraries.

```typescript
// ✅ Good: Error boundary implementation
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Report to error tracking service
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

// ✅ Good: Strategic placement
<ErrorBoundary>
    <Routes>
        <Route path="/messages" element={<MessageWall />} />
    </Routes>
</ErrorBoundary>
```

---

## Loading States

- Loading states **MUST** provide clear visual feedback to users.
- Loading states **MUST** prevent user actions that would conflict (e.g., multiple submissions).
- Skeleton screens are preferred over spinners for content loading.
- Loading states **MUST** be accessible (use `aria-live` regions).

```typescript
// ✅ Good: Skeleton for content loading
function MessageList({ messages, isLoading }: MessageListProps) {
    if (isLoading) {
        return <MessageListSkeleton count={5} />;
    }
    return <div>{messages.map(renderMessage)}</div>;
}

// ✅ Good: Disabled state during submission
<button type="submit" disabled={isSubmitting}>
    {isSubmitting ? <Spinner /> : t('form.submit')}
</button>

// ✅ Good: Inline loading indicator
{isLoading && <div aria-live="polite" aria-label={t('common.loading')}>
    <LoadingSpinner />
</div>}

// ❌ Bad: No loading feedback
async function handleSubmit() {
    await submitData();  // User doesn't know it's processing
}
```

---

## TypeScript Rules

- TypeScript **strict mode** is mandatory.
- **Forbidden**:
  - `any`
  - Forced casts without validation
  - Non-null assertions except when explicitly justified
- Types must be **explicit, named, and stable**.
- **Union types** are preferred over enums.
- **Interfaces** are preferred for object shapes.
- Each component **MUST** define a `[Name]Props` interface.

```typescript
// ✅ Good
type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

interface MessageItemProps {
    msg: Message;
    onDelete: (id: string) => void;
}

// ❌ Bad
enum GameStatus { Idle, Playing }  // Use union type instead
function process(data: any) { }    // any is forbidden
```

---

## State Management

- Local UI state uses `useState`.
- Complex UI logic uses `useReducer`.
- Global state is introduced **ONLY** when clearly justified.
- **Redundant state is forbidden** — derive values when possible.

---

## Context API

- Context **MUST** be used **ONLY** for truly global state that needs to be accessed by many components.
- Context **MUST NOT** be used as a replacement for prop drilling when props are passed through 2-3 levels.
- Context providers **MUST** be placed as close to consumers as possible.
- Context values **MUST** be memoized to prevent unnecessary re-renders.
- Context files **MUST** export both the Context and a custom hook for consumption.

```typescript
// ✅ Good: Memoized context value
interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    
    const value = useMemo(
        () => ({ theme, setTheme }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

// ❌ Bad: Non-memoized context value
const value = { theme, setTheme };  // Creates new object on every render
```

**Context Usage Guidelines:**
- Split contexts by concern (e.g., `AuthContext`, `ThemeContext`, not `AppContext`).
- Avoid storing frequently changing values in context (use state management libraries instead).

---

## Tailwind CSS Usage

- Tailwind CSS is used in a **controlled manner**.
- Inline utilities are allowed **ONLY** for layout and simple structure.
- Recurring UI patterns **MUST** be extracted using `@apply`.
- `@apply` **MUST NOT** recreate a traditional CSS system.
- Component variants **MUST** be handled using `cva` or equivalent.
- **Manual complex class concatenation is forbidden.**
- **Inline style attributes are forbidden** except for truly dynamic values.

```typescript
// ✅ Good: Using cva for variants
const buttonVariants = cva("btn", {
    variants: {
        intent: { primary: "btn-primary", secondary: "btn-secondary" },
        size: { sm: "text-sm px-2", lg: "text-lg px-4" }
    }
});

// ❌ Bad: Manual concatenation
className={`btn ${isPrimary ? 'btn-primary' : ''} ${isLarge ? 'px-4' : 'px-2'}`}

// ❌ Bad: Inline styles for static values
style={{ backgroundColor: 'blue', padding: '16px' }}
```

---

## CSS Variables

- Variable names **MUST** reflect purpose, not value.
- ✅ `--color-accent-primary` (adapts to theme)
- ✅ `--color-accent-cyan` (always cyan)
- ❌ `--color-accent-blue: black` (misleading)

---

## UI Components

- Any UI component used in **more than one place with identical intent** MUST be extracted.
- Reusable UI components are **generic** and contain **no business logic**.
- Location: `components/ui/`

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `MessageItem`, `UserCard` |
| Hooks | `use` prefix | `useMessages`, `useAuth` |
| Functions | Action + intent | `fetchMessages`, `validateEmail` |
| Types/Interfaces | PascalCase | `MessageProps`, `GameStatus` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS`, `MAX_RETRIES` |
| Refs | `Ref` suffix | `inputRef`, `containerRef` |
| Event handlers | `on` prefix | `onClick`, `onSubmit`, `onDelete` |
| Boolean props | `is`/`has` prefix | `isVisible`, `hasError` |

- **Generic or ambiguous names are forbidden**: `data`, `info`, `handle`, `process`.

---

## Comments

- Comments explain **WHY**, never **WHAT**.
- Redundant comments are forbidden.
- If code requires a comment to be understood, **refactor it**.

```typescript
// ✅ Good: Explains WHY
// Delay reconnection to prevent server overload during mass disconnects
const RECONNECT_DELAY = 5000;

// ❌ Bad: Explains WHAT (obvious from code)
// Set delay to 5000
const RECONNECT_DELAY = 5000;
```

---

## Testing Strategy

- Tests focus on **logic**, not rendering.
- **Hooks, services, utilities, and business rules** MUST be tested.
- Component rendering tests are allowed **ONLY** for critical behavior or accessibility.

---

## Internationalization (i18n)

- **Hardcoded user-facing text is forbidden.**
- All text **MUST** use `react-i18next`.
- All language files **MUST** share identical structure.
- Supported languages: **EN, FR, ZH**.

---

## Accessibility & UI Quality

- **Semantic HTML** is mandatory.
- **Keyboard navigation** is required.
- **ARIA attributes** must be used when needed.
- **WCAG 2.1 AA** color contrast compliance is required.
- **Light and Dark mode** support is mandatory.

---

## Performance Optimization

Performance optimization **MUST** be applied **ONLY** when there is a measurable performance issue. Premature optimization is forbidden.

### useMemo

Use `useMemo` **ONLY** when:
- Computing expensive derived values from props/state.
- Preventing object/array recreation in dependency arrays.
- Memoizing values passed to context providers.

```typescript
// ✅ Good: Expensive computation
const sortedMessages = useMemo(
    () => messages.sort((a, b) => b.timestamp - a.timestamp),
    [messages]
);

// ✅ Good: Preventing object recreation
const apiOptions = useMemo(
    () => ({ headers: { Authorization: token } }),
    [token]
);

// ❌ Bad: Simple computation doesn't need memoization
const doubled = useMemo(() => count * 2, [count]);  // Unnecessary
```

### useCallback

Use `useCallback` **ONLY** when:
- Passing functions as dependencies to other hooks (`useEffect`, `useMemo`).
- Preventing re-renders of memoized child components.
- Stabilizing function references for context values.

```typescript
// ✅ Good: Stable callback for useEffect dependency
const handleMessageUpdate = useCallback((id: string, text: string) => {
    updateMessage(id, text);
}, [updateMessage]);

useEffect(() => {
    socket.on('messageUpdate', handleMessageUpdate);
    return () => socket.off('messageUpdate', handleMessageUpdate);
}, [handleMessageUpdate]);

// ✅ Good: Memoized child component
const MemoizedButton = React.memo(Button);

function Parent() {
    const handleClick = useCallback(() => {
        // handler logic
    }, []);
    
    return <MemoizedButton onClick={handleClick} />;
}

// ❌ Bad: Callback used only in JSX doesn't need memoization
const handleClick = useCallback(() => setCount(c => c + 1), []);
return <button onClick={handleClick}>Click</button>;  // Unnecessary
```

### React.memo

Use `React.memo` **ONLY** when:
- Component re-renders frequently with the same props.
- Component is expensive to render (complex calculations, large lists).
- Component is rendered by parent components that re-render often.

```typescript
// ✅ Good: Expensive list item component
const MessageItem = React.memo(function MessageItem({ message, onDelete }: MessageItemProps) {
    // Complex rendering logic
    return <div>{/* ... */}</div>;
});

// ❌ Bad: Simple component doesn't need memoization
const Button = React.memo(function Button({ label }: ButtonProps) {
    return <button>{label}</button>;
});  // Unnecessary overhead
```

**Optimization Rules:**
- **Measure first** — use React DevTools Profiler to identify bottlenecks.
- **Code splitting** **MUST** be applied for heavy routes: `React.lazy(() => import('./HeavyPage'))`.
- **Never optimize** without evidence of a performance problem.

---

## Import Order

Imports follow a strict order:
1. React & external libraries
2. Internal hooks & services
3. Components
4. Types (with `type` keyword)
5. Styles

**Blank line between each group.**

```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useMessages } from '../hooks/useMessages';
import { messageService } from '../services/messageService';

import { Button } from '../components/ui/Button';

import type { Message } from '../types';

import './styles.css';
```

---

## Security

- **Never trust user input.**
- Secrets in `.env` only, **never committed**.
- Run `npm audit` regularly.
- **Sanitize all dynamic content.**

---

## Asset Management

- Assets (images, fonts, icons) **MUST** be placed in `public/` for static assets or imported directly for processed assets.
- Image imports **MUST** use explicit paths: `import logo from './assets/logo.png'`.
- Large assets **MUST** be optimized before inclusion.
- Font files **MUST** be loaded via CSS `@font-face` or in `index.css`.
- Asset file names **MUST** use kebab-case: `hero-image.png`, `icon-check.svg`.

```typescript
// ✅ Good: Direct import (processed by Vite)
import logo from '../assets/logo.svg';
import heroImage from '../assets/hero-image.jpg';

function Header() {
    return <img src={logo} alt="Logo" />;
}

// ✅ Good: Static assets in public/
<img src="/images/static-image.png" alt="Static" />

// ❌ Bad: Hardcoded paths to src/
<img src="../assets/logo.png" />  // Won't work in production
```

**Asset Organization:**
```
public/
├── images/          # Static images referenced by URL
├── fonts/           # Web fonts
└── icons/           # Static icons

src/
└── assets/          # Processed assets (imported in code)
    ├── images/
    └── icons/
```

---

## Automated Validation

- **ESLint**, **Prettier**, **TypeScript build**, and **tests** are mandatory.
- **No code may be merged** if any check fails.

```bash
npm run lint      # ESLint
npm run build     # TypeScript + Vite
npm run test      # Tests
```

---

## AI Coding Rules

AI agents **MUST**:
- Follow existing structure
- Respect naming conventions
- Avoid unsolicited abstractions
- Never bypass TypeScript safety
- Never add dependencies without justification
- Prefer clarity over cleverness

---

## Final Rule

> **If the code is not understandable in less than 30 seconds, it is not acceptable.**
