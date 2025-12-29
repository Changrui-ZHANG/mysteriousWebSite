# Design System - Tailwind CSS v4

Système de design centralisé utilisant Tailwind CSS v4 avec la directive `@theme`.

## Structure

```
styles/
├── design-system.css  # Tout le système de design
└── README.md          # Cette documentation
```

## Architecture

### 1. Design Tokens (`@theme`)

Tous les tokens de design sont définis dans la directive `@theme` :

```css
@theme {
    /* Fonts */
    --font-body: 'Outfit', sans-serif;
    --font-heading: 'Outfit', sans-serif;
    
    /* Colors */
    --color-bg-base: #fcfcfd;
    --color-text-primary: #1d1d1f;
    --color-accent-blue: #3b82f6;
    
    /* Spacing, radius, shadows, etc. */
}
```

### 2. Thèmes (`@layer base`)

Les variantes de thème sont définies via `data-theme` :

```css
@layer base {
    [data-theme="dark"] {
        --color-bg-base: #0a0a0b;
        --color-text-primary: #ffffff;
    }
}
```

### 3. Composants (`@layer components`)

Classes réutilisables pour les patterns communs :

- `.page-container` - Conteneur de page
- `.card`, `.card-elevated` - Cartes
- `.glass-panel` - Effet glassmorphism
- `.btn-*` - Boutons (primary, secondary, ghost, pill)
- `.input`, `.textarea` - Champs de formulaire
- `.badge-*` - Badges colorés
- `.nav-link` - Liens de navigation
- `.modal-*` - Modales

## Utilisation

### Variables CSS directes

```tsx
<div style={{ backgroundColor: 'var(--color-bg-surface)' }}>
<div className="bg-[var(--color-accent-blue)]">
```

### Classes de composants

```tsx
<div className="page-container">
    <div className="card">
        <button className="btn-primary">Action</button>
    </div>
</div>
```

### Classes utilitaires

```tsx
<p className="text-primary">Texte principal</p>
<p className="text-secondary">Texte secondaire</p>
<div className="bg-surface border-default">...</div>
```

## Gestion du Thème

### Hook `useThemeManager`

```tsx
import { useThemeManager } from './hooks/useThemeManager';

function MyComponent() {
    const { isDarkMode, toggleTheme, setTheme } = useThemeManager();
    
    return (
        <button onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
        </button>
    );
}
```

### Options de thème

- `'light'` - Thème clair
- `'dark'` - Thème sombre
- `'system'` - Suit les préférences système

## Tokens Disponibles

### Couleurs

| Token | Description |
|-------|-------------|
| `--color-bg-base` | Fond principal |
| `--color-bg-surface` | Fond de carte |
| `--color-bg-elevated` | Fond surélevé |
| `--color-bg-muted` | Fond atténué |
| `--color-text-primary` | Texte principal |
| `--color-text-secondary` | Texte secondaire |
| `--color-text-muted` | Texte atténué |
| `--color-border-default` | Bordure standard |
| `--color-accent-*` | Couleurs d'accent (blue, purple, pink, green, amber, red, cyan) |

### Espacements

| Token | Valeur |
|-------|--------|
| `--spacing-xs` | 0.25rem |
| `--spacing-sm` | 0.5rem |
| `--spacing-md` | 1rem |
| `--spacing-lg` | 1.5rem |
| `--spacing-xl` | 2rem |

### Rayons de bordure

| Token | Valeur |
|-------|--------|
| `--radius-sm` | 0.375rem |
| `--radius-md` | 0.5rem |
| `--radius-lg` | 0.75rem |
| `--radius-xl` | 1rem |
| `--radius-2xl` | 1.5rem |
| `--radius-full` | 9999px |

## Migration depuis v3

1. Supprimer `tailwind.config.js` et `postcss.config.js`
2. Utiliser `@tailwindcss/vite` dans `vite.config.ts`
3. Remplacer les ternaires `isDarkMode ? 'x' : 'y'` par des variables CSS
4. Utiliser `data-theme` au lieu de la classe `.dark`

## Avantages

- ✅ Un seul fichier CSS pour tout le système
- ✅ Variables CSS natives (pas de JS pour le thème)
- ✅ Opacité automatique sur les couleurs
- ✅ Pas de flash de thème incorrect
- ✅ Support du thème système
- ✅ Maintenance simplifiée
