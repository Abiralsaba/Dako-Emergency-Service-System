package com.serds.exception;

// Thrown when a requested entity doesn't exist in the database
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
