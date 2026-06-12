package com.serds.entity;

import com.serds.enums.AccessLevel;
import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin extends BaseUser {
    private String department = "GENERAL_ADMINISTRATION";

    // What level of access this admin has
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel accessLevel = AccessLevel.OPERATOR;

    // The station this admin manages (null = system-wide admin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    public Admin() {}

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public AccessLevel getAccessLevel() { return accessLevel; }
    public void setAccessLevel(AccessLevel accessLevel) { this.accessLevel = accessLevel; }
    public Station getStation() { return station; }
    public void setStation(Station station) { this.station = station; }
}
