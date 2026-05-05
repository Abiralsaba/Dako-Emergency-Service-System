package com.serds.controller;

import com.serds.dto.AuthRequest;
import com.serds.dto.AuthResponse;
import com.serds.dto.RegisterCitizenRequest;
import com.serds.dto.RegisterResponderRequest;
import com.serds.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Auth endpoints — register citizens/responders/admins and login. Returns JWT.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/citizen")
    public ResponseEntity<AuthResponse> registerCitizen(@RequestBody RegisterCitizenRequest request) {
        return ResponseEntity.ok(authService.registerCitizen(request));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody RegisterCitizenRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }

    @PostMapping("/register/responder")
    public ResponseEntity<AuthResponse> registerResponder(@RequestBody RegisterResponderRequest request) {
        return ResponseEntity.ok(authService.registerResponder(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
