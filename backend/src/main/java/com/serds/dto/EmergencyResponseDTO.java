package com.serds.dto;

import java.time.LocalDateTime;

// Full emergency details sent back to the frontend
public class EmergencyResponseDTO {
    private Long id;
    private String emergencyType;
    private String status;
    private String description;
    private Double latitude;
    private Double longitude;
    private Double searchRadiusKm;

    // Citizen info
    private Long citizenId;
    private String citizenName;
    private String citizenPhone;

    // Responder info (null if not yet dispatched)
    private Long responderId;
    private String responderName;
    private String responderPhone;
    private String responderVehicle;
    private String responderServiceType;
    private Double responderLatitude;
    private Double responderLongitude;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime resolvedAt;

    public EmergencyResponseDTO() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getSearchRadiusKm() { return searchRadiusKm; }
    public void setSearchRadiusKm(Double searchRadiusKm) { this.searchRadiusKm = searchRadiusKm; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }
    public String getCitizenPhone() { return citizenPhone; }
    public void setCitizenPhone(String citizenPhone) { this.citizenPhone = citizenPhone; }

    public Long getResponderId() { return responderId; }
    public void setResponderId(Long responderId) { this.responderId = responderId; }
    public String getResponderName() { return responderName; }
    public void setResponderName(String responderName) { this.responderName = responderName; }
    public String getResponderPhone() { return responderPhone; }
    public void setResponderPhone(String responderPhone) { this.responderPhone = responderPhone; }
    public String getResponderVehicle() { return responderVehicle; }
    public void setResponderVehicle(String responderVehicle) { this.responderVehicle = responderVehicle; }
    public String getResponderServiceType() { return responderServiceType; }
    public void setResponderServiceType(String responderServiceType) { this.responderServiceType = responderServiceType; }
    public Double getResponderLatitude() { return responderLatitude; }
    public void setResponderLatitude(Double responderLatitude) { this.responderLatitude = responderLatitude; }
    public Double getResponderLongitude() { return responderLongitude; }
    public void setResponderLongitude(Double responderLongitude) { this.responderLongitude = responderLongitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    public LocalDateTime getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(LocalDateTime arrivedAt) { this.arrivedAt = arrivedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
