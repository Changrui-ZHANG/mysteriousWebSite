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

### **File Naming Conventions**

| Category | File Name Convention | Example |
|----------|---------------------|---------|
| **Components** | PascalCase | `LiquidSphere.tsx`, `UserProfile.tsx` |
| **Pages** | PascalCase + `Page` suffix | `HomePage.tsx`, `CVPage.tsx` |
| **Layouts** | PascalCase | `Navbar.tsx`, `Footer.tsx` |
| **Hooks** | camelCase + `use` prefix | `useScrollAnimation.ts`, `useTheme.ts` |
| **Utils/Helpers** | camelCase | `formatDate.ts`, `calculateDistance.ts` |
| **API Clients** | camelCase + `Api` suffix (optional) | `pokeApi.ts`, `spaceTraders.ts` |
| **Type Files** | camelCase (domain name) | `calendar.ts`, `suggestions.ts` |
| **Data Files** | camelCase + `Data` suffix | `cvData.tsx`, `holidayData.ts` |
| **Constant Files** | camelCase (descriptive) | `endpoints.ts`, `authStorage.ts`, `calendarZones.ts` |
| **Barrel Files** | `index.ts` | `index.ts` |
| **Declaration Files** | kebab-case + `.d.ts` | `matter-extension.d.ts` |

### **Content Naming Conventions**

| Type | Convention | Example |
|------|------------|---------|
| Constants (values) | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProps`, `ExperienceData` |
| Functions | camelCase | `fetchJson`, `formatDate` |
| Variables | camelCase | `isDarkMode`, `currentUser` |

### **File Extension Rules**

| Extension | When to Use |
|-----------|-------------|
| `.tsx` | Files containing JSX (React components, data with icons) |
| `.ts` | Pure TypeScript (hooks, utils, types, API clients) |
| `.d.ts` | Type declaration files for external modules |

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
-   **Dark/Light Mode**: 
    -   **Rule**: Every new page or component **MUST** allow for seamless switching between Dark and Light modes from day one.
    -   **Implementation**: Pass `isDarkMode` prop or use the theme context.
    -   **Verification**: You must manually verify both modes before considering the task complete. No partial theming allowed.

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

### **General Rules**
-   **Strict No Hardcoded Text Rule**: It is strictly forbidden to have hardcoded text in JSX/TSX files.
-   **Implementation**: All user-facing text must use `t('key')` from `react-i18next`.
-   **Hierarchical Keys**: `section.element` or `section.subsection.element`.
-   **Pluralization**: Use i18next's pluralization for quantities.
-   **Supported Languages**: EN (fallback), FR, ZH
-   **Synchronization**: All language files **MUST** have identical structure and keys.

### **Translation File Organization**

Files location: `public/locales/{lang}/translation.json`

#### **Section Categories & Order**

Sections are organized by **category**, then **alphabetically within each category**:

| Priority | Category | Description | Examples |
|----------|----------|-------------|----------|
| 1 | `_common` | Shared/reusable elements | `common`, `nav`, `navbar` |
| 2 | `_auth` | Authentication & authorization | `auth`, `admin`, `maintenance` |
| 3 | `_pages` | Feature pages (alphabetical) | `calendar`, `cv`, `game`, `messages`... |
| 4 | `_homepage` | Homepage-specific sections | `hero`, `story`, `features`, `gallery`... |
| 5 | `_layout` | Layout elements | `footer_section`, `header`, `sidebar`... |
| 6 | `_legal` | Legal/compliance pages | `legal_page`, `privacy`, `terms`... |
| 7 | `_misc` | Everything else | `preloader`, `errors`, `notifications`... |

#### **Naming Conventions**

| Type | Convention | Example |
|------|------------|---------|
| Page section | Page name (singular, lowercase) | `calendar`, `cv`, `game` |
| Sub-feature | `parent.child` | `game.zombie_hud`, `cv.sections` |
| Actions | `section.action_verb` | `admin.clear_all`, `messages.send` |
| Status | `section.status_name` | `game.status_active` |
| Errors | `section.errors.type` | `calendar.errors.failed_to_load` |
| Common UI | `common.element` | `common.cancel`, `common.close` |

#### **Adding New Translations**

1. **Identify the category** from the table above
2. **Find or create the section** in alphabetical order within its category
3. **Add keys alphabetically** within the section
4. **Update ALL language files** (EN, FR, ZH) simultaneously
5. **Run validation script** to ensure consistency

#### **Adding a New Page/Feature**

When adding a new page (e.g., `shop`):
1. Identify the category (`_pages` for feature pages)
2. Create section `shop` in alphabetical order within that category
3. Add to **ALL 3 language files** (EN, FR, ZH) at the same position
4. Ensure all keys are translated before committing

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
