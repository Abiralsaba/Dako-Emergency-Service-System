package com.serds.enums;

// Status of an individual dispatch offer sent to a responder
public enum OfferStatus {
    SENT,       // Offer dispatched, awaiting response
    ACCEPTED,   // Responder accepted the job
    DECLINED,   // Responder declined
    EXPIRED     // Timed out without response
}
