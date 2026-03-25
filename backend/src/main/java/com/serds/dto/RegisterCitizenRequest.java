package com.serds.dto;

public class RegisterCitizenRequest {
    private String fullName;
    private String nid;
    private String phoneNumber;
    private String password;
    private String homeAddress;
    private String emergencyContactNumber;

    public RegisterCitizenRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getNid() { return nid; }
    public void setNid(String nid) { this.nid = nid; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getHomeAddress() { return homeAddress; }
    public void setHomeAddress(String homeAddress) { this.homeAddress = homeAddress; }
    public String getEmergencyContactNumber() { return emergencyContactNumber; }
    public void setEmergencyContactNumber(String emergencyContactNumber) { this.emergencyContactNumber = emergencyContactNumber; }
}
