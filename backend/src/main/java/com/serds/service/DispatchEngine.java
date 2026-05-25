package com.serds.service;

import com.serds.entity.*;
import com.serds.enums.*;
import com.serds.repository.EmergencyOfferRepository;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.ResponderRepository;
import com.serds.strategy.DispatchStrategy;
import com.serds.strategy.NearestResponderStrategy;
import com.serds.strategy.RoundRobinStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core Dispatch Engine — the heart of DAKO's emergency response system.
 *
 * This engine uses the STRATEGY PATTERN (a key AOOP concept) to decide
 * which responder gets dispatched to an emergency. Instead of hardcoding
 * the selection logic, we inject a DispatchStrategy interface and delegate
 * the "find best responder" decision to whichever concrete strategy is active.
 *
 * Current strategies:
 *   1. NearestResponderStrategy (PRIMARY) — picks the geographically closest responder
 *   2. RoundRobinStrategy (FALLBACK) — cycles through responders evenly when GPS is unavailable
 *
 * Why this matters:
 *   - Open/Closed Principle: we can add new strategies (e.g. PriorityBasedStrategy,
 *     LoadBalancedStrategy) without touching this class
 *   - Single Responsibility: the engine orchestrates dispatch flow; strategies decide WHO gets picked
 *   - Testability: strategies can be unit-tested in isolation
 */
@Service
public class DispatchEngine {

    private static final Logger log = LoggerFactory.getLogger(DispatchEngine.class);

    private final ResponderRepository responderRepo;
    private final EmergencyOfferRepository offerRepo;
    private final EmergencyRepository emergencyRepo;
    private final NotificationService notificationService;

    // Strategy Pattern — these are injected by Spring as @Component beans
    private final NearestResponderStrategy nearestStrategy;
    private final RoundRobinStrategy roundRobinStrategy;

    // The currently active strategy — defaults to nearest-first
    private DispatchStrategy activeStrategy;

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

    /**
     * Constructor injection — Spring wires both strategy beans automatically.
     * We default to NearestResponderStrategy since GPS-based dispatch is the
     * most logical choice for emergency services in Bangladesh's 64 districts.
     */
    public DispatchEngine(ResponderRepository responderRepo,
                          EmergencyOfferRepository offerRepo,
                          EmergencyRepository emergencyRepo,
                          NotificationService notificationService,
                          NearestResponderStrategy nearestStrategy,
                          RoundRobinStrategy roundRobinStrategy) {
        this.responderRepo = responderRepo;
        this.offerRepo = offerRepo;
        this.emergencyRepo = emergencyRepo;
        this.notificationService = notificationService;
        this.nearestStrategy = nearestStrategy;
        this.roundRobinStrategy = roundRobinStrategy;

        // Default strategy — nearest responder wins
        this.activeStrategy = nearestStrategy;
    }

    /**
     * Allows switching the dispatch algorithm at runtime.
     * For example, an admin could switch to round-robin during peak hours
     * to distribute workload evenly across responders.
     *
     * This is the key benefit of the Strategy Pattern — behavior changes
     * without modifying the DispatchEngine class itself.
     */
    public void setStrategy(DispatchStrategy strategy) {
        this.activeStrategy = strategy;
        log.info("Dispatch strategy switched to: {}", strategy.getClass().getSimpleName());
    }

    /**
     * Returns the currently active strategy (for admin panel visibility).
     */
    public String getActiveStrategyName() {
        return activeStrategy.getClass().getSimpleName();
    }

    /**
     * Main dispatch method — called when a new emergency is created.
     *
     * Flow:
     * 1. Determine search radius based on emergency type
     * 2. Query the database for nearby available responders
     * 3. Use the active strategy to RANK candidates (Strategy Pattern in action!)
     * 4. Send offer notifications to the top batch of candidates
     * 5. If no candidates found, mark emergency as UNASSIGNED and notify admin
     */
    public void dispatch(EmergencyRequest emergency) {
        double radius = getRadiusForType(emergency.getEmergencyType());
        emergency.setSearchRadiusKm(radius);

        // Step 1: Find all available responders within the search radius
        ServiceType requiredType = mapToServiceType(emergency.getEmergencyType());
        List<Responder> candidates;

        if (requiredType != null) {
            // Type-specific search (e.g. only ambulances for MEDICAL emergencies)
            candidates = responderRepo.findNearbyAvailable(
                    requiredType.name(),
                    emergency.getLatitude(),
                    emergency.getLongitude(),
                    radius);
        } else {
            // GENERAL — search all service types within radius
            candidates = responderRepo.findAllNearbyAvailable(
                    emergency.getLatitude(),
                    emergency.getLongitude(),
                    radius);
        }

        if (candidates.isEmpty()) {
            // No responders available — mark as unassigned so admin can manually dispatch
            log.warn("No responders found within {}km for emergency #{}", radius, emergency.getId());
            emergency.setStatus(EmergencyStatus.UNASSIGNED);
            emergencyRepo.save(emergency);
            notificationService.notifyAdmin(null);
            return;
        }

        // Step 2: Use the Strategy Pattern to rank candidates
        // The active strategy reorders the list so the "best" responder is first.
        // NearestResponderStrategy sorts by GPS distance (Haversine formula).
        // RoundRobinStrategy cycles through responders to distribute load.
        List<Responder> rankedCandidates = rankCandidatesUsingStrategy(emergency, candidates);

        log.info("Dispatch for emergency #{}: {} candidates found, using {}",
                emergency.getId(), rankedCandidates.size(), activeStrategy.getClass().getSimpleName());

        // Step 3: Send offers to the top batch
        sendOfferBatch(emergency, rankedCandidates, 0);
    }

    /**
     * Strategy Pattern in action — delegates ranking to the active strategy.
     *
     * Instead of hardcoding "find nearest" here, we ask the strategy to
     * pick the best responder. Then we build a ranked list starting with
     * that responder, followed by the remaining candidates in original order.
     *
     * This way, the best candidate gets the offer first, and if they decline,
     * the next batch gets offered automatically.
     */
    private List<Responder> rankCandidatesUsingStrategy(EmergencyRequest emergency, List<Responder> candidates) {
        // Ask the strategy for the #1 pick
        Responder best = activeStrategy.findBestResponder(emergency, candidates);

        if (best == null) {
            // Strategy couldn't decide — fall back to round-robin as a safety net
            log.info("Primary strategy returned null, falling back to RoundRobinStrategy");
            best = roundRobinStrategy.findBestResponder(emergency, candidates);
        }

        // Build a ranked list: best candidate first, then the rest
        List<Responder> ranked = new ArrayList<>();
        if (best != null) {
            ranked.add(best);
            for (Responder r : candidates) {
                if (!r.getId().equals(best.getId())) {
                    ranked.add(r);
                }
            }
        } else {
            // Absolute fallback — use the original order from the database
            ranked.addAll(candidates);
        }

        return ranked;
    }

    /**
     * Sends offer notifications to a batch of ranked candidates.
     *
     * We don't offer to ALL candidates at once — that would cause chaos.
     * Instead, we send to a small batch (default 3), wait for responses,
     * and if all decline or timeout, the OfferTimeoutScheduler calls
     * sendOfferBatch again with the next startIndex.
     */
    public void sendOfferBatch(EmergencyRequest emergency, List<Responder> candidates, int startIndex) {
        int end = Math.min(startIndex + batchSize, candidates.size());
        if (startIndex >= candidates.size()) {
            // All candidates exhausted — no one available
            emergency.setStatus(EmergencyStatus.UNASSIGNED);
            emergencyRepo.save(emergency);
            log.warn("All {} candidates exhausted for emergency #{}", candidates.size(), emergency.getId());
            return;
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(offerTimeoutSeconds);

        for (int i = startIndex; i < end; i++) {
            Responder responder = candidates.get(i);

            // Create an offer record in the database
            EmergencyOffer offer = new EmergencyOffer();
            offer.setEmergency(emergency);
            offer.setResponder(responder);
            offer.setStatus(OfferStatus.SENT);
            offer.setExpiresAt(expiresAt);
            offer.setDistanceKm(haversine(
                    emergency.getLatitude(), emergency.getLongitude(),
                    responder.getLatitude(), responder.getLongitude()));
            offerRepo.save(offer);

            // Mark responder as having a pending offer so they don't get double-offered
            responder.setCurrentStatus(ResponderStatus.OFFERED);
            responderRepo.save(responder);

            // Push real-time notification via WebSocket
            notificationService.notifyResponderOffer(responder.getId(), emergency, offer);
        }

        // Update emergency status to reflect that offers have been sent
        emergency.setStatus(EmergencyStatus.OFFER_SENT);
        emergency.setDispatchedAt(LocalDateTime.now());
        emergencyRepo.save(emergency);
    }

    // Maps EmergencyType to the search radius (in km) for that type
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
    // Returns null for GENERAL (any available responder matches)
    public ServiceType mapToServiceType(EmergencyType type) {
        return switch (type) {
            case POLICE -> ServiceType.POLICE;
            case MEDICAL -> ServiceType.AMBULANCE;
            case FIRE -> ServiceType.FIRE_SERVICE;
            case EMERGENCY_CAR -> ServiceType.EMERGENCY_CAR;
            case GENERAL -> null;
        };
    }

    /**
     * Haversine formula — calculates the great-circle distance between
     * two GPS coordinates on Earth's surface. Used to determine how far
     * a responder is from an emergency location.
     *
     * Returns distance in kilometers.
     */
    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
