package com.serds.service;

import com.serds.dto.LocationUpdateDTO;
import com.serds.entity.BaseUser;
import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import com.serds.enums.EmergencyStatus;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.ResponderRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

// Updates live GPS positions — enforces ownership via JWT
@Service
public class LocationService {

    private final UserRepository userRepo;
    private final ResponderRepository responderRepo;
    private final EmergencyRepository emergencyRepo;
    private final NotificationService notificationService;

    public LocationService(UserRepository userRepo, ResponderRepository responderRepo,
                           EmergencyRepository emergencyRepo, NotificationService notificationService) {
        this.userRepo = userRepo;
        this.responderRepo = responderRepo;
        this.emergencyRepo = emergencyRepo;
        this.notificationService = notificationService;
    }

    // Update the authenticated user's GPS — userId comes from JWT, not request body
    public void updateLocation(Long authenticatedUserId, Double latitude, Double longitude) {
        BaseUser user = userRepo.findById(authenticatedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLatitude(latitude);
        user.setLongitude(longitude);
        userRepo.save(user);

        // If responder, update lastSeenAt
        if (user instanceof Responder responder) {
            responder.setLastSeenAt(LocalDateTime.now());
            responderRepo.save(responder);
        }

        // If responder on active job, broadcast location to citizen map
        List<EmergencyStatus> activeStatuses = List.of(
            EmergencyStatus.ACCEPTED, EmergencyStatus.RESPONDER_EN_ROUTE,
            EmergencyStatus.RESPONDER_ARRIVED, EmergencyStatus.IN_PROGRESS
        );
        List<EmergencyRequest> activeJobs = emergencyRepo.findByResponderIdAndStatusIn(
                authenticatedUserId, activeStatuses);

        for (EmergencyRequest job : activeJobs) {
            notificationService.broadcastLocation(job.getId(), latitude, longitude);
        }
    }
}
