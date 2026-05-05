package com.serds.dto;

// What the citizen sends when hitting the SOS button
public class EmergencyRequestDTO {
    private Long citizenId;
    private String emergencyType;
    private String description;
    private Double latitude;
    private Double longitude;

    public EmergencyRequestDTO() {}

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
