package com.serds.enums;

// Every possible action recorded in the dispatch audit trail
public enum DispatchAction {
    CREATED,
    ASSIGNED,
    REASSIGNED,
    STATUS_CHANGE,
    CANCELLED,
    RESOLVED
}
