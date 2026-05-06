package com.serds.repository;

import com.serds.entity.Responder;
import com.serds.entity.ServiceType;
import com.serds.enums.ApprovalStatus;
import com.serds.enums.ResponderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// Finds available responders for the dispatch engine
@Repository
public interface ResponderRepository extends JpaRepository<Responder, Long> {

    List<Responder> findByServiceTypeAndIsAvailableTrue(ServiceType serviceType);
    List<Responder> findByIsAvailableTrue();

    // Find approved + online + available responders of a given type within a radius (Haversine)
    @Query(value = """
        SELECT r.*, u.* FROM responders r
        JOIN users u ON r.id = u.id
        WHERE r.service_type = :serviceType
          AND r.approval_status = 'APPROVED'
          AND r.current_status = 'ONLINE'
          AND r.is_available = true
          AND u.is_active = true
          AND u.latitude IS NOT NULL
          AND u.longitude IS NOT NULL
          AND (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude))
               * cos(radians(u.longitude) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(u.latitude)))) <= :radiusKm
        ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude))
               * cos(radians(u.longitude) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(u.latitude)))) ASC
        """, nativeQuery = true)
    List<Responder> findNearbyAvailable(
            @Param("serviceType") String serviceType,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm);

    // Find all types within radius (for GENERAL emergencies)
    @Query(value = """
        SELECT r.*, u.* FROM responders r
        JOIN users u ON r.id = u.id
        WHERE r.approval_status = 'APPROVED'
          AND r.current_status = 'ONLINE'
          AND r.is_available = true
          AND u.is_active = true
          AND u.latitude IS NOT NULL
          AND u.longitude IS NOT NULL
          AND (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude))
               * cos(radians(u.longitude) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(u.latitude)))) <= :radiusKm
        ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(u.latitude))
               * cos(radians(u.longitude) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(u.latitude)))) ASC
        """, nativeQuery = true)
    List<Responder> findAllNearbyAvailable(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm);

    // Admin: find responders pending approval
    List<Responder> findByApprovalStatus(ApprovalStatus status);

    // Admin: all responders
    List<Responder> findAllByOrderByCreatedAtDesc();

    // Find by status
    List<Responder> findByCurrentStatus(ResponderStatus status);
}
