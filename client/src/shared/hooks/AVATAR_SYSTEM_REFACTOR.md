# Avatar System Refactoring

## Date: 2026-01-14

## Problème Identifié

L'avatar ne s'affichait pas correctement dans la navbar mobile car:
1. **localStorage non synchronisé**: L'avatar dans `AuthContext` (stocké dans localStorage) n'était jamais mis à jour après le login initial
2. **Dépendance sur React Query uniquement**: Le hook `useAvatarSync` lisait uniquement le cache React Query, pas le localStorage
3. **Incohérence des sources**: Différents composants utilisaient différentes sources pour l'avatar

## Solution Implémentée

### 1. Ajout de `updateUserAvatar` dans AuthContext

**Fichier**: `client/src/shared/contexts/AuthContext.tsx`

```typescript
const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
        const updatedUser = { ...user, avatarUrl };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
};
```

**Avantages**:
- ✅ Met à jour le state React du user
- ✅ Persiste dans localStorage
- ✅ Déclenche un re-render de tous les composants qui utilisent `useAuth()`

### 2. Amélioration de `useAvatarSync`

**Fichier**: `client/src/shared/hooks/useAvatarSync.ts`

**Changements**:
1. Import de `useAuth` pour accéder à `updateUserAvatar`
2. Appel de `updateUserAvatar` quand un changement d'avatar est détecté dans React Query
3. Synchronisation bidirectionnelle: React Query → AuthContext → localStorage

```typescript
if (isAvatarUpdate) {
    const data = event.query.state.data as { avatarUrl?: string } | undefined;
    const newAvatarUrl = data?.avatarUrl;
    setAvatarUrl(newAvatarUrl);
    
    // Update AuthContext to persist in localStorage
    if (newAvatarUrl) {
        updateUserAvatar(newAvatarUrl);
    }
}
```

**Avantages**:
- ✅ Source unique de vérité: React Query cache
- ✅ Propagation automatique vers AuthContext et localStorage
- ✅ Tous les composants restent synchronisés

### 3. Simplification de l'utilisation

**Navbar et MobileMenu**:

**Avant**:
```typescript
const syncedAvatarUrl = useAvatarSync({
    userId: user?.userId || '',
    initialAvatarUrl: user?.avatarUrl
});

// Utilisation
<img src={syncedAvatarUrl || '/avatars/default-avatar.png'} />
```

**Après**:
```typescript
// Juste pour activer la synchronisation
useAvatarSync({
    userId: user?.userId || '',
    initialAvatarUrl: user?.avatarUrl
});

// Utilisation directe du user context
<img src={user.avatarUrl || '/avatars/default-avatar.png'} />
```

**Avantages**:
- ✅ Plus simple et plus lisible
- ✅ Source unique: `user.avatarUrl` du contexte
- ✅ Pas de variable intermédiaire

## Architecture du Système Avatar

```
┌─────────────────────────────────────────────────────────────┐
│                    Upload Avatar                             │
│                         ↓                                    │
│              AvatarService.uploadAvatar()                    │
│                         ↓                                    │
│              React Query Mutation                            │
│                         ↓                                    │
│              React Query Cache Update                        │
│                         ↓                                    │
│              useAvatarSync (listener)                        │
│                    ↙         ↘                               │
│         Internal State    updateUserAvatar()                 │
│                                ↓                             │
│                         AuthContext                          │
│                         (user.avatarUrl)                     │
│                                ↓                             │
│                         localStorage                         │
│                                                              │
│  All components using useAuth() get updated automatically   │
└─────────────────────────────────────────────────────────────┘
```

## Flux de Données

### 1. Au Login
```
Backend → AuthContext.login() → localStorage → user.avatarUrl
```

### 2. Lors d'un Upload Avatar
```
Upload → AvatarService → React Query Mutation → Cache Update
    ↓
useAvatarSync (détecte le changement)
    ↓
updateUserAvatar() → AuthContext → localStorage
    ↓
Tous les composants avec useAuth() se re-render automatiquement
```

### 3. Au Chargement de Page
```
localStorage → AuthContext (useEffect initial) → user.avatarUrl
    ↓
useAvatarSync vérifie React Query cache
    ↓
Si cache plus récent → updateUserAvatar() → Synchronisation
```

## Composants Affectés

### Utilisant `user.avatarUrl` directement (après refactor):
1. ✅ **Navbar** - Avatar mobile navbar
2. ✅ **MobileMenu** - Avatar dans section auth
3. ✅ **DesktopMenu** - Passe à UserAvatarMenu
4. ✅ **UserAvatarMenu** - Utilise useAvatarSync (garde syncedAvatarUrl pour compatibilité)
5. ✅ **ProfileCard** - Utilise directement avatarUrl du profile

### Utilisant `useAvatarSync` (pour synchronisation):
1. **Navbar** - Active la sync
2. **MobileMenu** - Active la sync
3. **UserAvatarMenu** - Active la sync + utilise la valeur retournée

## Avantages du Nouveau Système

1. ✅ **Source unique de vérité**: React Query cache
2. ✅ **Persistance automatique**: localStorage toujours à jour
3. ✅ **Synchronisation temps réel**: Tous les composants se mettent à jour
4. ✅ **Simplicité**: Utilisation directe de `user.avatarUrl`
5. ✅ **Robustesse**: Gestion d'erreur avec fallback
6. ✅ **Performance**: Pas de requêtes réseau supplémentaires
7. ✅ **Maintenabilité**: Code plus simple et centralisé

## Tests à Effectuer

- [ ] Login → Avatar s'affiche correctement partout
- [ ] Upload avatar → Tous les avatars se mettent à jour instantanément
- [ ] Refresh page → Avatar persiste (localStorage)
- [ ] Navbar mobile → Avatar correct
- [ ] MobileMenu → Avatar correct
- [ ] Desktop UserAvatarMenu → Avatar correct
- [ ] ProfileCard → Avatar correct
- [ ] Erreur de chargement → Fallback vers default-avatar.png
- [ ] Logout → Avatar disparaît partout

## Migration Notes

### Pour les nouveaux composants:
```typescript
// 1. Importer useAuth
import { useAuth } from '../contexts/AuthContext';

// 2. Utiliser directement user.avatarUrl
const { user } = useAuth();

// 3. Afficher l'avatar
<img src={user?.avatarUrl || '/avatars/default-avatar.png'} />
```

### Pour activer la synchronisation (optionnel):
```typescript
// Dans les composants racines (Navbar, MobileMenu)
useAvatarSync({
    userId: user?.userId || '',
    initialAvatarUrl: user?.avatarUrl
});
```

## Fichiers Modifiés

1. ✅ `client/src/shared/contexts/AuthContext.tsx` - Ajout `updateUserAvatar`
2. ✅ `client/src/shared/hooks/useAvatarSync.ts` - Synchronisation avec AuthContext
3. ✅ `client/src/shared/layouts/Navbar.tsx` - Utilisation simplifiée
4. ✅ `client/src/shared/layouts/navbar/MobileMenu.tsx` - Utilisation simplifiée

## Performance Impact

- **Avant**: Multiple sources de vérité, incohérences possibles
- **Après**: Source unique, propagation automatique, pas de requêtes supplémentaires
- **Impact**: ✅ Positif - Moins de bugs, meilleure UX
