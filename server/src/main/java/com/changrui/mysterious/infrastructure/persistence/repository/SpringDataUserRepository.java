package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.AppUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface Spring Data JPA pour accéder aux utilisateurs en base de données.
 * Cette interface est interne à l'infrastructure et ne doit pas être utilisée
 * directement
 * par les couches supérieures.
 */
@Repository
public interface SpringDataUserRepository extends JpaRepository<AppUserEntity, String> {

    Optional<AppUserEntity> findByUsername(String username);

    boolean existsByUsername(String username);
}
