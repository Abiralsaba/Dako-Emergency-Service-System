package com.serds.controller;

import com.serds.entity.IncidentReport;
import com.serds.service.IncidentReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Incident reports — responders file these after handling an emergency
@RestController
@RequestMapping("/api/reports")
public class IncidentReportController {

    private final IncidentReportService reportService;

    public IncidentReportController(IncidentReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/emergency/{requestId}/responder/{responderId}")
    public ResponseEntity<IncidentReport> fileReport(@PathVariable Long requestId,
                                                      @PathVariable Long responderId,
                                                      @RequestBody IncidentReport report) {
        return ResponseEntity.ok(reportService.fileReport(requestId, responderId, report));
    }

    @GetMapping("/emergency/{requestId}")
    public ResponseEntity<IncidentReport> getByEmergency(@PathVariable Long requestId) {
        return ResponseEntity.ok(reportService.getByRequestId(requestId));
    }

    @GetMapping("/responder/{responderId}")
    public ResponseEntity<List<IncidentReport>> getByResponder(@PathVariable Long responderId) {
        return ResponseEntity.ok(reportService.getByResponder(responderId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReport> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getById(id));
    }
}
