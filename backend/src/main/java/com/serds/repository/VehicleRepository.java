package com.serds.repository;

import com.serds.entity.Vehicle;
import com.serds.enums.VehicleStatus;
import com.serds.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStationId(Long stationId);
    List<Vehicle> findByCurrentStatus(VehicleStatus status);
    List<Vehicle> findByVehicleType(VehicleType vehicleType);
    Optional<Vehicle> findByResponderId(Long responderId);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
}
