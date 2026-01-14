# 📊 Analyse du Système de Profil Utilisateur

## 🎯 Vue d'Ensemble

Le système de profil utilisateur est un module complet de gestion de profils avec une architecture **Domain-Driven Design** (DDD) full-stack :
- **Frontend** : React 18 + TypeScript avec TanStack Query
- **Backend** : Spring Boot 3.2.1 + Java 17 avec JPA/Hibernate
- **Base de données** : PostgreSQL 15 avec migrations Liquibase

---

## 🏗️ Architecture Backend (Spring Boot)

### 📁 Structure des Packages

```
server/src/main/java/com/changrui/mysterious/domain/profile/
├── controller/          # Endpoints REST API
│   ├── ProfileController.java
│   └── AdminProfileController.java
├── service/            # Logique métier
│   ├── ProfileService.java
│   ├── ProfileIntegrationService.java
│   └── ProfileMigrationService.java
├── repository/         # Accès aux données (JPA)
│   └── UserProfileRepository.java
├── model/             # Entités JPA
│   ├── UserProfile.java
│   ├── PrivacySettings.java
│   ├── ActivityStats.java
│   └── Achievement.java
├── dto/               # Data Transfer Objects
│   ├── ProfileResponse.java
│   ├── CreateProfileRequest.java
│   ├── UpdateProfileRequest.java
│   ├── UpdatePrivacyRequest.java
│   └── BasicProfileInfo.java
├── middleware/        # Middlewares d'authentification et filtrage
│   ├── ProfileAuthMiddleware.java
│   ├── RequireProfileOwnership.java
│   ├── PrivacyFilterMiddleware.java
│   └── FileUploadMiddleware.java
└── config/           # Configuration
    └── ProfileConfig.java
```

### 🗄️ Modèle de Données Principal

#### **UserProfile** (Table: `user_profiles`)

```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "display_name", nullable = false, length = 30)
    private String displayName;
    
    @Column(name = "bio", length = 500)
    private String bio;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;
    
    @Column(name = "last_active", nullable = false)
    private LocalDateTime lastActive;
    
    @Column(name = "is_public", nullable = false)
    private boolean isPublic;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

**Caractéristiques** :
- ✅ Timestamps automatiques (`@PreUpdate`)
- ✅ Validation des longueurs de champs
- ✅ Valeurs par défaut (`isPublic = true`)

### 🔌 Endpoints API REST

#### **ProfileController** (`/api/profiles`)

| Méthode | Endpoint | Description | Middleware |
|---------|----------|-------------|------------|
| `POST` | `/` | Créer un profil | - |
| `GET` | `/{userId}` | Récupérer un profil | Privacy Filter |
| `PUT` | `/{userId}` | Mettre à jour un profil | Ownership Required |
| `DELETE` | `/{userId}` | Supprimer un profil | Ownership Required |
| `GET` | `/search?q={query}` | Rechercher des profils | Privacy Filter |
| `GET` | `/directory` | Liste des profils publics | Privacy Filter |
| `PUT` | `/{userId}/privacy` | Mettre à jour la confidentialité | Ownership Required |
| `POST` | `/{userId}/activity` | Mettre à jour last_active | Ownership Required |
| `GET` | `/{userId}/basic` | Info basique (avatar, nom) | Public |

**Points clés** :
- 🔒 **Authentification** : Extraction du `requesterId` via paramètre ou header `X-Requester-Id`
- 🛡️ **Privacy Filtering** : Filtrage automatique des champs privés selon les paramètres de confidentialité
- 👑 **Admin Override** : Support de l'accès admin via header `X-Admin-Code`

### 🔐 Système de Confidentialité

#### **PrivacySettings**

```java
public class PrivacySettings {
    private String profileVisibility; // "public", "friends", "private"
    private boolean showBio;
    private boolean showStats;
    private boolean showAchievements;
    private boolean showLastActive;
}
```

#### **Middlewares de Sécurité**

1. **`@RequireProfileOwnership`** : Vérifie que le requester est propriétaire du profil
2. **`@RequirePrivacyLevel`** : Vérifie le niveau de confidentialité requis
3. **`@FilterPrivateFields`** : Filtre automatiquement les champs selon les paramètres de confidentialité

---

## 🎨 Architecture Frontend (React + TypeScript)

### 📁 Structure des Dossiers

```
client/src/domain/profile/
├── ProfilePage.tsx          # Page principale de gestion de profil
├── types.ts                 # Définitions TypeScript
├── index.ts                 # Exports publics
├── components/              # Composants UI
│   ├── ProfileCard.tsx
│   ├── ProfileForm.tsx
│   ├── AvatarUploadWithCropping.tsx
│   ├── PrivacySettings.tsx
│   ├── NotificationCenter.tsx
│   ├── RealTimeStatus.tsx
│   └── cropping/           # Composants de recadrage d'image
├── hooks/                  # Custom React Hooks
│   ├── useRealTimeProfile.ts
│   ├── useProfileDirectory.ts
│   └── cropping/
├── queries/                # TanStack Query hooks
│   └── profileQueries.ts
├── services/               # Logique métier frontend
│   ├── ProfileService.ts
│   ├── ActivityService.ts
│   └── AvatarService.ts
├── repositories/           # Accès API
│   └── ProfileRepository.ts
├── schemas/               # Validation Zod
│   └── profileSchemas.ts
├── stores/                # État global (Zustand)
│   └── uiStore.ts
└── utils/                 # Utilitaires
    └── ProfileTransformer.ts
```

### 🧩 Composants Principaux

#### **ProfilePage.tsx**
Page principale avec interface à onglets :
- 📊 **Overview** : Affichage du profil avec `ProfileCard`
- ✏️ **Edit** : Formulaire d'édition avec upload d'avatar
- 🔒 **Privacy** : Paramètres de confidentialité
- 📈 **Activity** : Statistiques et achievements

**Fonctionnalités** :
- ✅ Gestion d'état avec TanStack Query (`useProfileWithStats`)
- ✅ Mutations optimistes pour les mises à jour
- ✅ Gestion d'erreur robuste avec retry manuel
- ✅ Indicateur de changements non sauvegardés
- ✅ Messages d'erreur contextuels (403, erreurs réseau, etc.)

#### **ProfileCard.tsx**
Carte d'affichage de profil avec :
- Avatar circulaire
- Nom d'affichage et bio
- Date d'inscription et dernière activité
- Bouton d'édition (si profil personnel)

#### **ProfileForm.tsx**
Formulaire de création/édition avec validation Zod :
- Champ `displayName` (max 30 caractères)
- Champ `bio` (max 500 caractères)
- Validation en temps réel
- Boutons Annuler/Sauvegarder

#### **AvatarUploadWithCropping.tsx**
Upload d'avatar avec :
- Prévisualisation en temps réel
- Recadrage d'image interactif
- Validation de taille et format
- Barre de progression d'upload
- Gestion d'erreur

#### **PrivacySettings.tsx**
Panneau de configuration de confidentialité :
- Sélecteur de visibilité (public/friends/private)
- Toggles pour chaque champ privé
- Sauvegarde automatique avec debounce

### 🔄 Gestion d'État et Requêtes

#### **TanStack Query Hooks** (`profileQueries.ts`)

```typescript
// Hook combiné pour profil + stats
useProfileWithStats(userId, requesterId)

// Mutations
useUpdateProfileMutation()
useUpdatePrivacyMutation()
useCreateProfileMutation()
useDeleteProfileMutation()
```

**Avantages** :
- ✅ Cache automatique
- ✅ Refetch intelligent
- ✅ Optimistic updates
- ✅ Gestion d'erreur intégrée
- ✅ Retry avec backoff exponentiel

#### **Services Frontend**

**ProfileService.ts** :
- Validation métier (Zod schemas)
- Orchestration des appels API
- Application des règles de confidentialité
- Transformation des données

**ActivityService.ts** :
- Tracking des activités utilisateur
- Mise à jour des statistiques
- Gestion des achievements

**AvatarService.ts** :
- Upload d'images
- Recadrage et redimensionnement
- Validation de format

### 📊 Types TypeScript

```typescript
interface UserProfile {
    userId: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    joinDate: Date | string;
    lastActive: Date | string;
    isPublic: boolean;
    privacySettings?: PrivacySettings | null;
    activityStats?: ActivityStats | null;
    achievements?: Achievement[];
}

interface PrivacySettings {
    profileVisibility: 'public' | 'friends' | 'private';
    showBio: boolean;
    showStats: boolean;
    showAchievements: boolean;
    showLastActive: boolean;
}

interface ActivityStats {
    totalMessages: number;
    totalGamesPlayed: number;
    bestScores: Record<string, number> | string;
    currentStreak: number;
    longestStreak: number;
    timeSpent: number; // en minutes
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    unlockedAt: Date;
    category: 'messaging' | 'gaming' | 'social' | 'time';
}
```

---

## 🔧 Fonctionnalités Clés Implémentées

### ✅ Gestion de Profil
- [x] Création de profil avec validation
- [x] Mise à jour de profil (nom, bio, avatar)
- [x] Suppression de profil
- [x] Recherche de profils
- [x] Répertoire de profils publics

### ✅ Confidentialité
- [x] Paramètres de visibilité granulaires
- [x] Filtrage automatique des champs privés
- [x] Contrôle d'accès basé sur la propriété
- [x] Support admin avec override

### ✅ Avatar
- [x] Upload d'image avec validation
- [x] Recadrage interactif
- [x] Prévisualisation en temps réel
- [x] Gestion de la taille et du format

### ✅ Statistiques et Activité
- [x] Tracking des messages envoyés
- [x] Tracking des jeux joués
- [x] Système de streaks
- [x] Temps passé sur la plateforme
- [x] Achievements débloquables

### ✅ Gestion d'Erreur
- [x] Circuit breaker pour éviter les boucles
- [x] Retry intelligent avec backoff exponentiel
- [x] Messages d'erreur contextuels
- [x] Boutons de retry manuels
- [x] Logging centralisé

---

## 🐛 Problèmes Connus et Corrections

### Documents de Correction Disponibles

1. **[PROFILE_RETRY_BUTTON_FIX.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/PROFILE_RETRY_BUTTON_FIX.md)**
   - Correction des boutons de retry qui ne fonctionnaient pas

2. **[PROFILE_REQUESTER_ID_FIX.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/PROFILE_REQUESTER_ID_FIX.md)**
   - Correction de l'extraction du `requesterId` dans les endpoints

3. **[PROFILE_ERROR_LOOPS_FIXED.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/PROFILE_ERROR_LOOPS_FIXED.md)**
   - Implémentation du circuit breaker anti-boucles

4. **[PROFILE_ENDPOINTS_VERIFICATION.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/PROFILE_ENDPOINTS_VERIFICATION.md)**
   - Vérification complète des endpoints API

---

## 🚀 Recommandations pour le Développement

### 🎯 Priorités Immédiates

1. **Tests Unitaires et d'Intégration**
   - Tests des services backend
   - Tests des composants React
   - Tests E2E avec Playwright

2. **Optimisations de Performance**
   - Pagination pour les listes de profils
   - Lazy loading des images
   - Compression des avatars

3. **Fonctionnalités Manquantes**
   - Système d'amis (pour `profileVisibility: 'friends'`)
   - Notifications en temps réel
   - Historique des modifications de profil

### 🔐 Sécurité

- [ ] Validation côté serveur pour tous les champs
- [ ] Rate limiting sur les endpoints publics
- [ ] Sanitization des inputs (XSS prevention)
- [ ] CSRF protection
- [ ] Upload d'avatar : validation de type MIME côté serveur

### 📊 Monitoring et Observabilité

- [ ] Métriques de performance (temps de réponse API)
- [ ] Logs structurés avec corrélation ID
- [ ] Alertes sur les erreurs critiques
- [ ] Dashboard de statistiques d'utilisation

### 🎨 UX/UI

- [ ] Skeleton loaders pour les états de chargement
- [ ] Animations de transition entre onglets
- [ ] Mode sombre
- [ ] Responsive design amélioré pour mobile
- [ ] Accessibilité (ARIA labels, keyboard navigation)

---

## 📝 Points d'Attention pour le Codage

### Backend (Spring Boot)

1. **Toujours extraire le `requesterId`** :
   ```java
   String requesterId = httpRequest.getParameter("requesterId");
   if (requesterId == null) {
       requesterId = httpRequest.getHeader("X-Requester-Id");
   }
   ```

2. **Utiliser les annotations de middleware** :
   ```java
   @RequireProfileOwnership(allowAdminOverride = true)
   @FilterPrivateFields(fields = {"bio", "lastActive"})
   ```

3. **Retourner toujours `ApiResponse<T>`** :
   ```java
   return ResponseEntity.ok(ApiResponse.success("Message", data));
   ```

### Frontend (React + TypeScript)

1. **Utiliser TanStack Query pour les requêtes** :
   ```typescript
   const { data, isLoading, error, refetch } = useProfileWithStats(userId, requesterId);
   ```

2. **Valider avec Zod avant d'envoyer** :
   ```typescript
   const validatedData = validateUpdateProfile(formData);
   ```

3. **Gérer les erreurs avec `ErrorDisplay`** :
   ```tsx
   <ErrorDisplay 
       error={error.message} 
       onRetry={refetch} 
       canRetry={true} 
   />
   ```

4. **Utiliser les types stricts** :
   ```typescript
   type TabType = 'overview' | 'edit' | 'privacy' | 'activity';
   ```

---

## 🎓 Ressources Utiles

### Documentation Technique

- [TECHNICAL_OVERVIEW.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/TECHNICAL_OVERVIEW.md) - Vue d'ensemble complète
- [BACKEND_ARCHITECTURE.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/BACKEND_ARCHITECTURE.md) - Architecture Spring Boot
- [ERROR_HANDLING_SYSTEM.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/ERROR_HANDLING_SYSTEM.md) - Gestion d'erreur
- [CONTRIBUTING.md](file:///c:/MyPlatform/Codes/mysteriousWebSite/docs/CONTRIBUTING.md) - Standards de développement

### Fichiers Clés à Connaître

**Backend** :
- [ProfileController.java](file:///c:/MyPlatform/Codes/mysteriousWebSite/server/src/main/java/com/changrui/mysterious/domain/profile/controller/ProfileController.java)
- [ProfileService.java](file:///c:/MyPlatform/Codes/mysteriousWebSite/server/src/main/java/com/changrui/mysterious/domain/profile/service/ProfileService.java)
- [UserProfile.java](file:///c:/MyPlatform/Codes/mysteriousWebSite/server/src/main/java/com/changrui/mysterious/domain/profile/model/UserProfile.java)

**Frontend** :
- [ProfilePage.tsx](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/ProfilePage.tsx)
- [types.ts](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/types.ts)
- [ProfileService.ts](file:///c:/MyPlatform/Codes/mysteriousWebSite/client/src/domain/profile/services/ProfileService.ts)

---

## ✅ Prêt à Coder !

Tu as maintenant une vue complète du système de profil. Voici ce que tu peux faire :

1. **Ajouter de nouvelles fonctionnalités** : Système d'amis, badges, etc.
2. **Corriger des bugs** : Consulte les docs de correction pour les patterns
3. **Améliorer l'UX** : Animations, skeleton loaders, etc.
4. **Optimiser les performances** : Pagination, caching, etc.
5. **Écrire des tests** : Unitaires, intégration, E2E

**N'hésite pas à me demander des précisions sur n'importe quelle partie !** 🚀
