package com.serds.controller;

import com.serds.entity.Responder;
import com.serds.enums.ResponderStatus;
import com.serds.enums.ApprovalStatus;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.EmergencyOfferRepository;
import com.serds.repository.ResponderRepository;
import com.serds.enums.OfferStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Responder-specific endpoints — go online/offline, view pending offers
@RestController
@RequestMapping("/api/responder")
public class ResponderController {

    private final ResponderRepository responderRepo;
    private final EmergencyOfferRepository offerRepo;

    public ResponderController(ResponderRepository responderRepo, EmergencyOfferRepository offerRepo) {
        this.responderRepo = responderRepo;
        this.offerRepo = offerRepo;
    }

    // Toggle online/offline
    @PostMapping("/toggle-status")
    public ResponseEntity<Map<String, String>> toggleStatus(Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        Responder responder = responderRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));

        if (responder.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new InvalidOperationException("Your account is not yet approved by admin");
        }

        if (responder.getCurrentStatus() == ResponderStatus.OFFLINE) {
            responder.setCurrentStatus(ResponderStatus.ONLINE);
            responder.setIsAvailable(true);
        } else if (responder.getCurrentStatus() == ResponderStatus.ONLINE) {
            responder.setCurrentStatus(ResponderStatus.OFFLINE);
            responder.setIsAvailable(false);
        } else {
            throw new InvalidOperationException("Cannot toggle status while on an active job");
        }

        responderRepo.save(responder);
        return ResponseEntity.ok(Map.of("status", responder.getCurrentStatus().name()));
    }

    // Get current status
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        Responder responder = responderRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));

        return ResponseEntity.ok(Map.of(
            "status", responder.getCurrentStatus().name(),
            "isAvailable", responder.getIsAvailable(),
            "approvalStatus", responder.getApprovalStatus().name(),
            "serviceType", responder.getServiceType().name(),
            "reliabilityScore", responder.getReliabilityScore(),
            "totalResponses", responder.getTotalResponseCount()
        ));
    }

    // Get pending offers for this responder
    @GetMapping("/offers")
    public ResponseEntity<List<Map<String, Object>>> getPendingOffers(Authentication auth) {
        Long responderId = (Long) auth.getPrincipal();
        var offers = offerRepo.findByResponderIdAndStatus(responderId, OfferStatus.SENT);
        var result = offers.stream().map(o -> Map.<String, Object>of(
            "offerId", o.getId(),
            "emergencyId", o.getEmergency().getId(),
            "emergencyType", o.getEmergency().getEmergencyType().name(),
            "description", o.getEmergency().getDescription() != null ? o.getEmergency().getDescription() : "",
            "citizenName", o.getEmergency().getCitizen().getFullName(),
            "latitude", o.getEmergency().getLatitude(),
            "longitude", o.getEmergency().getLongitude(),
            "distanceKm", o.getDistanceKm() != null ? o.getDistanceKm() : 0,
            "expiresAt", o.getExpiresAt().toString()
        )).toList();
        return ResponseEntity.ok(result);
    }
}
