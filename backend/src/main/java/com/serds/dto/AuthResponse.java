package com.serds.dto;

// Clean response after login/register — includes JWT token, never expose the password
public class AuthResponse {
    private Long id;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String token;
    private String serviceType;
    private String approvalStatus;

    public AuthResponse() {}

    public AuthResponse(Long id, String fullName, String role, String phoneNumber, String token) {
        this.id = id;
        this.fullName = fullName;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.token = token;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
}
