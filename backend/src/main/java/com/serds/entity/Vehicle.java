package com.serds.entity;

import com.serds.enums.VehicleStatus;
import com.serds.enums.VehicleType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Emergency vehicle — tracked separately for fleet management
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    // e.g. "Toyota"
    private String make;

    // e.g. "Hiace"
    private String model;

    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus currentStatus = VehicleStatus.AVAILABLE;

    // Where this vehicle is parked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    // Who's currently driving it
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id")
    private BaseUser responder;

    // How full is the tank (0-100%)
    private Double fuelLevel;

    private LocalDate lastServiceDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Vehicle() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public VehicleStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(VehicleStatus currentStatus) { this.currentStatus = currentStatus; }

    public Station getStation() { return station; }
    public void setStation(Station station) { this.station = station; }

    public BaseUser getResponder() { return responder; }
    public void setResponder(BaseUser responder) { this.responder = responder; }

    public Double getFuelLevel() { return fuelLevel; }
    public void setFuelLevel(Double fuelLevel) { this.fuelLevel = fuelLevel; }

    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate lastServiceDate) { this.lastServiceDate = lastServiceDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
