package com.serds.controller;

import com.serds.dto.EmergencyRequestDTO;
import com.serds.dto.EmergencyResponseDTO;
import com.serds.dto.StatusUpdateDTO;
import com.serds.service.EmergencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Emergency lifecycle endpoints — from SOS trigger to resolution
// userId is extracted from JWT, never trusted from request body
@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyService emergencyService;

    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    // Citizen triggers SOS — citizenId extracted from JWT
    @PostMapping
    public ResponseEntity<EmergencyResponseDTO> createEmergency(
            @RequestBody EmergencyRequestDTO dto, Authentication auth) {
        Long citizenId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.createEmergency(citizenId, dto));
    }

    // Get a single emergency's full details
    @GetMapping("/{id}")
    public ResponseEntity<EmergencyResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyService.getEmergencyById(id));
    }

    // Responder updates the status (EN_ROUTE → ARRIVED → COMPLETED)
    @PutMapping("/{id}/status")
    public ResponseEntity<EmergencyResponseDTO> updateStatus(
            @PathVariable Long id, @RequestBody StatusUpdateDTO dto, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.updateStatus(id, dto.getStatus(), userId));
    }

    // Responder accepts an offer
    @PostMapping("/{id}/accept")
    public ResponseEntity<EmergencyResponseDTO> acceptOffer(
            @PathVariable Long id, Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.acceptOffer(id, responderId));
    }

    // Responder declines an offer
    @PostMapping("/{id}/decline")
    public ResponseEntity<Void> declineOffer(
            @PathVariable Long id, Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        emergencyService.declineOffer(id, responderId);
        return ResponseEntity.ok().build();
    }

    // Citizen cancels their emergency
    @PostMapping("/{id}/cancel")
    public ResponseEntity<EmergencyResponseDTO> cancelEmergency(
            @PathVariable Long id, @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        Long citizenId = (Long) auth.getPrincipal();
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(emergencyService.cancelEmergency(id, citizenId, reason));
    }

    // Citizen's emergency history
    @GetMapping("/citizen/history")
    public ResponseEntity<List<EmergencyResponseDTO>> citizenHistory(Authentication auth) {
        Long citizenId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.getCitizenEmergencies(citizenId));
    }

    // Responder's active assignments
    @GetMapping("/responder/active")
    public ResponseEntity<List<EmergencyResponseDTO>> responderJobs(Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.getResponderActiveJobs(responderId));
    }

    // All active emergencies (for admin or general queries)
    @GetMapping("/active")
    public ResponseEntity<List<EmergencyResponseDTO>> allActive() {
        return ResponseEntity.ok(emergencyService.getAllActive());
    }
}
