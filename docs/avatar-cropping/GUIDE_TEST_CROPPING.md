# Guide de test - Fonctionnalité de cropping d'avatar

## Comment tester le système de cropping

### 1. Démarrer l'application
```bash
cd client
npm run dev
```

### 2. Aller sur la page de profil
- Connectez-vous à l'application
- Allez dans la section "Profile" ou "Edit Profile"
- Cherchez la section "Profile Picture"

### 3. Tester le cropping
1. **Cliquez sur "Choose File" ou faites glisser une image**
2. **Sélectionnez une image** (JPEG, PNG, ou WebP, moins de 5MB)
3. **Le cropper devrait s'ouvrir automatiquement** dans une modal

### 4. Vérifier les logs de debug
Ouvrez la console du navigateur (F12) et cherchez les messages :
- `🔍 [AvatarUploadWithCropping] Fichier sélectionné:`
- `🔍 [AvatarUploadWithCropping] Validation:`
- `✅ [AvatarUploadWithCropping] Démarrage du cropping...`
- `🎨 [AvatarUploadWithCropping] Affichage du cropper modal`

### 5. Utiliser le cropper
- **Redimensionner** : Faites glisser les coins de la zone de crop
- **Déplacer** : Cliquez et faites glisser à l'intérieur de la zone
- **Zoomer** : Utilisez les contrôles de zoom ou la molette de la souris
- **Prévisualiser** : Voyez le résultat en temps réel
- **Valider** : Cliquez sur "Crop & Upload" pour finaliser

### 6. Problèmes possibles

#### Le cropper ne s'ouvre pas ?
- Vérifiez la console pour les erreurs
- Assurez-vous que le fichier est valide (JPEG/PNG/WebP, <5MB)
- Vérifiez que `enableCropping` est à `true`

#### Erreurs de validation ?
- Taille de fichier > 5MB
- Format non supporté
- Fichier corrompu

#### Le composant n'apparaît pas ?
- Vérifiez que vous êtes sur la bonne page (Profile/Edit Profile)
- Assurez-vous d'être connecté
- Rechargez la page

### 7. Test avec le composant de debug
Si le cropping ne fonctionne pas dans l'interface principale, testez avec :

```typescript
// Ajoutez ceci temporairement dans App.tsx ou une route de test
import { DebugCropping } from './debug-cropping';

// Dans le JSX :
<DebugCropping />
```

### 8. Fonctionnalités du cropper
- ✅ Sélection de zone carrée
- ✅ Redimensionnement par les coins/bords
- ✅ Déplacement de la zone
- ✅ Zoom/dézoom
- ✅ Prévisualisation en temps réel
- ✅ Validation de qualité
- ✅ Export en format optimisé

### 9. Différences avec l'ancien système
- **Avant** : Upload direct de l'image originale
- **Maintenant** : Cropping interactif puis upload de l'image optimisée
- **Avantage** : Images parfaitement carrées, taille optimisée, meilleure qualité

### 10. Désactiver le cropping (si nécessaire)
Pour revenir à l'ancien comportement temporairement :
```typescript
<AvatarUploadWithCropping
    userId={user.userId}
    enableCropping={false}  // Désactive le cropping
    // ... autres props
/>
```