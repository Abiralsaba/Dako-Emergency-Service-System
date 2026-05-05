package com.serds.dto;

// GPS position update from a user's device
public class LocationUpdateDTO {
    private Long userId;
    private Double latitude;
    private Double longitude;

    public LocationUpdateDTO() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
