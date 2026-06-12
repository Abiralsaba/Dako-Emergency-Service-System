package com.serds.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Trusted contacts who get auto-notified when a citizen triggers SOS
@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which citizen owns this contact
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private BaseUser citizen;

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String phoneNumber;

    // e.g. "Father", "Spouse", "Friend"
    private String relationship;

    // First person to call in an emergency
    @Column(nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public EmergencyContact() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BaseUser getCitizen() { return citizen; }
    public void setCitizen(BaseUser citizen) { this.citizen = citizen; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
