package com.serds.dto;
import com.serds.entity.ServiceType;

public class RegisterResponderRequest {
    private String fullName;
    private String nid;
    private String phoneNumber;
    private String password;
    private ServiceType serviceType;
    private String vehicleRegistrationNumber;

    public RegisterResponderRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getNid() { return nid; }
    public void setNid(String nid) { this.nid = nid; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    public String getVehicleRegistrationNumber() { return vehicleRegistrationNumber; }
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) { this.vehicleRegistrationNumber = vehicleRegistrationNumber; }
}
