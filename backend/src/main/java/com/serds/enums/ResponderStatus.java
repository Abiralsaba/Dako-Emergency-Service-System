package com.serds.enums;

// Responder's current operational status
public enum ResponderStatus {
    OFFLINE,    // Not accepting jobs
    ONLINE,     // Available and waiting for offers
    OFFERED,    // Has a pending offer
    ASSIGNED,   // Accepted a job, preparing
    EN_ROUTE,   // Driving to the citizen
    ARRIVED,    // On-site at the emergency location
    BUSY        // Providing service, not available for new jobs
}
