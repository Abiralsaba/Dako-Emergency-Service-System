package com.serds.dto;

// Used when a responder updates the emergency lifecycle
public class StatusUpdateDTO {
    private String status;

    public StatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
