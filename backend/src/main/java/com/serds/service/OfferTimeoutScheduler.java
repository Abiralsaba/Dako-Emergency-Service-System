package com.serds.service;

import com.serds.entity.EmergencyOffer;
import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import com.serds.enums.EmergencyStatus;
import com.serds.enums.OfferStatus;
import com.serds.enums.ResponderStatus;
import com.serds.repository.EmergencyOfferRepository;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.ResponderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

// Scheduled task that checks for expired offers and escalates dispatch
@Service
@Transactional
public class OfferTimeoutScheduler {

    private final EmergencyOfferRepository offerRepo;
    private final EmergencyRepository emergencyRepo;
    private final ResponderRepository responderRepo;
    private final NotificationService notificationService;

    public OfferTimeoutScheduler(EmergencyOfferRepository offerRepo,
                                  EmergencyRepository emergencyRepo,
                                  ResponderRepository responderRepo,
                                  NotificationService notificationService) {
        this.offerRepo = offerRepo;
        this.emergencyRepo = emergencyRepo;
        this.responderRepo = responderRepo;
        this.notificationService = notificationService;
    }

    // Runs every 5 seconds to check for expired offers
    @Scheduled(fixedRate = 5000)
    public void checkExpiredOffers() {
        List<EmergencyOffer> expired = offerRepo.findByStatusAndExpiresAtBefore(
                OfferStatus.SENT, LocalDateTime.now());

        for (EmergencyOffer offer : expired) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepo.save(offer);

            // Reset responder status back to ONLINE
            Responder responder = offer.getResponder();
            if (responder.getCurrentStatus() == ResponderStatus.OFFERED) {
                responder.setCurrentStatus(ResponderStatus.ONLINE);
                responderRepo.save(responder);
            }

            // Decrease reliability score slightly for not responding
            responder.setReliabilityScore(
                    Math.max(0, responder.getReliabilityScore() - 1.0));
            responderRepo.save(responder);

            // Check if all offers for this emergency are now expired/declined
            EmergencyRequest emergency = offer.getEmergency();
            long activeSent = offerRepo.countByEmergencyIdAndStatus(
                    emergency.getId(), OfferStatus.SENT);

            if (activeSent == 0 && emergency.getStatus() == EmergencyStatus.OFFER_SENT) {
                // All offers expired — mark as UNASSIGNED for admin
                emergency.setStatus(EmergencyStatus.UNASSIGNED);
                emergencyRepo.save(emergency);
                notificationService.notifyAdmin(null);
            }
        }
    }
}
