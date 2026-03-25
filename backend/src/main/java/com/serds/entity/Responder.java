package com.serds.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "responders")
public class Responder extends BaseUser {
    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;
    
    private String vehicleRegistrationNumber;
    private String currentStatus = "OFFLINE";

    public Responder() {}

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    public String getVehicleRegistrationNumber() { return vehicleRegistrationNumber; }
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) { this.vehicleRegistrationNumber = vehicleRegistrationNumber; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
}
