# Plan d'Implémentation - Internationalisation (i18n) de la Page Profil

## Objectif
Globaliser tous les textes de la page de profil (ProfilePage, ProfileCard, ProfileForm, PrivacySettings, AvatarUpload) en utilisant `react-i18next` pour supporter l'anglais, le français et le chinois.

## Proposed Changes

### Fichiers de Traduction
#### [MODIFY] [translation.json (en)](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/public/locales/en/translation.json)
- Ajouter une section `profile` avec toutes les clés nécessaires (tabs, card, form, avatar, privacy, errors).

#### [MODIFY] [translation.json (fr)](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/public/locales/fr/translation.json)
- Ajouter la section `profile` traduite en français.

#### [MODIFY] [translation.json (zh)](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/public/locales/zh/translation.json)
- Ajouter la section `profile` traduite en chinois.

### Composants React
#### [MODIFY] [ProfilePage.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/ProfilePage.tsx)
- Utiliser `useTranslation`.
- Remplacer les textes statiques des onglets, messages d'erreur et placeholders.

#### [MODIFY] [ProfileCard.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/components/ProfileCard.tsx)
- Traduire les labels de statistiques (Messages, Games, Days, Streak).
- Traduire les textes "Bio", "Achievements", "Joined".

#### [MODIFY] [ProfileForm.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/components/ProfileForm.tsx)
- Traduire les labels des champs, les hints et les boutons de sauvegarde/reset.

#### [MODIFY] [PrivacySettings.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/components/PrivacySettings.tsx)
- Traduire toutes les options de visibilité et les descriptions granulaires.

#### [MODIFY] [AvatarUploadWithCropping.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/components/AvatarUploadWithCropping.tsx)
- Traduire les textes d'upload et les messages d'erreur.

## Verification Plan

### Manual Verification
1. Lancer l'application (`npm run dev`).
2. Naviguer vers la page de profil.
3. Changer la langue via la barre de navigation (EN, FR, ZH).
4. Vérifier que TOUS les textes de la page profil changent correctement.
5. Vérifier les tooltips et les messages de notification (sauvegarde réussie, etc.).
