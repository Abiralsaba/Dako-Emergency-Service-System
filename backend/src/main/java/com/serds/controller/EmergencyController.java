package com.serds.controller;

import com.serds.dto.EmergencyRequestDTO;
import com.serds.dto.EmergencyResponseDTO;
import com.serds.dto.StatusUpdateDTO;
import com.serds.service.EmergencyService;
import com.serds.service.FireDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Emergency lifecycle endpoints — from SOS trigger to resolution
// userId is extracted from JWT, never trusted from request body
@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final FireDetectionService fireDetectionService;

    public EmergencyController(EmergencyService emergencyService,
                               FireDetectionService fireDetectionService) {
        this.emergencyService = emergencyService;
        this.fireDetectionService = fireDetectionService;
    }

    // Citizen triggers SOS — citizenId extracted from JWT
    @PostMapping
    public ResponseEntity<EmergencyResponseDTO> createEmergency(
            @RequestBody EmergencyRequestDTO dto, Authentication auth) {
        Long citizenId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(emergencyService.createEmergency(citizenId, dto));
    }

    // 🔥 Fire detection endpoint — citizen uploads photo for AI analysis
    // If fire is detected, auto-creates a CRITICAL severity emergency
    @PostMapping("/fire-detect")
    public ResponseEntity<Map<String, Object>> detectFireAndDispatch(
            @RequestParam("file") MultipartFile file,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {

        Long citizenId = (Long) auth.getPrincipal();

        // Step 1: Read file bytes first (InputStream can only be read once)
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            System.err.println("[FIRE-DETECT] Failed to read file: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("fire_detected", false);
            errorResponse.put("confidence", 0);
            errorResponse.put("details", "Failed to read uploaded file");
            errorResponse.put("emergency_created", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Step 2: Save uploaded photo to disk
        String imageUrl = null;
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/fire/";
            new File(uploadDir).mkdirs();
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                : ".jpg";
            String filename = "fire_" + citizenId + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            java.nio.file.Files.write(java.nio.file.Path.of(uploadDir + filename), fileBytes);
            imageUrl = "/uploads/fire/" + filename;
            System.out.println("[FIRE-DETECT] Photo saved: " + imageUrl);
        } catch (IOException e) {
            System.err.println("[FIRE-DETECT] Failed to save photo: " + e.getMessage());
        }

        // Step 3: Send image to Python AI service
        Map<String, Object> aiResult = fireDetectionService.analyzeImage(file);

        boolean fireDetected = (boolean) aiResult.getOrDefault("fire_detected", false);
        double confidence = ((Number) aiResult.getOrDefault("confidence", 0.0)).doubleValue();
        String details = (String) aiResult.getOrDefault("details", "");

        System.out.println("[FIRE-DETECT] citizenId=" + citizenId +
            " | fireDetected=" + fireDetected + " | confidence=" + confidence);

        Map<String, Object> response = new HashMap<>();
        response.put("fire_detected", fireDetected);
        response.put("confidence", confidence);
        response.put("details", details);
        response.put("image_url", imageUrl);

        // Step 3: If fire detected, auto-create emergency
        if (fireDetected) {
            try {
                EmergencyRequestDTO dto = new EmergencyRequestDTO();
                dto.setEmergencyType("FIRE");
                dto.setLatitude(latitude);
                dto.setLongitude(longitude);
                dto.setDescription(
                    (description != null ? description + " | " : "") +
                    "🔥 AI Fire Detection: " + details +
                    " (Confidence: " + Math.round(confidence * 100) + "%)"
                );

                System.out.println("[FIRE-DETECT] Creating CRITICAL emergency for citizen " + citizenId);

                EmergencyResponseDTO emergency = emergencyService.createEmergencyWithSeverity(
                    citizenId, dto, "CRITICAL", imageUrl
                );

                response.put("emergency_created", true);
                response.put("emergency", emergency);
                System.out.println("[FIRE-DETECT] Emergency #" + emergency.getId() + " created successfully!");
            } catch (Exception e) {
                response.put("emergency_created", false);
                response.put("error", e.getMessage());
                System.out.println("[FIRE-DETECT] ERROR creating emergency: " + e.getMessage());
            }
        } else {
            response.put("emergency_created", false);
        }

        return ResponseEntity.ok(response);
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
