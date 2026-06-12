package com.serds.repository;

import com.serds.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByRequestId(Long requestId);
    List<Rating> findByResponderId(Long responderId);
    List<Rating> findByCitizenId(Long citizenId);
    boolean existsByRequestId(Long requestId);

    // Average score for a responder — used to recalculate their rating
    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.responder.id = :responderId")
    Double findAvgScoreByResponderId(@Param("responderId") Long responderId);
}
