package com.serds.enums;

// Defines which service to dispatch — EMERGENCY_CAR is a verified civilian rapid-response vehicle
public enum EmergencyType {
    POLICE,
    MEDICAL,
    FIRE,
    EMERGENCY_CAR,
    GENERAL  // dispatches the nearest available unit regardless of type
}
