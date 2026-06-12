package com.serds.repository;

import com.serds.entity.Shift;
import com.serds.enums.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByResponderIdOrderByStartTimeDesc(Long responderId);
    List<Shift> findByStationIdOrderByStartTimeDesc(Long stationId);
    List<Shift> findByStatus(ShiftStatus status);

    // Find shifts happening right now at a station
    @Query("SELECT s FROM Shift s WHERE s.station.id = :stationId AND s.startTime <= :now AND s.endTime >= :now")
    List<Shift> findActiveShiftsByStation(@Param("stationId") Long stationId, @Param("now") LocalDateTime now);

    // Find shifts for a specific responder that are currently active
    @Query("SELECT s FROM Shift s WHERE s.responder.id = :responderId AND s.status = 'ACTIVE'")
    List<Shift> findActiveByResponderId(@Param("responderId") Long responderId);
}
