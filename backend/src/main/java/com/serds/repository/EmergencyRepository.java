package com.serds.repository;

import com.serds.entity.EmergencyRequest;
import com.serds.enums.EmergencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Handles all emergency request queries
@Repository
public interface EmergencyRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<EmergencyRequest> findByResponderIdAndStatusIn(Long responderId, List<EmergencyStatus> statuses);
    List<EmergencyRequest> findByStatus(EmergencyStatus status);
    List<EmergencyRequest> findByStatusIn(List<EmergencyStatus> statuses);

    // Count active emergencies for a citizen (prevent duplicate SOS)
    long countByCitizenIdAndStatusIn(Long citizenId, List<EmergencyStatus> statuses);

    // Unassigned emergencies for admin
    List<EmergencyRequest> findByStatusOrderByCreatedAtAsc(EmergencyStatus status);
}
