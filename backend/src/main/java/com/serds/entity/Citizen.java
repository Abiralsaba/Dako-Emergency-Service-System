package com.serds.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "citizens")
public class Citizen extends BaseUser {
    private String homeAddress;
    private String emergencyContactNumber;

    public Citizen() {}

    public String getHomeAddress() { return homeAddress; }
    public void setHomeAddress(String homeAddress) { this.homeAddress = homeAddress; }
    public String getEmergencyContactNumber() { return emergencyContactNumber; }
    public void setEmergencyContactNumber(String emergencyContactNumber) { this.emergencyContactNumber = emergencyContactNumber; }
}
