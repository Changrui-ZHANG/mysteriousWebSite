# Post-Mortem : Correction de l'Affichage des Réactions

## Résumé du Problème
Les réactions sur les messages ne s'affichaient pas lors du chargement initial de la page "Message Wall", bien qu'elles soient présentes en base de données. Elles n'apparaissaient qu'après une interaction utilisateur.

---

## Causes Racines
Le bug était causé par la combinaison de deux problèmes distincts qui se masquaient l'un l'autre.

### 1. Incompatibilité Base de Données <-> Java (Persistance)
*   **Le Problème :** La base de données stocke les réactions sous forme de chaîne JSON (`TEXT`) dans la colonne `reactions`. L'entité Java `Message` essayait de mapper cela directement vers une `List<MessageReaction>` ou utilisait des champs transitoires (`reactionsJson`) avec une logique manuelle complexe (`@PostLoad`).
*   **Symptôme :** Lors de requêtes complexes (comme `findAll` avec tri), Hibernate n'arrivait pas à peupler correctement l'objet Java.
*   **Correction :** Implémentation d'un `AttributeConverter` JPA standard.
    *   **Fichier :** `server/src/main/java/com/changrui/mysterious/domain/messagewall/converter/ReactionsConverter.java`
    *   **Rôle :** Convertit automatiquement et silencieusement le JSON en Liste Java et inversement.

### 2. Perte de Données dans le Service (Logique Métier)
*   **Le Problème :** Même une fois la base de données corrigée (les logs montraient "Loaded X reactions"), les données n'arrivaient pas au frontend.
*   **Le Coupable :** `ProfileIntegrationService.enrichMessagesWithProfiles`.
*   **Mécanisme :** Ce service enrichit les messages avec les avatars des utilisateurs. Pour ce faire, il créait une **copie** de chaque objet `Message`.
*   **L'Erreur :** Lors de la copie manuelle des champs (`setId`, `setMessage`, `setUserId`...), le développeur avait oublié d'inclure :
    ```java
    enrichedMessage.setReactions(message.getReactions());
    ```
*   **Conséquence :** Le backend chargeait les données, créait une copie vide de réactions, et envoyait cette copie vide au frontend.

---

## Solution Appliquée

1.  **Architecture Propre :** Suppression des hacks JSON manuels dans `Message.java` au profit de l'annotation `@Convert(converter = ReactionsConverter.class)`.
2.  **Correction du Service :** Ajout de la copie explicite des réactions dans `ProfileIntegrationService.java`.
3.  **Nettoyage Frontend :** Mise à jour des types TypeScript pour inclure le champ `reactions` manquant dans l'interface `Message`.

Le système est maintenant robuste et utilise les standards JPA pour la gestion du JSON.
