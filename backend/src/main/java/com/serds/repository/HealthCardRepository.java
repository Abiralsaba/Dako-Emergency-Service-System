package com.serds.repository;

import com.serds.entity.HealthCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthCardRepository extends JpaRepository<HealthCard, Long> {
    Optional<HealthCard> findByCitizenId(Long citizenId);
    List<HealthCard> findAllByCitizenId(Long citizenId);
}
