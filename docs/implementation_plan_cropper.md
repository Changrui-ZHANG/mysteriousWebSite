# Refonte AvatarCropper - Glassmorphism

## Problème
L'utilisateur signale que la page de découpage photo est mal intégrée.
Analyse : Le fichier `AvatarCropper.tsx` utilise des styles 'hardcodés' (bg-white, shadow-xl, border-gray-200) qui jurent avec le nouveau thème Glassmorphism. De plus, il s'affiche dans une modale fixe qui peut ne pas être alignée avec le reste de l'UI.

## Changements Proposés
1.  **Style du conteneur** : Utiliser `.glass-panel` ou un style similaire pour la modale principale.
2.  **Backdrop** : Utiliser un backdrop flou (blur).
3.  **Couleurs** : Remplacer les couleurs hardcodées (gray-900, blue-600) par les variables CSS (`var(--text-primary)`, `var(--accent-primary)`).
4.  **Boutons** : Styliser les boutons annulé/appliquer pour correspondre au nouveau design.
5.  **Canvas Preview** : Ajouter une bordure glassmorphism.

## Fichiers à modifier
- `client/src/domain/profile/components/cropping/AvatarCropper.tsx`

## Plan de vérification
- Appliquer les changements.
- Le code sera vérifié via relecture car je ne peux pas lancer l'interface graphique.
