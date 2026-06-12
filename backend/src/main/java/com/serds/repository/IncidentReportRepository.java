package com.serds.repository;

import com.serds.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    Optional<IncidentReport> findByRequestId(Long requestId);
    List<IncidentReport> findByResponderId(Long responderId);
    boolean existsByRequestId(Long requestId);
}
