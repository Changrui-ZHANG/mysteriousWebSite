# Coding Standards & Architecture Guidelines

> **Version**: 1.0  
> **Last Updated**: 2024-12-27  
> **Status**: Active

This document defines the technical standards for the **Mysterious Web Site** frontend. It serves as the single source of truth for code quality, architecture, and maintainability.

---

## 1. Core Architecture Principles

### **Modularity & Separation of Concerns**
-   **Atomic Design Inspiration**: Organize components by complexity and scope.
    -   `components/ui/`: **Atoms/Molecules**. Pure, dumb UI components (Buttons, Inputs, Cards). No business logic.
    -   `components/[feature]/`: **Organisms**. Domain-specific components that compose UI atoms (e.g., `components/cv/ExperienceCard`).
    -   `pages/`: **Templates/Pages**. Orchestrates layout and data fetching. Should be thin wrappers whenever possible.
-   **Single Responsibility**: A component should do one thing well. If it handles data fetching *and* complex rendering *and* user interaction, split it.

### **No Monoliths**
-   **Line Limit**: Soft limit of **250 lines** per file. Hard limit of 400.
-   **Refactoring Trigger**: If you need to scroll excessively to understand the component, refactor immediately.
-   **Extraction**: Move sub-components into the same directory or a `components/` subfolder if reused.

---

## 2. File Structure & Naming

### **Naming Conventions**
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LiquidSphere.tsx`, `UserProfile.tsx` |
| Hooks | camelCase + `use` prefix | `useScrollAnimation.ts` |
| Utils/Helpers | camelCase | `formatDate.ts`, `calculateDistance.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Types/Interfaces | PascalCase + suffix | `UserProps`, `ExperienceData` |

### **Directory Organization**
```
/src
├── api/           # API client, endpoints, request handlers
├── components/
│   ├── ui/        # Generic, reusable UI (Button, Modal, Card, GlassPanel)
│   ├── cv/        # CV page components (ExperienceCard, LiquidSphere)
│   ├── game/      # Game-related components (GravityPlayground, ScoreDisplay)
│   ├── audio/     # Audio controls (MuteButton)
│   └── [feature]/ # Other feature-specific components
├── constants/     # App-wide constants
├── data/          # Static content, mock data, generators
├── features/      # Feature modules (admin, auth, calendar, games, messages)
├── hooks/         # Custom React hooks
├── layouts/       # Page layouts (Navbar, Footer, Sidebar)
├── pages/         # Route components (thin orchestrators)
├── types/         # Shared TypeScript types
└── utils/         # Pure utility functions (no API calls)
```

---

## 3. TypeScript & Code Quality

### **Strict Typing**
-   **Never use `any`**. Use `unknown` if type is truly unknown, then narrow it.
-   **Interfaces over Types**: Prefer `interface` for object shapes (better extensibility, error messages).
-   **Props Interface**: Every component must define a `[Name]Props` interface.

```typescript
// ✅ Good
interface ExperienceCardProps {
    exp: Experience;
    isDarkMode: boolean;
}

// ❌ Bad
function ExperienceCard(props: any) { ... }
```

### **Nullability**
-   Use optional chaining (`?.`) and nullish coalescing (`??`) for safe access.
-   Avoid non-null assertions (`!`) unless absolutely certain.

---

## 4. State Management

### **Local vs Global**
| Scope | Solution | Example |
|-------|----------|---------|
| Component UI | `useState` | Modal open/close, input value |
| Shared (2-3 levels) | Lift state up | Form data in parent |
| App-wide | Context | Theme, Auth, Language |
| Server state | React Query / SWR | API data caching |

### **Rules**
-   **Prop Drilling Limit**: If passing props > 3 levels deep, use Context.
-   **Avoid Redundant State**: Derive values where possible instead of storing.

---

## 5. Error Handling & Logging

### **Error Boundaries**
-   Wrap major sections in Error Boundaries to prevent full app crashes.
-   Display user-friendly fallback UI.

### **API Errors**
-   Always handle loading, success, and error states explicitly.
-   Log errors to console in development; consider external logging in production.

```typescript
try {
    const data = await fetchData();
} catch (error) {
    console.error('[API Error]', error);
    // Show user-friendly message
}
```

---

## 6. Performance & Optimization

### **Memoization**
-   `useMemo`: Expensive calculations, derived data.
-   `useCallback`: Functions passed to optimized child components.
-   `React.memo`: Wrap pure components that receive stable props.

### **Code Splitting**
-   Lazy load heavy routes: `React.lazy(() => import('./HeavyPage'))`.
-   Lazy load 3D assets, large images.

### **Asset Optimization**
-   Compress images (WebP preferred).
-   Optimize 3D models (reduce polygon count, use GLTF).

---

## 7. UI, Styling & Accessibility

### **Tailwind CSS**
-   Use utility classes for layout and spacing.
-   Extract repeated patterns into reusable components rather than custom CSS.

### **Theming**
-   **Dark/Light Mode**: All components **must** support both modes via `isDarkMode` prop or context.
-   Test both modes before marking complete.

### **Responsive Design**
-   **Mobile-First**: Design for `sm` first, add breakpoints for larger screens.
-   Test on 320px, 768px, 1024px, 1440px viewports.

### **Accessibility (a11y)**
-   Semantic HTML: Use `<button>`, `<nav>`, `<main>`, `<section>` appropriately.
-   **ARIA**: Add `aria-label`, `aria-describedby` for interactive elements.
-   **Keyboard Navigation**: All interactive elements must be focusable and operable via keyboard.
-   **Color Contrast**: Ensure WCAG 2.1 AA compliance.

---

## 8. Internationalization (i18n)

-   **No Hardcoded Text**: All user-facing text must use `t('key')` from `react-i18next`.
-   **Hierarchical Keys**: `home.hero.title`, `cv.experience.role`.
-   **Pluralization**: Use i18next's pluralization for quantities.

---

## 9. Git & Version Control

### **Branch Naming**
-   `feature/[ticket-id]-short-description`
-   `fix/[ticket-id]-short-description`
-   `refactor/[scope]-description`

### **Commit Messages**
Follow Conventional Commits:
```
feat(cv): add experience card component
fix(auth): resolve token refresh loop
refactor(ui): extract GlassPanel from CVPage
```

---

## 10. Testing (Future)

-   **Unit Tests**: Test utility functions and hooks.
-   **Component Tests**: Use React Testing Library.
-   **E2E Tests**: Playwright or Cypress for critical user flows.

---

## 11. Security

-   **Sanitize Inputs**: Never trust user input.
-   **Environment Variables**: Store secrets in `.env`, never commit them.
-   **Dependencies**: Regularly audit with `npm audit`.

---

## 12. Review Checklist

Before marking a task as complete, verify:

- [ ] **Modularity**: Is the file < 250 lines? Is it focused on one responsibility?
- [ ] **Types**: Are all props and data typed? No `any`?
- [ ] **Responsive**: Tested on mobile and desktop?
- [ ] **Theming**: Works in both Dark and Light modes?
- [ ] **i18n**: All text localized?
- [ ] **Accessibility**: Keyboard navigable? Semantic HTML?
- [ ] **Error Handling**: API errors handled gracefully?

---

## Appendix: Quick Reference

### Imports Order
```typescript
// 1. React & Libraries
import { useState, useEffect } from 'react';
import gsap from 'gsap';

// 2. Internal Absolute (data, hooks, utils)
import { getCVData } from '../data/cvData';
import { useTheme } from '../hooks/useTheme';

// 3. Components
import { GlassPanel } from '../components/ui/GlassPanel';

// 4. Types
import type { Experience } from '../types';

// 5. Styles (if any)
import './styles.css';
```

### Component Structure Template
```typescript
import { ... } from 'react';

interface ComponentProps {
    // Props
}

export function Component({ ... }: ComponentProps) {
    // 1. Hooks (state, refs, effects)
    // 2. Derived values
    // 3. Event handlers
    // 4. Render
    return (
        <div>
            ...
        </div>
    );
}
```
