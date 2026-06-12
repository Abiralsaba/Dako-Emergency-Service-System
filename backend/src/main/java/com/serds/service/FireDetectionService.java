package com.serds.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Communicates with the Python Fire Detection microservice.
 * Sends images for AI analysis and returns fire detection results.
 * Falls back gracefully if the AI service is unavailable.
 */
@Service
public class FireDetectionService {

    @Value("${app.fire-detection.service-url}")
    private String fireDetectionUrl;

    private final RestTemplate restTemplate;

    public FireDetectionService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send an image to the Python fire detection service for analysis.
     *
     * @param file The uploaded image file
     * @return Map with keys: fire_detected (boolean), confidence (double), details (string)
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeImage(MultipartFile file) {
        try {
            // Build multipart request to forward to Python service
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Wrap the file bytes as a resource with the original filename
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new HttpEntity<>(resource, createFileHeaders(file)));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Call Python service
            ResponseEntity<Map> response = restTemplate.exchange(
                fireDetectionUrl + "/detect",
                HttpMethod.POST,
                requestEntity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            // If response is not successful, return fallback
            return fallbackResponse("AI service returned non-OK status");

        } catch (Exception e) {
            // AI service is down or unreachable — allow manual submission
            return fallbackResponse("AI service unavailable: " + e.getMessage());
        }
    }

    /**
     * Check if the Python fire detection service is running.
     */
    public boolean isServiceAvailable() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                fireDetectionUrl + "/health", Map.class
            );
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    private HttpHeaders createFileHeaders(MultipartFile file) {
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.parseMediaType(
            file.getContentType() != null ? file.getContentType() : "image/jpeg"
        ));
        return fileHeaders;
    }

    /**
     * Fallback when the AI service is unavailable.
     * Returns "not detected" so the citizen can still submit manually.
     */
    private Map<String, Object> fallbackResponse(String reason) {
        return Map.of(
            "fire_detected", false,
            "confidence", 0.0,
            "details", "Fire detection service unavailable. You can still submit manually. (" + reason + ")",
            "service_available", false
        );
    }
}
