package com.serds.repository;

import com.serds.entity.EmergencyOffer;
import com.serds.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyOfferRepository extends JpaRepository<EmergencyOffer, Long> {

    // Find active (SENT) offers for a specific emergency
    List<EmergencyOffer> findByEmergencyIdAndStatus(Long emergencyId, OfferStatus status);

    // Find a specific offer for a responder
    Optional<EmergencyOffer> findByEmergencyIdAndResponderId(Long emergencyId, Long responderId);

    // Find all SENT offers that have expired
    List<EmergencyOffer> findByStatusAndExpiresAtBefore(OfferStatus status, LocalDateTime now);

    // Find pending offers for a responder
    List<EmergencyOffer> findByResponderIdAndStatus(Long responderId, OfferStatus status);

    // Count offers sent for an emergency
    long countByEmergencyIdAndStatus(Long emergencyId, OfferStatus status);
}
