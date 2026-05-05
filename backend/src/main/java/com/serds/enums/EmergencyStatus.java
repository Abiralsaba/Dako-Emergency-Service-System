package com.serds.enums;

// Tracks the full Uber-like lifecycle of an emergency request
public enum EmergencyStatus {
    SEARCHING,          // SOS triggered, searching for responders
    OFFER_SENT,         // Offers sent to nearby responders
    ACCEPTED,           // A responder accepted the job
    RESPONDER_EN_ROUTE, // Responder heading to citizen
    RESPONDER_ARRIVED,  // Responder on-site
    IN_PROGRESS,        // Service being provided
    COMPLETED,          // Emergency resolved successfully
    CANCELLED,          // Citizen or system cancelled
    EXPIRED,            // Offer timed out with no acceptance
    UNASSIGNED          // No responder available — admin must handle
}
