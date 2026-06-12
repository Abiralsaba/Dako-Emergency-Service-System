package com.serds.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Citizen's feedback after emergency is resolved — like Uber's rating system
@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which emergency this rating is for (one rating per emergency max)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EmergencyRequest request;

    // Who gave this rating
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private BaseUser citizen;

    // Who got rated
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private BaseUser responder;

    // 1-5 stars
    @Column(nullable = false)
    private Integer score;

    // Optional written feedback
    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Rating() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmergencyRequest getRequest() { return request; }
    public void setRequest(EmergencyRequest request) { this.request = request; }

    public BaseUser getCitizen() { return citizen; }
    public void setCitizen(BaseUser citizen) { this.citizen = citizen; }

    public BaseUser getResponder() { return responder; }
    public void setResponder(BaseUser responder) { this.responder = responder; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
