package com.serds.controller;

import com.serds.entity.Rating;
import com.serds.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Rating system — citizens rate responders after emergency resolution
@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping("/emergency/{requestId}/citizen/{citizenId}")
    public ResponseEntity<Rating> submitRating(@PathVariable Long requestId,
                                                @PathVariable Long citizenId,
                                                @RequestBody Map<String, Object> body) {
        int score = (int) body.get("score");
        String comment = (String) body.getOrDefault("comment", null);
        return ResponseEntity.ok(ratingService.submitRating(requestId, citizenId, score, comment));
    }

    @GetMapping("/responder/{responderId}")
    public ResponseEntity<List<Rating>> getResponderRatings(@PathVariable Long responderId) {
        return ResponseEntity.ok(ratingService.getResponderRatings(responderId));
    }

    @GetMapping("/emergency/{requestId}")
    public ResponseEntity<Rating> getByEmergency(@PathVariable Long requestId) {
        return ResponseEntity.ok(ratingService.getRatingForRequest(requestId));
    }
}
