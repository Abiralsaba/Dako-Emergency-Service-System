package com.serds.entity;

import com.serds.enums.ApprovalStatus;
import com.serds.enums.ResponderStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "responders")
public class Responder extends BaseUser {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;
    
    private String vehicleRegistrationNumber;
    private String badgeNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponderStatus currentStatus = ResponderStatus.OFFLINE;

    // Dispatch engine checks this before assigning new jobs
    private boolean isAvailable = true;

    // Admin must approve before responder can receive jobs
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    // Reliability score — affects dispatch ranking (0-100)
    @Column(nullable = false)
    private Double reliabilityScore = 100.0;

    // Last GPS heartbeat — stale if > 60 seconds
    private LocalDateTime lastSeenAt;

    // Total completed responses
    @Column(nullable = false)
    private Integer totalResponseCount = 0;

    // Average rating from citizens
    @Column(nullable = false)
    private Double rating = 5.0;

    public Responder() {}

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    public String getVehicleRegistrationNumber() { return vehicleRegistrationNumber; }
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) { this.vehicleRegistrationNumber = vehicleRegistrationNumber; }
    public String getBadgeNumber() { return badgeNumber; }
    public void setBadgeNumber(String badgeNumber) { this.badgeNumber = badgeNumber; }
    public ResponderStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(ResponderStatus currentStatus) { this.currentStatus = currentStatus; }
    public boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(boolean isAvailable) { this.isAvailable = isAvailable; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public Double getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(Double reliabilityScore) { this.reliabilityScore = reliabilityScore; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public Integer getTotalResponseCount() { return totalResponseCount; }
    public void setTotalResponseCount(Integer totalResponseCount) { this.totalResponseCount = totalResponseCount; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
