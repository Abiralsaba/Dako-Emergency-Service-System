package com.serds.service;

import com.serds.entity.*;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.RatingRepository;
import com.serds.repository.ResponderRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Uber-style rating system — citizen rates the responder after emergency is resolved
@Service
@Transactional
public class RatingService {

    private final RatingRepository ratingRepo;
    private final EmergencyRepository emergencyRepo;
    private final UserRepository userRepo;
    private final ResponderRepository responderRepo;

    public RatingService(RatingRepository ratingRepo, EmergencyRepository emergencyRepo,
                         UserRepository userRepo, ResponderRepository responderRepo) {
        this.ratingRepo = ratingRepo;
        this.emergencyRepo = emergencyRepo;
        this.userRepo = userRepo;
        this.responderRepo = responderRepo;
    }

    // Submit a rating for a completed emergency
    public Rating submitRating(Long requestId, Long citizenId, int score, String comment) {
        if (score < 1 || score > 5) {
            throw new InvalidOperationException("Score must be between 1 and 5");
        }

        if (ratingRepo.existsByRequestId(requestId)) {
            throw new InvalidOperationException("You already rated this emergency");
        }

        EmergencyRequest request = emergencyRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency #" + requestId + " not found"));

        if (request.getResponder() == null) {
            throw new InvalidOperationException("No responder was assigned to this emergency");
        }

        BaseUser citizen = userRepo.findById(citizenId)
            .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));

        Rating rating = new Rating();
        rating.setRequest(request);
        rating.setCitizen(citizen);
        rating.setResponder(request.getResponder());
        rating.setScore(score);
        rating.setComment(comment);
        ratingRepo.save(rating);

        // Recalculate responder's average rating
        recalculateResponderRating(request.getResponder().getId());

        return rating;
    }

    // Recalculate from all ratings — keeps the number accurate
    private void recalculateResponderRating(Long responderId) {
        Double avgScore = ratingRepo.findAvgScoreByResponderId(responderId);
        if (avgScore != null) {
            Responder responder = responderRepo.findById(responderId).orElse(null);
            if (responder != null) {
                responder.setRating(Math.round(avgScore * 100.0) / 100.0);
                responderRepo.save(responder);
            }
        }
    }

    public List<Rating> getResponderRatings(Long responderId) {
        return ratingRepo.findByResponderId(responderId);
    }

    public Rating getRatingForRequest(Long requestId) {
        return ratingRepo.findByRequestId(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("No rating for emergency #" + requestId));
    }
}
