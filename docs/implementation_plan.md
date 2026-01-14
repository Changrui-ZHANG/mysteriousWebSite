# Plan d'Implémentation - Refonte UI Profile (Glassmorphism & Dark Mode)

## Objectif
Refondre l'interface utilisateur de la page de profil pour adopter un design moderne "Liquid Glass" (Glassmorphism) et assurer une compatibilité parfaite avec le mode sombre.

## User Review Required
- [ ] Validation du choix des couleurs et de l'intensité de l'effet "Glass" (flou, transparence).
- [ ] Confirmation de la nouvelle disposition des éléments.

## Proposed Changes

### Configuration et Style Global
#### [MODIFY] [tailwind.config.js](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/tailwind.config.js)
- Ajouter des extensions de thèmes pour les couleurs de fond (dégradés) et les effets de flou si nécessaire.
- Définir les palettes pour le mode sombre.

#### [MODIFY] [index.css](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/index.css)
- Ajouter des classes utilitaires pour l'effet glass (`.glass-panel`, `.glass-button`) pour faciliter la réutilisation.
- Définir les dégradés d'arrière-plan animés (Liquid effect).

### Composants React

#### [NEW] [GlassCard.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/shared/components/GlassCard.tsx) (Optionnel mais recommandé)
- Créer un composant conteneur générique pour l'effet glassmorphism afin d'éviter la répétition de classes Tailwind.

#### [MODIFY] [ProfilePage.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/ProfilePage.tsx)
- Remplacer le fond statique par un fond dégradé animé/complexe.
- Réorganiser la grille principale.
- Utiliser les nouveaux conteneurs Glass.

#### [MODIFY] [ProfileCard.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/components/ProfileCard.tsx)
- Moderniser l'avatar (bordure brillante, ombre portée).
- Styliser les informations textuelles (police, contraste).

#### [MODIFY] [Composants Internes]
- `ProfileForm` : Inputs stylisés glass (fond semi-transparent, bordure subtile).
- `Statistics` : Cartes de stats avec effet de profondeur.
- `Achievements` : Grille avec effets de survol (hover glow).

## Verification Plan

### Automated Tests
- Vérifier que le build passe (`npm run build`).
- Vérifier qu'il n'y a pas de régressions dans les tests existants.

### Manual Verification
1. Lancer l'application (`npm run dev`).
2. Naviguer vers la page de profil (`/profile`).
3. Vérifier l'apparence en mode Light.
4. Basculer en mode Dark (si toggle présent) ou changer la préférence système.
5. Vérifier l'apparence en mode Dark.
6. Tester la responsivité sur différentes tailles d'écran.
