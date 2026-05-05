package com.serds.controller;

import com.serds.dto.EmergencyResponseDTO;
import com.serds.entity.Responder;
import com.serds.enums.ApprovalStatus;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.ResponderRepository;
import com.serds.service.EmergencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Admin-only endpoints — approval, monitoring, manual dispatch
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ResponderRepository responderRepo;
    private final EmergencyService emergencyService;

    public AdminController(ResponderRepository responderRepo, EmergencyService emergencyService) {
        this.responderRepo = responderRepo;
        this.emergencyService = emergencyService;
    }

    // Get all responders pending approval
    @GetMapping("/responders/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingResponders() {
        var pending = responderRepo.findByApprovalStatus(ApprovalStatus.PENDING);
        var result = pending.stream().map(this::responderToMap).toList();
        return ResponseEntity.ok(result);
    }

    // Get all responders
    @GetMapping("/responders")
    public ResponseEntity<List<Map<String, Object>>> getAllResponders() {
        var all = responderRepo.findAllByOrderByCreatedAtDesc();
        var result = all.stream().map(this::responderToMap).toList();
        return ResponseEntity.ok(result);
    }

    // Approve a responder
    @PostMapping("/responders/{id}/approve")
    public ResponseEntity<Map<String, String>> approveResponder(@PathVariable Long id) {
        Responder responder = responderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));
        responder.setApprovalStatus(ApprovalStatus.APPROVED);
        responderRepo.save(responder);
        return ResponseEntity.ok(Map.of("status", "APPROVED"));
    }

    // Reject a responder
    @PostMapping("/responders/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectResponder(@PathVariable Long id) {
        Responder responder = responderRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));
        responder.setApprovalStatus(ApprovalStatus.REJECTED);
        responderRepo.save(responder);
        return ResponseEntity.ok(Map.of("status", "REJECTED"));
    }

    // Get unassigned emergencies
    @GetMapping("/emergencies/unassigned")
    public ResponseEntity<List<EmergencyResponseDTO>> getUnassigned() {
        return ResponseEntity.ok(emergencyService.getUnassigned());
    }

    // Manual assign responder to emergency
    @PostMapping("/emergencies/{emergencyId}/assign/{responderId}")
    public ResponseEntity<EmergencyResponseDTO> manualAssign(
            @PathVariable Long emergencyId, @PathVariable Long responderId) {
        return ResponseEntity.ok(emergencyService.manualAssign(emergencyId, responderId));
    }

    // Dashboard metrics
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        var active = emergencyService.getAllActive();
        var unassigned = emergencyService.getUnassigned();
        var pending = responderRepo.findByApprovalStatus(ApprovalStatus.PENDING);

        return ResponseEntity.ok(Map.of(
            "activeEmergencies", active.size(),
            "unassignedEmergencies", unassigned.size(),
            "pendingApprovals", pending.size(),
            "totalResponders", responderRepo.count()
        ));
    }

    private Map<String, Object> responderToMap(Responder r) {
        return Map.of(
            "id", r.getId(),
            "fullName", r.getFullName(),
            "phoneNumber", r.getPhoneNumber(),
            "serviceType", r.getServiceType().name(),
            "approvalStatus", r.getApprovalStatus().name(),
            "currentStatus", r.getCurrentStatus().name(),
            "vehicleReg", r.getVehicleRegistrationNumber() != null ? r.getVehicleRegistrationNumber() : "",
            "reliabilityScore", r.getReliabilityScore(),
            "totalResponses", r.getTotalResponseCount()
        );
    }
}
