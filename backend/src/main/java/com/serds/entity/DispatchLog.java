package com.serds.entity;

import com.serds.enums.DispatchAction;
import jakarta.persistence.*;
import java.time.LocalDateTime;

// Audit trail — every state change on an emergency gets recorded here
@Entity
@Table(name = "dispatch_logs")
public class DispatchLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which emergency this log entry is about
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private EmergencyRequest request;

    // Who triggered the action (null if system-generated)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private BaseUser performedBy;

    // Status before this change happened
    private String previousStatus;

    // Status after this change
    @Column(nullable = false)
    private String newStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DispatchAction action;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DispatchLog() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmergencyRequest getRequest() { return request; }
    public void setRequest(EmergencyRequest request) { this.request = request; }

    public BaseUser getPerformedBy() { return performedBy; }
    public void setPerformedBy(BaseUser performedBy) { this.performedBy = performedBy; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public DispatchAction getAction() { return action; }
    public void setAction(DispatchAction action) { this.action = action; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
