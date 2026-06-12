package com.serds.service;

import com.serds.entity.BaseUser;
import com.serds.entity.Station;
import com.serds.entity.Vehicle;
import com.serds.enums.VehicleStatus;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.StationRepository;
import com.serds.repository.UserRepository;
import com.serds.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Fleet management — track vehicles, assign to responders and stations
@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepo;
    private final StationRepository stationRepo;
    private final UserRepository userRepo;

    public VehicleService(VehicleRepository vehicleRepo, StationRepository stationRepo, UserRepository userRepo) {
        this.vehicleRepo = vehicleRepo;
        this.stationRepo = stationRepo;
        this.userRepo = userRepo;
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepo.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepo.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle #" + id + " not found"));
    }

    public List<Vehicle> getVehiclesByStation(Long stationId) {
        return vehicleRepo.findByStationId(stationId);
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepo.findByCurrentStatus(VehicleStatus.AVAILABLE);
    }

    // Assign a vehicle to a responder (1:1 relationship)
    public Vehicle assignToResponder(Long vehicleId, Long responderId) {
        Vehicle vehicle = getVehicleById(vehicleId);

        // Make sure no other vehicle is already assigned to this responder
        vehicleRepo.findByResponderId(responderId).ifPresent(existing -> {
            if (!existing.getId().equals(vehicleId)) {
                throw new InvalidOperationException("Responder already has vehicle #" + existing.getId());
            }
        });

        BaseUser responder = userRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder #" + responderId + " not found"));

        vehicle.setResponder(responder);
        vehicle.setCurrentStatus(VehicleStatus.IN_USE);
        return vehicleRepo.save(vehicle);
    }

    // Unassign vehicle from responder
    public Vehicle unassignFromResponder(Long vehicleId) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setResponder(null);
        vehicle.setCurrentStatus(VehicleStatus.AVAILABLE);
        return vehicleRepo.save(vehicle);
    }

    // Park a vehicle at a station
    public Vehicle assignToStation(Long vehicleId, Long stationId) {
        Vehicle vehicle = getVehicleById(vehicleId);
        Station station = stationRepo.findById(stationId)
            .orElseThrow(() -> new ResourceNotFoundException("Station #" + stationId + " not found"));
        vehicle.setStation(station);
        return vehicleRepo.save(vehicle);
    }

    // Update vehicle status (maintenance, retired, etc.)
    public Vehicle updateStatus(Long vehicleId, VehicleStatus newStatus) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setCurrentStatus(newStatus);
        return vehicleRepo.save(vehicle);
    }
}
