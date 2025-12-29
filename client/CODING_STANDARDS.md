# Coding Standards & Architecture Guidelines

> **Version**: 3.0  
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
└── pages/            # Route entry points (thin wrappers)
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

## Performance Rules

- Optimize **ONLY** when justified.
- Use `useMemo`, `useCallback`, and `React.memo` appropriately.
- Apply **code splitting** for heavy routes and assets.

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
