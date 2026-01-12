# Profile Authentication Middleware

Ce package contient le système d'authentification et d'autorisation pour les opérations de profil utilisateur.

## Composants

### ProfileAuthMiddleware
Classe principale qui gère l'authentification et l'autorisation pour les profils :
- Vérification de la propriété des profils
- Application des règles de confidentialité
- Validation des codes d'administration
- Limitation du taux de requêtes (placeholder)
- Journalisation des événements de sécurité

### ProfileAuthInterceptor
Intercepteur Spring qui applique automatiquement le middleware d'authentification aux endpoints de profil :
- Intercepte toutes les requêtes vers `/api/profiles/**`
- Extrait les informations d'authentification
- Applique les règles d'autorisation appropriées
- Gère les exceptions d'authentification

### Annotations

#### @RequireProfileOwnership
Marque les méthodes de contrôleur qui nécessitent la propriété du profil :
```java
@PutMapping("/{userId}")
@RequireProfileOwnership(allowAdminOverride = true)
public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(...)
```

#### @RequireAdmin
Marque les méthodes de contrôleur qui nécessitent un accès administrateur :
```java
@DeleteMapping("/admin/{userId}")
@RequireAdmin(superAdminOnly = true)
public ResponseEntity<ApiResponse<Void>> adminDeleteProfile(...)
```

### AuthUtils
Classe utilitaire pour les opérations d'authentification :
- Extraction des IDs de requêteur
- Extraction des codes d'administration
- Validation des IDs utilisateur
- Détection des endpoints publics

## Flux d'Authentification

### 1. Requête Entrante
```
Client Request → ProfileAuthInterceptor → ProfileAuthMiddleware → Controller
```

### 2. Vérification d'Accès
1. **Extraction des informations** : ID utilisateur, ID requêteur, codes admin
2. **Vérification de l'existence** : Le profil existe-t-il ?
3. **Vérification de la propriété** : Le requêteur est-il propriétaire ?
4. **Application des règles de confidentialité** : Le profil est-il public ?
5. **Limitation du taux** : Le requêteur respecte-t-il les limites ?

### 3. Types d'Accès

#### Accès Public
- Endpoints : `/api/profiles/{userId}/basic`, `/api/profiles/directory`
- Aucune authentification requise
- Respecte les paramètres de confidentialité

#### Accès avec Propriété
- Endpoints : `PUT /api/profiles/{userId}`, `DELETE /api/profiles/{userId}`
- Nécessite que le requêteur soit propriétaire du profil
- Peut être contourné par les administrateurs (si configuré)

#### Accès Administrateur
- Endpoints marqués avec `@RequireAdmin`
- Nécessite un code d'administration valide dans l'en-tête `X-Admin-Code`
- Peut nécessiter un accès super-administrateur

## Configuration

### En-têtes de Requête
- `X-Requester-Id` : ID de l'utilisateur qui fait la requête
- `X-Admin-Code` : Code d'administration pour l'accès privilégié

### Paramètres de Requête
- `requesterId` : Alternative à l'en-tête X-Requester-Id

## Règles de Confidentialité

### Profils Publics
- Visibles par tous les utilisateurs
- Informations filtrées selon les paramètres de confidentialité
- Propriétaire voit toutes les informations

### Profils Privés
- Visibles uniquement par le propriétaire
- Retourne une erreur 401 pour les autres utilisateurs
- Administrateurs peuvent contourner (selon configuration)

## Limitation du Taux (Future)

Le système inclut une structure pour la limitation du taux :
- Mises à jour de profil : 10 par heure par utilisateur
- Téléchargements d'avatar : 5 par heure par utilisateur
- Recherches de profil : 100 par heure par utilisateur
- Accès au répertoire : 50 par heure par utilisateur

## Journalisation de Sécurité

Tous les événements de sécurité sont journalisés :
- Tentatives d'accès aux profils
- Échecs d'authentification
- Violations de propriété
- Accès administrateur

## Exemples d'Utilisation

### Requête de Mise à Jour de Profil
```http
PUT /api/profiles/user123
X-Requester-Id: user123
Content-Type: application/json

{
  "displayName": "Nouveau Nom",
  "bio": "Nouvelle bio"
}
```

### Requête Administrateur
```http
DELETE /api/profiles/user123
X-Admin-Code: admin-secret-code
X-Requester-Id: admin-user
```

### Requête de Visualisation Publique
```http
GET /api/profiles/user123
X-Requester-Id: other-user
```

## Tests

Les tests unitaires couvrent :
- Vérification de la propriété des profils
- Application des règles de confidentialité
- Validation des codes d'administration
- Gestion des cas d'erreur

Exécuter les tests :
```bash
mvn test -Dtest=ProfileAuthMiddlewareTest
```