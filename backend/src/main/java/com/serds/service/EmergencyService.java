package com.serds.service;

import com.serds.dto.EmergencyRequestDTO;
import com.serds.dto.EmergencyResponseDTO;
import com.serds.entity.*;
import com.serds.enums.EmergencyStatus;
import com.serds.enums.EmergencyType;
import com.serds.enums.OfferStatus;
import com.serds.enums.ResponderStatus;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.EmergencyOfferRepository;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.ResponderRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

// Heart of the system — handles emergency lifecycle from SOS to resolution
@Service
@Transactional
public class EmergencyService {

    private final EmergencyRepository emergencyRepo;
    private final UserRepository userRepo;
    private final ResponderRepository responderRepo;
    private final EmergencyOfferRepository offerRepo;
    private final DispatchEngine dispatchEngine;
    private final NotificationService notificationService;

    public EmergencyService(EmergencyRepository emergencyRepo,
                            UserRepository userRepo,
                            ResponderRepository responderRepo,
                            EmergencyOfferRepository offerRepo,
                            DispatchEngine dispatchEngine,
                            NotificationService notificationService) {
        this.emergencyRepo = emergencyRepo;
        this.userRepo = userRepo;
        this.responderRepo = responderRepo;
        this.offerRepo = offerRepo;
        this.dispatchEngine = dispatchEngine;
        this.notificationService = notificationService;
    }

    // Citizen hits SOS → create emergency → auto-dispatch via engine
    public EmergencyResponseDTO createEmergency(Long citizenId, EmergencyRequestDTO dto) {
        BaseUser citizen = userRepo.findById(citizenId)
            .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));

        // Prevent duplicate active emergencies
        List<EmergencyStatus> activeStatuses = List.of(
            EmergencyStatus.SEARCHING, EmergencyStatus.OFFER_SENT,
            EmergencyStatus.ACCEPTED, EmergencyStatus.RESPONDER_EN_ROUTE,
            EmergencyStatus.RESPONDER_ARRIVED, EmergencyStatus.IN_PROGRESS
        );
        long activeCount = emergencyRepo.countByCitizenIdAndStatusIn(citizenId, activeStatuses);
        if (activeCount > 0) {
            throw new InvalidOperationException("You already have an active emergency request");
        }

        EmergencyRequest emergency = new EmergencyRequest();
        emergency.setCitizen(citizen);
        emergency.setEmergencyType(EmergencyType.valueOf(dto.getEmergencyType()));
        emergency.setDescription(dto.getDescription());
        emergency.setLatitude(dto.getLatitude());
        emergency.setLongitude(dto.getLongitude());
        emergency.setStatus(EmergencyStatus.SEARCHING);
        emergencyRepo.save(emergency);

        // Auto-dispatch via engine
        dispatchEngine.dispatch(emergency);

        EmergencyResponseDTO response = toResponseDTO(emergency);
        notificationService.notifyEmergencyUpdate(response);
        notificationService.notifyAdmin(response);
        return response;
    }

    // Responder accepts an offer
    public EmergencyResponseDTO acceptOffer(Long emergencyId, Long responderId) {
        EmergencyOffer offer = offerRepo.findByEmergencyIdAndResponderId(emergencyId, responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new InvalidOperationException("This offer is no longer available");
        }

        EmergencyRequest emergency = offer.getEmergency();
        if (emergency.getStatus() != EmergencyStatus.OFFER_SENT &&
            emergency.getStatus() != EmergencyStatus.SEARCHING) {
            throw new InvalidOperationException("This emergency is no longer available");
        }

        // Accept this offer
        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setResponseAt(LocalDateTime.now());
        offerRepo.save(offer);

        // Decline all other offers for this emergency
        List<EmergencyOffer> otherOffers = offerRepo.findByEmergencyIdAndStatus(emergencyId, OfferStatus.SENT);
        for (EmergencyOffer other : otherOffers) {
            if (!other.getId().equals(offer.getId())) {
                other.setStatus(OfferStatus.EXPIRED);
                offerRepo.save(other);
                // Reset those responders
                Responder otherResponder = other.getResponder();
                otherResponder.setCurrentStatus(ResponderStatus.ONLINE);
                responderRepo.save(otherResponder);
            }
        }

        // Assign responder to emergency
        Responder responder = offer.getResponder();
        emergency.setResponder(responder);
        emergency.setStatus(EmergencyStatus.ACCEPTED);
        emergency.setAcceptedAt(LocalDateTime.now());
        emergencyRepo.save(emergency);

        // Update responder status
        responder.setCurrentStatus(ResponderStatus.ASSIGNED);
        responder.setIsAvailable(false);
        responderRepo.save(responder);

        EmergencyResponseDTO response = toResponseDTO(emergency);
        notificationService.notifyEmergencyUpdate(response);
        notificationService.notifyAdmin(response);
        return response;
    }

    // Responder declines an offer
    public void declineOffer(Long emergencyId, Long responderId) {
        EmergencyOffer offer = offerRepo.findByEmergencyIdAndResponderId(emergencyId, responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        offer.setStatus(OfferStatus.DECLINED);
        offer.setResponseAt(LocalDateTime.now());
        offerRepo.save(offer);

        // Reset responder status
        Responder responder = offer.getResponder();
        responder.setCurrentStatus(ResponderStatus.ONLINE);
        responderRepo.save(responder);

        // Decrease reliability slightly for declining
        responder.setReliabilityScore(Math.max(0, responder.getReliabilityScore() - 2.0));
        responderRepo.save(responder);

        // Check if all offers exhausted
        long activeSent = offerRepo.countByEmergencyIdAndStatus(emergencyId, OfferStatus.SENT);
        if (activeSent == 0) {
            EmergencyRequest emergency = offer.getEmergency();
            if (emergency.getStatus() == EmergencyStatus.OFFER_SENT) {
                emergency.setStatus(EmergencyStatus.UNASSIGNED);
                emergencyRepo.save(emergency);
                notificationService.notifyAdmin(toResponseDTO(emergency));
            }
        }
    }

    // Update emergency status — responder progresses through the lifecycle
    public EmergencyResponseDTO updateStatus(Long emergencyId, String newStatus, Long userId) {
        EmergencyRequest emergency = emergencyRepo.findById(emergencyId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency #" + emergencyId + " not found"));

        // Verify the user is the assigned responder or an admin
        if (emergency.getResponder() != null && !emergency.getResponder().getId().equals(userId)) {
            // Check if admin
            BaseUser user = userRepo.findById(userId).orElse(null);
            if (user == null || user.getRole() != Role.ADMIN) {
                throw new InvalidOperationException("Only the assigned responder can update status");
            }
        }

        EmergencyStatus status = EmergencyStatus.valueOf(newStatus);
        validateTransition(emergency.getStatus(), status);
        emergency.setStatus(status);

        // Set timestamps based on status
        switch (status) {
            case RESPONDER_EN_ROUTE -> {
                if (emergency.getResponder() != null) {
                    Responder r = responderRepo.findById(emergency.getResponder().getId()).orElse(null);
                    if (r != null) { r.setCurrentStatus(ResponderStatus.EN_ROUTE); responderRepo.save(r); }
                }
            }
            case RESPONDER_ARRIVED -> {
                emergency.setArrivedAt(LocalDateTime.now());
                if (emergency.getResponder() != null) {
                    Responder r = responderRepo.findById(emergency.getResponder().getId()).orElse(null);
                    if (r != null) { r.setCurrentStatus(ResponderStatus.ARRIVED); responderRepo.save(r); }
                }
            }
            case IN_PROGRESS -> {
                if (emergency.getResponder() != null) {
                    Responder r = responderRepo.findById(emergency.getResponder().getId()).orElse(null);
                    if (r != null) { r.setCurrentStatus(ResponderStatus.BUSY); responderRepo.save(r); }
                }
            }
            case COMPLETED -> {
                emergency.setResolvedAt(LocalDateTime.now());
                freeResponder(emergency);
            }
            case CANCELLED -> {
                emergency.setCancelledAt(LocalDateTime.now());
                freeResponder(emergency);
            }
            default -> {}
        }

        emergencyRepo.save(emergency);

        EmergencyResponseDTO response = toResponseDTO(emergency);
        notificationService.notifyEmergencyUpdate(response);
        notificationService.notifyAdmin(response);
        return response;
    }

    // Cancel emergency (by citizen)
    public EmergencyResponseDTO cancelEmergency(Long emergencyId, Long citizenId, String reason) {
        EmergencyRequest emergency = emergencyRepo.findById(emergencyId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency not found"));

        if (!emergency.getCitizen().getId().equals(citizenId)) {
            throw new InvalidOperationException("You can only cancel your own emergency");
        }

        EmergencyStatus current = emergency.getStatus();
        if (current == EmergencyStatus.COMPLETED || current == EmergencyStatus.CANCELLED) {
            throw new InvalidOperationException("Emergency is already " + current);
        }

        emergency.setStatus(EmergencyStatus.CANCELLED);
        emergency.setCancelledAt(LocalDateTime.now());
        emergency.setCancelReason(reason);
        freeResponder(emergency);

        // Expire any pending offers
        List<EmergencyOffer> sentOffers = offerRepo.findByEmergencyIdAndStatus(emergencyId, OfferStatus.SENT);
        for (EmergencyOffer offer : sentOffers) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepo.save(offer);
            Responder r = offer.getResponder();
            if (r.getCurrentStatus() == ResponderStatus.OFFERED) {
                r.setCurrentStatus(ResponderStatus.ONLINE);
                responderRepo.save(r);
            }
        }

        emergencyRepo.save(emergency);

        EmergencyResponseDTO response = toResponseDTO(emergency);
        notificationService.notifyEmergencyUpdate(response);
        notificationService.notifyAdmin(response);
        return response;
    }

    // Free up the assigned responder
    private void freeResponder(EmergencyRequest emergency) {
        if (emergency.getResponder() != null) {
            Responder responder = responderRepo.findById(emergency.getResponder().getId()).orElse(null);
            if (responder != null) {
                responder.setIsAvailable(true);
                responder.setCurrentStatus(ResponderStatus.ONLINE);
                responder.setTotalResponseCount(responder.getTotalResponseCount() + 1);
                responderRepo.save(responder);
            }
        }
    }

    // State machine — only allows valid status transitions
    private void validateTransition(EmergencyStatus current, EmergencyStatus next) {
        boolean valid = switch (current) {
            case SEARCHING -> next == EmergencyStatus.OFFER_SENT || next == EmergencyStatus.UNASSIGNED || next == EmergencyStatus.CANCELLED;
            case OFFER_SENT -> next == EmergencyStatus.ACCEPTED || next == EmergencyStatus.UNASSIGNED || next == EmergencyStatus.CANCELLED || next == EmergencyStatus.EXPIRED;
            case ACCEPTED -> next == EmergencyStatus.RESPONDER_EN_ROUTE || next == EmergencyStatus.CANCELLED;
            case RESPONDER_EN_ROUTE -> next == EmergencyStatus.RESPONDER_ARRIVED || next == EmergencyStatus.CANCELLED;
            case RESPONDER_ARRIVED -> next == EmergencyStatus.IN_PROGRESS || next == EmergencyStatus.CANCELLED;
            case IN_PROGRESS -> next == EmergencyStatus.COMPLETED;
            case UNASSIGNED -> next == EmergencyStatus.OFFER_SENT || next == EmergencyStatus.ACCEPTED || next == EmergencyStatus.CANCELLED;
            case COMPLETED, CANCELLED, EXPIRED -> false; // terminal states
        };

        if (!valid) {
            throw new InvalidOperationException("Cannot transition from " + current + " to " + next);
        }
    }

    // Admin manual assignment
    public EmergencyResponseDTO manualAssign(Long emergencyId, Long responderId) {
        EmergencyRequest emergency = emergencyRepo.findById(emergencyId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency not found"));

        Responder responder = responderRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));

        emergency.setResponder(responder);
        emergency.setStatus(EmergencyStatus.ACCEPTED);
        emergency.setAcceptedAt(LocalDateTime.now());
        emergencyRepo.save(emergency);

        responder.setIsAvailable(false);
        responder.setCurrentStatus(ResponderStatus.ASSIGNED);
        responderRepo.save(responder);

        EmergencyResponseDTO response = toResponseDTO(emergency);
        notificationService.notifyEmergencyUpdate(response);
        notificationService.notifyResponder(responderId, response);
        return response;
    }

    public EmergencyResponseDTO getEmergencyById(Long id) {
        return toResponseDTO(emergencyRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency #" + id + " not found")));
    }

    public List<EmergencyResponseDTO> getCitizenEmergencies(Long citizenId) {
        return emergencyRepo.findByCitizenIdOrderByCreatedAtDesc(citizenId)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<EmergencyResponseDTO> getResponderActiveJobs(Long responderId) {
        List<EmergencyStatus> activeStatuses = List.of(
            EmergencyStatus.ACCEPTED, EmergencyStatus.RESPONDER_EN_ROUTE,
            EmergencyStatus.RESPONDER_ARRIVED, EmergencyStatus.IN_PROGRESS
        );
        return emergencyRepo.findByResponderIdAndStatusIn(responderId, activeStatuses)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<EmergencyResponseDTO> getAllActive() {
        List<EmergencyStatus> activeStatuses = List.of(
            EmergencyStatus.SEARCHING, EmergencyStatus.OFFER_SENT,
            EmergencyStatus.ACCEPTED, EmergencyStatus.RESPONDER_EN_ROUTE,
            EmergencyStatus.RESPONDER_ARRIVED, EmergencyStatus.IN_PROGRESS,
            EmergencyStatus.UNASSIGNED
        );
        return emergencyRepo.findByStatusIn(activeStatuses)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<EmergencyResponseDTO> getUnassigned() {
        return emergencyRepo.findByStatusOrderByCreatedAtAsc(EmergencyStatus.UNASSIGNED)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // Converts entity to frontend-friendly DTO
    private EmergencyResponseDTO toResponseDTO(EmergencyRequest e) {
        EmergencyResponseDTO dto = new EmergencyResponseDTO();
        dto.setId(e.getId());
        dto.setEmergencyType(e.getEmergencyType().name());
        dto.setStatus(e.getStatus().name());
        dto.setDescription(e.getDescription());
        dto.setLatitude(e.getLatitude());
        dto.setLongitude(e.getLongitude());
        dto.setSearchRadiusKm(e.getSearchRadiusKm());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setDispatchedAt(e.getDispatchedAt());
        dto.setAcceptedAt(e.getAcceptedAt());
        dto.setArrivedAt(e.getArrivedAt());
        dto.setResolvedAt(e.getResolvedAt());

        // Citizen info
        dto.setCitizenId(e.getCitizen().getId());
        dto.setCitizenName(e.getCitizen().getFullName());
        dto.setCitizenPhone(e.getCitizen().getPhoneNumber());

        // Responder info (only if assigned)
        if (e.getResponder() != null) {
            dto.setResponderId(e.getResponder().getId());
            dto.setResponderName(e.getResponder().getFullName());
            dto.setResponderPhone(e.getResponder().getPhoneNumber());
            dto.setResponderLatitude(e.getResponder().getLatitude());
            dto.setResponderLongitude(e.getResponder().getLongitude());

            if (e.getResponder() instanceof Responder r) {
                dto.setResponderVehicle(r.getVehicleRegistrationNumber());
                dto.setResponderServiceType(r.getServiceType().name());
            }
        }

        return dto;
    }
}
