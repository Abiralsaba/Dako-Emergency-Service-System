package com.serds.service;

import com.serds.entity.BaseUser;
import com.serds.entity.EmergencyRequest;
import com.serds.entity.IncidentReport;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.IncidentReportRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Handles incident reports filed by responders after resolving an emergency
@Service
@Transactional
public class IncidentReportService {

    private final IncidentReportRepository reportRepo;
    private final EmergencyRepository emergencyRepo;
    private final UserRepository userRepo;

    public IncidentReportService(IncidentReportRepository reportRepo,
                                  EmergencyRepository emergencyRepo,
                                  UserRepository userRepo) {
        this.reportRepo = reportRepo;
        this.emergencyRepo = emergencyRepo;
        this.userRepo = userRepo;
    }

    // Responder files an incident report after handling an emergency
    public IncidentReport fileReport(Long requestId, Long responderId, IncidentReport report) {
        // Can't file duplicate reports
        if (reportRepo.existsByRequestId(requestId)) {
            throw new InvalidOperationException("Report already filed for emergency #" + requestId);
        }

        EmergencyRequest request = emergencyRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency #" + requestId + " not found"));

        BaseUser responder = userRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));

        report.setRequest(request);
        report.setResponder(responder);
        return reportRepo.save(report);
    }

    public IncidentReport getByRequestId(Long requestId) {
        return reportRepo.findByRequestId(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("No report for emergency #" + requestId));
    }

    public List<IncidentReport> getByResponder(Long responderId) {
        return reportRepo.findByResponderId(responderId);
    }

    public IncidentReport getById(Long id) {
        return reportRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Report #" + id + " not found"));
    }
}
