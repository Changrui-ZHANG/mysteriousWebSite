package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserProfile entity operations.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {

    /**
     * Find profile by user ID
     */
    Optional<UserProfile> findByUserId(String userId);

    /**
     * Search profiles by display name (case-insensitive)
     */
    @Query("SELECT p FROM UserProfile p WHERE LOWER(p.displayName) LIKE LOWER(CONCAT('%', :query, '%')) AND p.isPublic = true")
    List<UserProfile> searchByDisplayName(@Param("query") String query);

    /**
     * Search profiles by display name or bio (case-insensitive)
     */
    @Query("SELECT p FROM UserProfile p WHERE (LOWER(p.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.bio) LIKE LOWER(CONCAT('%', :query, '%'))) AND p.isPublic = true")
    List<UserProfile> searchByDisplayNameOrBio(@Param("query") String query);

    /**
     * Find all public profiles
     */
    List<UserProfile> findByIsPublicTrueOrderByJoinDateDesc();

    /**
     * Find public profiles with limit
     */
    @Query("SELECT p FROM UserProfile p WHERE p.isPublic = true ORDER BY p.joinDate DESC")
    List<UserProfile> findPublicProfiles();

    /**
     * Check if profile exists for user
     */
    boolean existsByUserId(String userId);
}