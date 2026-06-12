package com.serds.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Geographic zone — used for dispatch load balancing and admin jurisdiction
@Entity
@Table(name = "zones")
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Bounding box corners — defines the zone's geographic area
    @Column(nullable = false)
    private Double boundaryNorthLat;

    @Column(nullable = false)
    private Double boundarySouthLat;

    @Column(nullable = false)
    private Double boundaryEastLng;

    @Column(nullable = false)
    private Double boundaryWestLng;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Zone() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBoundaryNorthLat() { return boundaryNorthLat; }
    public void setBoundaryNorthLat(Double boundaryNorthLat) { this.boundaryNorthLat = boundaryNorthLat; }

    public Double getBoundarySouthLat() { return boundarySouthLat; }
    public void setBoundarySouthLat(Double boundarySouthLat) { this.boundarySouthLat = boundarySouthLat; }

    public Double getBoundaryEastLng() { return boundaryEastLng; }
    public void setBoundaryEastLng(Double boundaryEastLng) { this.boundaryEastLng = boundaryEastLng; }

    public Double getBoundaryWestLng() { return boundaryWestLng; }
    public void setBoundaryWestLng(Double boundaryWestLng) { this.boundaryWestLng = boundaryWestLng; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
