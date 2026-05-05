package com.serds.service;

import com.serds.entity.*;
import com.serds.enums.*;
import com.serds.repository.EmergencyOfferRepository;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.ResponderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

// Core dispatch engine — finds nearby responders, ranks them, and sends offers in batches
@Service
public class DispatchEngine {

    private final ResponderRepository responderRepo;
    private final EmergencyOfferRepository offerRepo;
    private final EmergencyRepository emergencyRepo;
    private final NotificationService notificationService;

    @Value("${app.dispatch.radius.medical:10}")
    private double medicalRadius;

    @Value("${app.dispatch.radius.fire:50}")
    private double fireRadius;

    @Value("${app.dispatch.radius.police:10}")
    private double policeRadius;

    @Value("${app.dispatch.radius.emergency-car:1}")
    private double emergencyCarRadius;

    @Value("${app.dispatch.radius.general:10}")
    private double generalRadius;

    @Value("${app.dispatch.offer-timeout-seconds:20}")
    private int offerTimeoutSeconds;

    @Value("${app.dispatch.batch-size:3}")
    private int batchSize;

    public DispatchEngine(ResponderRepository responderRepo,
                          EmergencyOfferRepository offerRepo,
                          EmergencyRepository emergencyRepo,
                          NotificationService notificationService) {
        this.responderRepo = responderRepo;
        this.offerRepo = offerRepo;
        this.emergencyRepo = emergencyRepo;
        this.notificationService = notificationService;
    }

    // Main dispatch method — called when a new emergency is created
    public void dispatch(EmergencyRequest emergency) {
        double radius = getRadiusForType(emergency.getEmergencyType());
        emergency.setSearchRadiusKm(radius);

        ServiceType requiredType = mapToServiceType(emergency.getEmergencyType());
        List<Responder> candidates;

        if (requiredType != null) {
            candidates = responderRepo.findNearbyAvailable(
                    requiredType.name(),
                    emergency.getLatitude(),
                    emergency.getLongitude(),
                    radius);
        } else {
            // GENERAL — search all types
            candidates = responderRepo.findAllNearbyAvailable(
                    emergency.getLatitude(),
                    emergency.getLongitude(),
                    radius);
        }

        if (candidates.isEmpty()) {
            // No responders available — mark unassigned
            emergency.setStatus(EmergencyStatus.UNASSIGNED);
            emergencyRepo.save(emergency);
            notificationService.notifyAdmin(null); // Signal admin
            return;
        }

        // Send offers to the first batch
        sendOfferBatch(emergency, candidates, 0);
    }

    // Sends offers to a batch of candidates
    public void sendOfferBatch(EmergencyRequest emergency, List<Responder> candidates, int startIndex) {
        int end = Math.min(startIndex + batchSize, candidates.size());
        if (startIndex >= candidates.size()) {
            // No more candidates — mark unassigned
            emergency.setStatus(EmergencyStatus.UNASSIGNED);
            emergencyRepo.save(emergency);
            return;
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(offerTimeoutSeconds);

        for (int i = startIndex; i < end; i++) {
            Responder responder = candidates.get(i);

            EmergencyOffer offer = new EmergencyOffer();
            offer.setEmergency(emergency);
            offer.setResponder(responder);
            offer.setStatus(OfferStatus.SENT);
            offer.setExpiresAt(expiresAt);
            offer.setDistanceKm(haversine(
                    emergency.getLatitude(), emergency.getLongitude(),
                    responder.getLatitude(), responder.getLongitude()));
            offerRepo.save(offer);

            // Mark responder as having a pending offer
            responder.setCurrentStatus(ResponderStatus.OFFERED);
            responderRepo.save(responder);

            // Push the offer to the responder's WebSocket
            notificationService.notifyResponderOffer(responder.getId(), emergency, offer);
        }

        emergency.setStatus(EmergencyStatus.OFFER_SENT);
        emergency.setDispatchedAt(LocalDateTime.now());
        emergencyRepo.save(emergency);
    }

    // Maps EmergencyType to dispatch radius
    public double getRadiusForType(EmergencyType type) {
        return switch (type) {
            case MEDICAL -> medicalRadius;
            case FIRE -> fireRadius;
            case POLICE -> policeRadius;
            case EMERGENCY_CAR -> emergencyCarRadius;
            case GENERAL -> generalRadius;
        };
    }

    // Maps EmergencyType → ServiceType for responder matching
    public ServiceType mapToServiceType(EmergencyType type) {
        return switch (type) {
            case POLICE -> ServiceType.POLICE;
            case MEDICAL -> ServiceType.AMBULANCE;
            case FIRE -> ServiceType.FIRE_SERVICE;
            case EMERGENCY_CAR -> ServiceType.EMERGENCY_CAR;
            case GENERAL -> null; // any available responder
        };
    }

    // Haversine formula — calculates distance between two GPS coordinates in km
    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
