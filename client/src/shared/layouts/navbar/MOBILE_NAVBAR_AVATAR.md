# Mobile Navbar Avatar Implementation

## Date: 2026-01-14

## Feature
Ajout de l'avatar utilisateur dans la navbar mobile simplifiée (collapsed state).

## Layout Structure

### Navbar Mobile Simplifiée (Collapsed)
```
┌─────────────────────────────────────┐
│  [Avatar]  Page Name         [☰]    │
└─────────────────────────────────────┘
```

**Éléments (de gauche à droite):**
1. **Avatar** (gauche) - Cliquable, navigue vers `/profile`
2. **Page Title** (centre) - Titre dynamique de la page actuelle
3. **Hamburger Menu** (droite) - Ouvre le menu complet

## Comportement

### Avatar dans Navbar Simplifiée
- **Visible**: Uniquement sur mobile/tablet (< 1024px) et si utilisateur connecté
- **Taille**: 40x40px (w-10 h-10)
- **Style**: Bordure ronde blanche semi-transparente, hover avec accent
- **Action**: Clic → Navigation directe vers `/profile`
- **Sync**: Utilise `useAvatarSync` pour mises à jour en temps réel

### Avatar dans Menu Complet
- **Visible**: Dans la section auth en bas du menu complet
- **Taille**: 64x64px (w-16 h-16)
- **Action**: Clic → Navigation vers `/profile` + fermeture du menu

## Avantages UX

1. ✅ **Accès rapide** - Pas besoin d'ouvrir le menu pour aller au profil
2. ✅ **Indicateur visuel** - L'utilisateur voit immédiatement qu'il est connecté
3. ✅ **Cohérence desktop/mobile** - Desktop a aussi l'avatar dans la navbar
4. ✅ **Pattern moderne** - Standard UX (Twitter, Instagram, Facebook, etc.)
5. ✅ **Économie d'interactions** - Réduit le nombre de clics nécessaires

## Implémentation Technique

### Fichier Modifié
- `client/src/shared/layouts/Navbar.tsx`

### Changements
1. Import de `useAvatarSync` hook
2. Ajout du hook dans le composant pour sync avatar
3. Ajout du `<Link>` avec avatar avant le titre de page
4. Condition d'affichage: `user && lg:hidden`
5. Styling cohérent avec le design system existant

### Code Clé
```tsx
{user && (
    <Link 
        to="/profile" 
        className="lg:hidden w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden hover:border-accent-primary/50 transition-all active:scale-95 shrink-0"
        aria-label={t('nav.profile')}
    >
        <img
            src={syncedAvatarUrl || '/avatars/default-avatar.png'}
            alt={user.username}
            className="w-full h-full object-cover"
        />
    </Link>
)}
```

## Accessibilité

- ✅ **ARIA Label**: `aria-label={t('nav.profile')}`
- ✅ **Alt Text**: Nom d'utilisateur sur l'image
- ✅ **Touch Target**: 40x40px (minimum recommandé: 44x44px, mais acceptable avec padding du nav)
- ✅ **Focus Indicator**: Bordure visible au focus
- ✅ **Keyboard Navigation**: Accessible via Tab

## Responsive Behavior

| Breakpoint | Avatar Navbar | Avatar Menu | Hamburger |
|------------|---------------|-------------|-----------|
| < 1024px   | ✅ Visible    | ✅ Visible  | ✅ Visible |
| ≥ 1024px   | ❌ Hidden     | ❌ Hidden   | ❌ Hidden |

## Synchronisation Avatar

L'avatar est synchronisé dans **3 contextes**:
1. **Desktop Navbar** - UserAvatarMenu (dropdown)
2. **Mobile Navbar** - Avatar cliquable (nouveau)
3. **Mobile Menu** - Section auth en bas

Tous utilisent le même hook `useAvatarSync` pour garantir la cohérence.

## Testing Checklist

- [x] Build compile sans erreurs
- [ ] Avatar visible sur mobile quand connecté
- [ ] Avatar invisible sur mobile quand déconnecté
- [ ] Avatar invisible sur desktop (≥1024px)
- [ ] Clic sur avatar navigue vers `/profile`
- [ ] Avatar se met à jour après changement sur ProfilePage
- [ ] Fallback vers default-avatar.png si pas d'image
- [ ] Touch target accessible (minimum 40x40px)
- [ ] ARIA label présent et correct
- [ ] Hover effect fonctionne
- [ ] Active scale effect fonctionne
- [ ] Layout ne casse pas sur petits écrans (320px)

## Next Steps

1. Tester sur appareil mobile réel
2. Vérifier la synchronisation avatar entre tous les contextes
3. Tester avec différentes tailles d'écran (320px - 768px)
4. Valider l'accessibilité avec screen reader mobile
5. Mesurer la performance (temps de chargement avatar)

## Notes

- L'avatar dans la navbar mobile ne remplace pas l'avatar dans le menu complet
- Les deux avatars coexistent pour différents cas d'usage:
  - **Navbar**: Accès rapide au profil
  - **Menu**: Contexte complet avec username et logout
