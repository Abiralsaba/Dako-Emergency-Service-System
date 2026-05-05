package com.serds.service;

import com.serds.dto.EmergencyResponseDTO;
import com.serds.dto.LocationUpdateDTO;
import com.serds.entity.EmergencyOffer;
import com.serds.entity.EmergencyRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

// Broadcasts real-time updates via WebSocket — the "live tracking" engine
@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Push emergency status change to the citizen watching their request
    public void notifyEmergencyUpdate(EmergencyResponseDTO emergency) {
        if (emergency != null) {
            messagingTemplate.convertAndSend(
                "/topic/emergency/" + emergency.getId(), emergency
            );
        }
    }

    // Alert a responder about a new assignment
    public void notifyResponder(Long responderId, EmergencyResponseDTO emergency) {
        messagingTemplate.convertAndSend(
            "/topic/responder/" + responderId, emergency
        );
    }

    // Send an offer to a responder with emergency details and countdown
    public void notifyResponderOffer(Long responderId, EmergencyRequest emergency, EmergencyOffer offer) {
        Map<String, Object> offerData = Map.of(
            "type", "OFFER",
            "emergencyId", emergency.getId(),
            "offerId", offer.getId(),
            "emergencyType", emergency.getEmergencyType().name(),
            "description", emergency.getDescription() != null ? emergency.getDescription() : "",
            "citizenName", emergency.getCitizen().getFullName(),
            "latitude", emergency.getLatitude(),
            "longitude", emergency.getLongitude(),
            "distanceKm", offer.getDistanceKm() != null ? offer.getDistanceKm() : 0,
            "expiresAt", offer.getExpiresAt().toString()
        );
        messagingTemplate.convertAndSend(
            "/topic/responder/" + responderId, (Object) offerData
        );
    }

    // Push to admin's live feed
    public void notifyAdmin(EmergencyResponseDTO emergency) {
        if (emergency != null) {
            messagingTemplate.convertAndSend("/topic/admin/feed", emergency);
        }
    }

    // Broadcast a responder's live position to the tracking map
    public void broadcastLocation(Long emergencyId, Double lat, Double lng) {
        LocationUpdateDTO location = new LocationUpdateDTO();
        location.setLatitude(lat);
        location.setLongitude(lng);
        messagingTemplate.convertAndSend(
            "/topic/location/" + emergencyId, (Object) location
        );
    }
}
