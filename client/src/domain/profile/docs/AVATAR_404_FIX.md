# Fix: Avatar 404 Error au redémarrage du serveur

## Problème
À chaque redémarrage du serveur, l'erreur suivante apparaît :
```
GET http://localhost:5173/api/avatars/files/f0bf523e-fbe3-4c54-82d7-5871b6552e1c_1768272618148_20251026_185633_152.jpeg 404 (Not Found)
```

## Cause
La base de données référence un fichier avatar qui n'existe plus dans le dossier `uploads/avatars/`. Cela peut arriver quand :
1. Les fichiers sont supprimés manuellement
2. Le serveur est redémarré et les fichiers temporaires sont perdus
3. Il y a une incohérence entre la base de données et le système de fichiers

## Solutions

### Solution 1 : Réinitialiser l'avatar (Recommandée)
1. Ouvrir http://localhost:5174/fix-avatar.html
2. Le script supprimera automatiquement la référence d'avatar cassée
3. Recharger la page de profil
4. Uploader un nouvel avatar si désiré

### Solution 2 : Nettoyer manuellement la base de données
Si vous avez accès à la base de données, exécuter :
```sql
UPDATE user_profiles 
SET avatar_url = NULL 
WHERE user_id = 'f0bf523e-fbe3-4c54-82d7-5871b6552e1c';
```

### Solution 3 : Nettoyer les fichiers orphelins
Supprimer les anciens fichiers avatar qui ne sont plus référencés :
```bash
# Dans le dossier uploads/avatars/
# Garder seulement les fichiers récents ou supprimer tous les anciens
```

## Prévention future

### 1. Améliorer la gestion des avatars
- Implémenter un système de nettoyage automatique des fichiers orphelins
- Vérifier l'existence du fichier avant de le référencer
- Utiliser un avatar par défaut si le fichier n'existe pas

### 2. Gestion d'erreur gracieuse
Modifier le frontend pour gérer les avatars manquants :

```typescript
// Dans ProfileCard ou AvatarDisplay
const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/default-avatar.png'; // Avatar par défaut
};

<img 
    src={profile.avatarUrl} 
    onError={handleAvatarError}
    alt="Avatar"
/>
```

### 3. Validation côté backend
Ajouter une vérification dans `AvatarController.serveAvatarFile()` :

```java
@GetMapping("/files/{filename}")
public ResponseEntity<Resource> serveAvatarFile(@PathVariable String filename) {
    try {
        Path filePath = Paths.get("uploads/avatars").resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
        } else {
            // Log l'erreur et nettoyer la référence en base
            logger.warn("Avatar file not found: {}", filename);
            // Optionnel : nettoyer la référence en base de données
            return ResponseEntity.notFound().build();
        }
    } catch (Exception e) {
        logger.error("Error serving avatar file: {}", filename, e);
        return ResponseEntity.notFound().build();
    }
}
```

## Action immédiate
1. Utiliser le script de fix : http://localhost:5174/fix-avatar.html
2. Recharger la page de profil
3. L'erreur 404 devrait disparaître

## Fichiers concernés
- `uploads/avatars/` - Dossier des fichiers avatar
- Base de données - Table `user_profiles`, colonne `avatar_url`
- `AvatarController.java` - Endpoint de service des fichiers
- Frontend - Composants d'affichage d'avatar