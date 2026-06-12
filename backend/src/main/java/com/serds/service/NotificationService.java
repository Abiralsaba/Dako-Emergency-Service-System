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

    public void notifyResponderOffer(Long responderId, EmergencyRequest emergency, EmergencyOffer offer) {
        Map<String, Object> offerData = new java.util.HashMap<>();
        offerData.put("type", "OFFER");
        offerData.put("emergencyId", emergency.getId());
        offerData.put("offerId", offer.getId());
        offerData.put("emergencyType", emergency.getEmergencyType().name());
        offerData.put("description", emergency.getDescription() != null ? emergency.getDescription() : "");
        offerData.put("citizenName", emergency.getCitizen().getFullName());
        offerData.put("latitude", emergency.getLatitude());
        offerData.put("longitude", emergency.getLongitude());
        offerData.put("distanceKm", offer.getDistanceKm() != null ? offer.getDistanceKm() : 0);
        offerData.put("expiresAt", offer.getExpiresAt().toString());
        offerData.put("imageUrl", emergency.getImageUrl());
        
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
