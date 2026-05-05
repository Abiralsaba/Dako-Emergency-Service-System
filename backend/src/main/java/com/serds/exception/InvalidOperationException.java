package com.serds.exception;

// Thrown when an action violates business rules (e.g. invalid status transition)
public class InvalidOperationException extends RuntimeException {
    public InvalidOperationException(String message) {
        super(message);
    }
}
