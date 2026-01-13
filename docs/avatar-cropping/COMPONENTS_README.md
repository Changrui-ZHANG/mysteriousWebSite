# Avatar Cropping System

Un système complet de découpage d'avatar avec interface interactive, prévisualisation en temps réel et validation de qualité.

## 🚀 Fonctionnalités

- **Découpage interactif** avec zone de sélection carrée
- **Prévisualisation temps réel** en format circulaire et carré
- **Contrôles de zoom** et redimensionnement intuitifs
- **Validation en temps réel** avec indicateurs de qualité
- **Support mobile** avec gestes tactiles (pinch-to-zoom)
- **Interface modale** complète avec navigation
- **Gestion d'erreurs** robuste et messages utilisateur
- **Performance optimisée** pour les grandes images
- **Intégration transparente** avec le système d'avatar existant

## 📦 Composants Principaux

### AvatarCropper
Composant principal orchestrant toute l'interface de découpage.

```tsx
import { AvatarCropper } from './cropping/AvatarCropper';

<AvatarCropper
  imageFile={file}
  onCropComplete={(result) => console.log('Crop completed:', result)}
  onCancel={() => console.log('Crop cancelled')}
  options={{
    outputSize: 256,
    minCropSize: 128,
    maxScale: 3.0
  }}
/>
```

### AvatarUploadWithCropping
Version améliorée du composant AvatarUpload avec découpage intégré.

```tsx
import { AvatarUploadWithCropping } from './AvatarUploadWithCropping';

<AvatarUploadWithCropping
  userId="user-123"
  enableCropping={true}
  onUploadComplete={(url) => console.log('Upload complete:', url)}
  onUploadError={(error) => console.error('Upload error:', error)}
/>
```

### Composants Individuels

- **CropCanvas** : Canvas interactif pour la manipulation d'image
- **CropPreview** : Aperçu en temps réel du résultat
- **CropControls** : Contrôles de zoom et bouton reset
- **CropValidation** : Messages de validation et recommandations

## 🎣 Hooks

### useImageCropper
Hook principal pour la gestion d'état du découpage.

```tsx
import { useImageCropper } from './hooks/cropping/useImageCropper';

const {
  cropState,
  setCropArea,
  setScale,
  resetCrop,
  generateCropResult,
  validation,
  isProcessing,
  error
} = useImageCropper(imageFile, options);
```

### useCropCanvas
Hook pour les interactions canvas (souris/tactile).

```tsx
import { useCropCanvas } from './hooks/cropping/useCropCanvas';

const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  redrawCanvas,
  interactionState
} = useCropCanvas(options);
```

### useCropValidation
Hook pour la validation et l'évaluation de qualité.

```tsx
import { useCropValidation } from './hooks/cropping/useCropValidation';

const {
  validation,
  validateCrop,
  isValidCrop,
  getQualityAssessment
} = useCropValidation(options);
```

## 🔧 Utilitaires

### ImageProcessor
Classe pour le traitement d'images.

```tsx
import { ImageProcessor } from './utils/cropping/ImageProcessor';

// Charger une image
const result = await ImageProcessor.loadImage(file);

// Découper une image
const blob = await ImageProcessor.cropImage(image, cropArea, outputSize);

// Valider la qualité
const validation = ImageProcessor.validateCropQuality(image, cropArea);
```

### CropCalculations
Classe pour les calculs de découpage.

```tsx
import { CropCalculations } from './utils/cropping/CropCalculations';

// Maintenir le ratio carré
const squareArea = CropCalculations.enforceSquareRatio(cropArea);

// Contraindre aux limites de l'image
const constrained = CropCalculations.constrainToImageBounds(cropArea, imageSize);

// Calculer l'échelle optimale
const scale = CropCalculations.calculateOptimalScale(params);
```

### CanvasHelpers
Classe pour les opérations canvas.

```tsx
import { CanvasHelpers } from './utils/cropping/CanvasHelpers';

// Configurer le canvas
const ctx = CanvasHelpers.setupCanvas(canvas, width, height);

// Dessiner l'image
CanvasHelpers.drawImage(ctx, image, dimensions, scale, offset);

// Dessiner la zone de découpage
CanvasHelpers.drawCropArea(ctx, cropArea, scale, offset, isActive);
```

## 📱 Support Mobile

Le système inclut un support complet pour les appareils mobiles :

- **Événements tactiles** : Support des gestes touch
- **Pinch-to-zoom** : Zoom avec gestes de pincement
- **Interface responsive** : Adaptation aux différentes tailles d'écran
- **Optimisations performance** : Gestion efficace sur appareils moins puissants

## 🎨 Personnalisation

### Options de Configuration

```tsx
const options = {
  maxFileSize: 5 * 1024 * 1024,  // 5MB
  minCropSize: 128,               // 128x128 pixels minimum
  maxScale: 5.0,                  // Zoom maximum 5x
  outputSize: 256,                // Taille de sortie 256x256
  outputQuality: 0.9              // Qualité JPEG 90%
};
```

### Constantes Personnalisables

```tsx
// Dans constants.ts
export const CANVAS_CONFIG = {
  DEFAULT_SIZE: 400,
  BACKGROUND_COLOR: '#f8f9fa',
  CROP_BORDER_COLOR: '#007bff',
  HANDLE_SIZE: 8
};

export const QUALITY_THRESHOLDS = {
  HIGH_QUALITY_RATIO: 0.8,
  MEDIUM_QUALITY_RATIO: 0.5
};
```

## 🧪 Tests

Le système inclut une infrastructure complète pour les tests :

- **Tests unitaires** : Validation des utilitaires et calculs
- **Tests de propriétés** : Vérification des invariants (ratio carré, limites)
- **Tests d'intégration** : Workflow complet de découpage
- **Tests de performance** : Validation sur différentes tailles d'images

## 🔍 Validation et Qualité

### Validation Automatique

- **Taille minimale** : Vérification de la taille de découpage
- **Limites d'image** : Contraintes dans les bordures
- **Ratio carré** : Maintien automatique du format carré
- **Qualité estimée** : Évaluation basée sur la résolution

### Indicateurs de Qualité

- **Haute qualité** : Zone de découpage ≥ 80% de la taille de sortie
- **Qualité moyenne** : Zone de découpage ≥ 50% de la taille de sortie  
- **Faible qualité** : Zone de découpage < 50% de la taille de sortie

## 🚀 Intégration

### Avec le Système Existant

Le système s'intègre parfaitement avec :

- **AvatarUpload** : Composant d'upload existant
- **AvatarService** : Service de gestion d'avatars
- **useAvatarUpload** : Hook d'upload existant
- **ProfileForm** : Formulaire de profil

### Migration

Pour migrer du système existant :

1. Remplacer `AvatarUpload` par `AvatarUploadWithCropping`
2. Activer le découpage avec `enableCropping={true}`
3. Gérer les callbacks `onCropComplete` et `onCropCancel`

## 📚 Exemples

Voir `CroppingExample.tsx` pour un exemple complet d'utilisation.

## 🐛 Dépannage

### Problèmes Courants

1. **Canvas non supporté** : Vérification automatique avec fallback
2. **Images trop grandes** : Optimisation automatique et avertissements
3. **Performance lente** : Réduction automatique de qualité si nécessaire
4. **Erreurs de mémoire** : Gestion des limites et nettoyage automatique

### Messages d'Erreur

- `IMAGE_LOAD_FAILED` : Échec du chargement d'image
- `CROP_AREA_TOO_SMALL` : Zone de découpage trop petite
- `CROP_AREA_OUT_OF_BOUNDS` : Zone hors limites d'image
- `CANVAS_NOT_SUPPORTED` : Canvas non supporté par le navigateur

## 🔄 Workflow Complet

1. **Sélection de fichier** → Validation du format et de la taille
2. **Chargement d'image** → Initialisation du découpage optimal
3. **Interaction utilisateur** → Ajustement de la zone et du zoom
4. **Validation temps réel** → Vérification de la qualité
5. **Génération du résultat** → Création de l'image découpée
6. **Upload final** → Sauvegarde de l'avatar

Le système de découpage d'avatar offre une expérience utilisateur moderne et intuitive pour créer des avatars parfaits ! 🎯