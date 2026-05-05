package com.serds.enums;

// Admin approval workflow for responders
public enum ApprovalStatus {
    PENDING,    // Waiting for admin review
    APPROVED,   // Cleared to receive jobs
    REJECTED    // Not approved
}
