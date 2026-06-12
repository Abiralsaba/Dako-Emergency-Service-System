package com.serds.entity;

import com.serds.enums.EmergencyStatus;
import com.serds.enums.EmergencyType;
import com.serds.enums.Severity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

// Core entity — represents a single emergency event (like an Uber ride)
@Entity
@Table(name = "emergency_requests")
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The citizen who triggered the SOS
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id", nullable = false)
    private BaseUser citizen;

    // The responder assigned by the dispatch engine (null until accepted)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responder_id")
    private BaseUser responder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyType emergencyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyStatus status = EmergencyStatus.SEARCHING;

    // How urgent — affects dispatch priority order
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity = Severity.MEDIUM;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Citizen's SOS location — captured at the moment they hit the button
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String address;

    // Dispatch configuration
    private Double searchRadiusKm;

    // Pricing & Fare Calculation
    @Column(name = "base_fare")
    private Double baseFare;

    @Column(name = "per_km_fare")
    private Double perKmFare;

    @Column(name = "total_distance_km")
    private Double totalDistanceKm;

    @Column(name = "total_fare")
    private Double totalFare;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(columnDefinition = "TEXT")
    private String cancelReason;

    // URL of uploaded photo (e.g., fire detection photo)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public EmergencyRequest() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BaseUser getCitizen() { return citizen; }
    public void setCitizen(BaseUser citizen) { this.citizen = citizen; }

    public BaseUser getResponder() { return responder; }
    public void setResponder(BaseUser responder) { this.responder = responder; }

    public EmergencyType getEmergencyType() { return emergencyType; }
    public void setEmergencyType(EmergencyType emergencyType) { this.emergencyType = emergencyType; }

    public EmergencyStatus getStatus() { return status; }
    public void setStatus(EmergencyStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getSearchRadiusKm() { return searchRadiusKm; }
    public void setSearchRadiusKm(Double searchRadiusKm) { this.searchRadiusKm = searchRadiusKm; }

    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }

    public Double getPerKmFare() { return perKmFare; }
    public void setPerKmFare(Double perKmFare) { this.perKmFare = perKmFare; }

    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Double getTotalFare() { return totalFare; }
    public void setTotalFare(Double totalFare) { this.totalFare = totalFare; }

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

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
