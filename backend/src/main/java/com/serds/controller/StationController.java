package com.serds.controller;

import com.serds.entity.Station;
import com.serds.entity.Zone;
import com.serds.enums.StationType;
import com.serds.service.StationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Manages stations and zones — admin-only endpoints
@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    // --- Zone endpoints ---

    @PostMapping("/zones")
    public ResponseEntity<Zone> createZone(@RequestBody Zone zone) {
        return ResponseEntity.ok(stationService.createZone(zone));
    }

    @GetMapping("/zones")
    public ResponseEntity<List<Zone>> getAllZones() {
        return ResponseEntity.ok(stationService.getAllZones());
    }

    @GetMapping("/zones/active")
    public ResponseEntity<List<Zone>> getActiveZones() {
        return ResponseEntity.ok(stationService.getActiveZones());
    }

    @GetMapping("/zones/{id}")
    public ResponseEntity<Zone> getZone(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getZoneById(id));
    }

    @PutMapping("/zones/{id}")
    public ResponseEntity<Zone> updateZone(@PathVariable Long id, @RequestBody Zone updates) {
        return ResponseEntity.ok(stationService.updateZone(id, updates));
    }

    // --- Station endpoints ---

    @PostMapping
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        return ResponseEntity.ok(stationService.createStation(station));
    }

    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @GetMapping("/operational")
    public ResponseEntity<List<Station>> getOperational() {
        return ResponseEntity.ok(stationService.getOperationalStations());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Station>> getByType(@PathVariable StationType type) {
        return ResponseEntity.ok(stationService.getStationsByType(type));
    }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<Station>> getByZone(@PathVariable Long zoneId) {
        return ResponseEntity.ok(stationService.getStationsByZone(zoneId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStation(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Station> updateStation(@PathVariable Long id, @RequestBody Station updates) {
        return ResponseEntity.ok(stationService.updateStation(id, updates));
    }

    @PutMapping("/{stationId}/assign-zone/{zoneId}")
    public ResponseEntity<Station> assignToZone(@PathVariable Long stationId, @PathVariable Long zoneId) {
        return ResponseEntity.ok(stationService.assignToZone(stationId, zoneId));
    }
}
