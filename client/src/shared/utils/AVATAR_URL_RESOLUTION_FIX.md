# Avatar URL Resolution Fix

## Date: 2026-01-14

## Problème Identifié

L'avatar par défaut s'affichait au lieu du vrai avatar de l'utilisateur au login, puis le bon avatar apparaissait seulement après avoir visité la page profil.

### Cause Racine

Le backend retourne des URLs d'avatar de deux types différents:

1. **Avatars uploadés**: URLs absolues avec base URL
   - Exemple: `/api/avatars/files/abc123.jpg`
   - Configuré dans `AvatarService` avec `baseUrl`

2. **Avatars par défaut**: Chemins relatifs
   - Exemple: `/avatars/default-B.jpeg`
   - Défini dans `ProfileService.createProfile()`

Le problème: Le frontend ne résolvait pas les chemins relatifs en URLs absolues, donc les avatars par défaut ne chargeaient pas correctement.

## Solution Implémentée

### 1. Création de `avatarUtils.ts`

**Fichier**: `client/src/shared/utils/avatarUtils.ts`

Fonctions utilitaires pour gérer les URLs d'avatar:

```typescript
export function resolveAvatarUrl(avatarUrl?: string | null): string {
    // If no avatar URL, return default
    if (!avatarUrl || avatarUrl.trim() === '') {
        return '/avatars/default-avatar.png';
    }

    // If already an absolute URL (http:// or https://), return as-is
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl;
    }

    // If it's a relative path starting with /, prepend API base URL
    if (avatarUrl.startsWith('/')) {
        return `${API_BASE_URL}${avatarUrl}`;
    }

    // Otherwise, assume it's a relative path and prepend API base URL with /
    return `${API_BASE_URL}/${avatarUrl}`;
}
```

**Logique**:
1. Si `null` ou vide → Retourne avatar par défaut local
2. Si commence par `http://` ou `https://` → Retourne tel quel (déjà absolu)
3. Si commence par `/` → Préfixe avec `API_BASE_URL`
4. Sinon → Préfixe avec `API_BASE_URL/`

### 2. Mise à jour de `AuthContext.login()`

**Fichier**: `client/src/shared/contexts/AuthContext.tsx`

```typescript
const login = (newUser: User) => {
    // Resolve avatar URL to absolute path
    const userWithResolvedAvatar = {
        ...newUser,
        avatarUrl: resolveAvatarUrl(newUser.avatarUrl)
    };
    
    setUser(userWithResolvedAvatar);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithResolvedAvatar));
    // ...
};
```

**Avantages**:
- ✅ Avatar résolu dès le login
- ✅ URL absolue stockée dans localStorage
- ✅ Pas besoin de résoudre à chaque affichage

### 3. Mise à jour de `updateUserAvatar()`

```typescript
const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
        // Resolve avatar URL to absolute path
        const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl);
        const updatedUser = { ...user, avatarUrl: resolvedAvatarUrl };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
};
```

**Avantages**:
- ✅ Cohérence avec `login()`
- ✅ Avatar toujours résolu avant stockage

## Flux de Résolution d'Avatar

### Au Login
```
Backend → AuthModal
    ↓
    avatarUrl: "/avatars/default-B.jpeg" (relatif)
    ↓
AuthContext.login()
    ↓
resolveAvatarUrl()
    ↓
    avatarUrl: "http://localhost:8080/avatars/default-B.jpeg" (absolu)
    ↓
localStorage + user state
    ↓
Tous les composants affichent le bon avatar
```

### Après Upload Avatar
```
AvatarService.uploadAvatar()
    ↓
    avatarUrl: "/api/avatars/files/abc123.jpg"
    ↓
React Query cache update
    ↓
useAvatarSync détecte le changement
    ↓
updateUserAvatar()
    ↓
resolveAvatarUrl()
    ↓
    avatarUrl: "http://localhost:8080/api/avatars/files/abc123.jpg"
    ↓
localStorage + user state
    ↓
Tous les composants affichent le nouvel avatar
```

## Types d'URLs Gérées

| Type | Exemple | Résolution |
|------|---------|------------|
| Null/Empty | `null`, `""` | `/avatars/default-avatar.png` |
| Absolu HTTP | `http://example.com/avatar.jpg` | Inchangé |
| Absolu HTTPS | `https://example.com/avatar.jpg` | Inchangé |
| Relatif avec / | `/avatars/default-B.jpeg` | `http://localhost:8080/avatars/default-B.jpeg` |
| Relatif sans / | `avatars/default-B.jpeg` | `http://localhost:8080/avatars/default-B.jpeg` |
| API path | `/api/avatars/files/abc.jpg` | `http://localhost:8080/api/avatars/files/abc.jpg` |

## Configuration

L'URL de base de l'API est configurée via variable d'environnement:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

**Fichier**: `.env` ou `.env.local`
```
VITE_API_BASE_URL=http://localhost:8080
```

## Avantages de la Solution

1. ✅ **Résolution centralisée**: Une seule fonction pour tous les cas
2. ✅ **Résolution au login**: Avatar correct dès la connexion
3. ✅ **Persistance correcte**: URL absolue dans localStorage
4. ✅ **Pas de requêtes supplémentaires**: Pas besoin de fetch
5. ✅ **Compatibilité**: Gère tous les types d'URLs
6. ✅ **Maintenabilité**: Logique isolée dans un utilitaire
7. ✅ **Performance**: Résolution une seule fois, pas à chaque render

## Tests à Effectuer

- [x] Build compile sans erreurs
- [ ] Login avec avatar par défaut → Avatar s'affiche correctement
- [ ] Login avec avatar uploadé → Avatar s'affiche correctement
- [ ] Upload nouvel avatar → Tous les avatars se mettent à jour
- [ ] Refresh page → Avatar persiste correctement
- [ ] Navbar mobile → Avatar correct dès le login
- [ ] MobileMenu → Avatar correct dès le login
- [ ] Desktop UserAvatarMenu → Avatar correct dès le login
- [ ] ProfileCard → Avatar correct
- [ ] Logout puis login → Avatar correct

## Fichiers Modifiés

1. ✅ `client/src/shared/utils/avatarUtils.ts` - Nouveau fichier
2. ✅ `client/src/shared/contexts/AuthContext.tsx` - Résolution au login et update
3. ✅ Build successful

## Notes Techniques

### Pourquoi résoudre au login et pas à l'affichage?

**Option 1: Résolution à l'affichage** (rejetée)
```typescript
// Dans chaque composant
<img src={resolveAvatarUrl(user.avatarUrl)} />
```
❌ Problèmes:
- Résolution répétée à chaque render
- Code dupliqué dans chaque composant
- Performance impact

**Option 2: Résolution au login** (choisie)
```typescript
// Une seule fois au login
const userWithResolvedAvatar = {
    ...newUser,
    avatarUrl: resolveAvatarUrl(newUser.avatarUrl)
};
```
✅ Avantages:
- Résolution une seule fois
- URL absolue stockée
- Composants plus simples
- Meilleure performance

### Compatibilité Backend

Cette solution est compatible avec le backend actuel sans modifications:
- ✅ Avatars par défaut: `/avatars/default-*.jpeg`
- ✅ Avatars uploadés: `/api/avatars/files/*.jpg`
- ✅ Pas de changement backend nécessaire

### Migration Future

Si le backend change pour retourner toujours des URLs absolues:
- ✅ `resolveAvatarUrl()` continuera de fonctionner (détecte déjà les URLs absolues)
- ✅ Pas de changement frontend nécessaire
- ✅ Rétrocompatibilité garantie
