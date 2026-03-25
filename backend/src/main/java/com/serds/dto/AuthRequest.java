package com.serds.dto;

public class AuthRequest {
    private String nid;
    private String password;

    public AuthRequest() {}

    public String getNid() { return nid; }
    public void setNid(String nid) { this.nid = nid; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
