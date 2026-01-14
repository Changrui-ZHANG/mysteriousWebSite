# Refonte UI Profile - Glassmorphism & Dark Mode

## Objectif
Refondre l'interface utilisateur de la page de profil pour adopter un design "Liquid Glass" (Glassmorphism) moderne, compatible avec les thèmes clair et sombre.

## Tâches

### Analyse
- [x] Analyser la structure actuelle de `ProfilePage.tsx`
- [x] Identifier les composants enfants à modifier (`ProfileCard`, `ProfileForm`, etc.)
- [x] Vérifier la configuration Tailwind et les variables CSS existantes

### Implémentation - Base
- [x] Créer les variables CSS pour le Glassmorphism dans `02-themes.css` (Light/Dark)
- [x] Créer `11-glassmorphism.css` pour les utilitaires et animations
- [x] Créer le composant réutilisable `GlassCard.tsx` avec `LiquidBackground`

### Implémentation - Composants
- [x] Créer `GlassCard.tsx` component
- [x] Modifier `ProfilePage.tsx` pour utiliser `LiquidBackground` et `GlassCard`
- [x] Refactoriser `ProfileCard.tsx` pour le glassmorphism
- [x] Refactoriser `ProfileForm.tsx` (inputs, boutons)
- [x] Refactoriser `PrivacySettings.tsx`
- [x] Adapter `AvatarUploadWithCropping.tsx`
- [x] Corriger le style de `AvatarCropper.tsx` (problème d'intégration)
- [x] Assurer la compatibilité Dark Mode pour tous les nouveaux composants
- [x] Mettre à jour `NotificationCenter.tsx` (Expanded size)

### Implémentation - Avatars Genrés
- [x] Implement Gender-based Default Avatars
    - [x] Modify `RegisterDTO.java` to include a gender field
    - [x] Update `UserProfile.java` to store gender information
    - [x] Update `AuthController.java` to handle gender during registration
    - [x] Update `ProfileService.java` to set default avatar URL based on gender
    - [x] Update `AuthModal.tsx` to include gender selection
    - [x] Update `ProfileCard.tsx` and `ProfileForm.tsx` to display and edit gender
    - [x] Generate and place default avatar images (`default-B.jpeg`, `default-G.jpeg`)
    - [x] Update Liquibase schema to include `gender` column in `user_profiles` table
    - [x] Fix `PrivacyResponseFilter.java` and `PrivacyFilterMiddleware.java` to support `gender` field (resolved 500 error)
    - [x] Rename gender labels from "Boy/Girl" to "Man/Woman" (Homme/Femme) in all languages
    - [x] Fix `ProfileTransformer.ts` to correctly map `gender` field from backend (resolved display issue)

### Implémentation - Internationalisation (i18n)
- [x] Créer `implementation_plan_i18n.md`
- [x] Ajouter les clés de traduction dans `en/translation.json`, `fr/translation.json`, `zh/translation.json`
- [x] Mettre à jour `ProfilePage.tsx` avec les traductions
- [x] Mettre à jour `ProfileCard.tsx` avec les traductions
- [x] Mettre à jour `ProfileForm.tsx` avec les traductions
- [x] Mettre à jour `PrivacySettings.tsx` avec les traductions
- [x] Mettre à jour `AvatarUploadWithCropping.tsx` avec les traductions
- [x] Mettre à jour `AvatarCropper.tsx` avec les traductions

### Vérification
- [x] Vérifier le rendu visuel (manuel par l'utilisateur)
- [x] Tester le responsive sur mobile
- [x] Tester le basculement Light/Dark mode
- [x] Vérifier les traductions (Anglais, Français, Chinois)

### Maintenance & Fixes (Recent)
- [x] Fix Avatar Upload Failure (400 Bad Request)
    - [x] Fix `AvatarCropper.tsx` MIME type to match extension
    - [x] Update `FileUploadMiddleware.java` to skip script checks for images
- [x] Default Avatar Migration to Backend
    - [x] Move images to `server/src/main/resources/static/avatars/`
    - [x] Update `AvatarController`, `ProfileService`, `AvatarService`
    - [x] Update frontend components (`AvatarButton`, `MobileMenu`, `UserDropdownMenu`, `ProfileCard`, `AvatarUploadWithCropping`) to use `/avatars/`
    - [x] Configure Vite proxy for `/avatars`
- [x] Fix Broker Avatar Display
    - [x] Add `onError` handler to `ProfileCard.tsx`
    - [x] Add `onError` handler to `AvatarUploadWithCropping.tsx`
    - [x] Add `onError` handler to `UserDropdownMenu.tsx`
- [x] UI Refactoring
    - [x] Adapt `ConnectionStatus.tsx` to Glassmorphism theme
