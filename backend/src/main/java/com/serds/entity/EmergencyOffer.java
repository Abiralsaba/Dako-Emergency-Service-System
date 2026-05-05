package com.serds.entity;

import com.serds.enums.OfferStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

// Tracks individual dispatch offers sent to responders during the matching process
@Entity
@Table(name = "emergency_offers")
public class EmergencyOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emergency_id", nullable = false)
    private EmergencyRequest emergency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private Responder responder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status = OfferStatus.SENT;

    // Distance from responder to citizen at time of offer (km)
    private Double distanceKm;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

    public EmergencyOffer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EmergencyRequest getEmergency() { return emergency; }
    public void setEmergency(EmergencyRequest emergency) { this.emergency = emergency; }
    public Responder getResponder() { return responder; }
    public void setResponder(Responder responder) { this.responder = responder; }
    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getResponseAt() { return responseAt; }
    public void setResponseAt(LocalDateTime responseAt) { this.responseAt = responseAt; }
}
