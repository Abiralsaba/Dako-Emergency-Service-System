package com.serds.controller;

import com.serds.dto.LocationUpdateDTO;
import com.serds.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Location updates — userId is from JWT, not request body (ownership enforced)
@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/update")
    public ResponseEntity<Void> updateLocation(
            @RequestBody LocationUpdateDTO dto, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        locationService.updateLocation(userId, dto.getLatitude(), dto.getLongitude());
        return ResponseEntity.ok().build();
    }
}
