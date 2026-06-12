package com.serds.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Post-resolution report filed by the responder — weak entity of EmergencyRequest
@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The emergency this report belongs to (1:1, can't exist without it)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EmergencyRequest request;

    // Who wrote this report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private BaseUser responder;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reportText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(nullable = false)
    private Integer casualtyCount = 0;

    @Column(nullable = false)
    private Integer injuryCount = 0;

    @Column(nullable = false)
    private Boolean propertyDamage = false;

    // JSON array of image URLs — stored as plain text
    @Column(columnDefinition = "TEXT")
    private String evidenceImageUrls;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public IncidentReport() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmergencyRequest getRequest() { return request; }
    public void setRequest(EmergencyRequest request) { this.request = request; }

    public BaseUser getResponder() { return responder; }
    public void setResponder(BaseUser responder) { this.responder = responder; }

    public String getReportText() { return reportText; }
    public void setReportText(String reportText) { this.reportText = reportText; }

    public String getActionsTaken() { return actionsTaken; }
    public void setActionsTaken(String actionsTaken) { this.actionsTaken = actionsTaken; }

    public Integer getCasualtyCount() { return casualtyCount; }
    public void setCasualtyCount(Integer casualtyCount) { this.casualtyCount = casualtyCount; }

    public Integer getInjuryCount() { return injuryCount; }
    public void setInjuryCount(Integer injuryCount) { this.injuryCount = injuryCount; }

    public Boolean getPropertyDamage() { return propertyDamage; }
    public void setPropertyDamage(Boolean propertyDamage) { this.propertyDamage = propertyDamage; }

    public String getEvidenceImageUrls() { return evidenceImageUrls; }
    public void setEvidenceImageUrls(String evidenceImageUrls) { this.evidenceImageUrls = evidenceImageUrls; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
