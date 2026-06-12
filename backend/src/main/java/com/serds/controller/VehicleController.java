package com.serds.controller;

import com.serds.entity.Vehicle;
import com.serds.enums.VehicleStatus;
import com.serds.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Fleet management — admin controls for emergency vehicles
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Vehicle>> getByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByStation(stationId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAvailable() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @PutMapping("/{vehicleId}/assign-responder/{responderId}")
    public ResponseEntity<Vehicle> assignToResponder(@PathVariable Long vehicleId, @PathVariable Long responderId) {
        return ResponseEntity.ok(vehicleService.assignToResponder(vehicleId, responderId));
    }

    @PutMapping("/{vehicleId}/unassign")
    public ResponseEntity<Vehicle> unassign(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleService.unassignFromResponder(vehicleId));
    }

    @PutMapping("/{vehicleId}/station/{stationId}")
    public ResponseEntity<Vehicle> assignToStation(@PathVariable Long vehicleId, @PathVariable Long stationId) {
        return ResponseEntity.ok(vehicleService.assignToStation(vehicleId, stationId));
    }

    @PutMapping("/{vehicleId}/status")
    public ResponseEntity<Vehicle> updateStatus(@PathVariable Long vehicleId, @RequestBody Map<String, String> body) {
        VehicleStatus status = VehicleStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(vehicleService.updateStatus(vehicleId, status));
    }
}
