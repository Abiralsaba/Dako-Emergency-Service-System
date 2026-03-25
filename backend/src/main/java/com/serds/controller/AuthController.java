package com.serds.controller;

import com.serds.dto.AuthRequest;
import com.serds.dto.RegisterCitizenRequest;
import com.serds.dto.RegisterResponderRequest;
import com.serds.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/citizen")
    public ResponseEntity<?> registerCitizen(@RequestBody RegisterCitizenRequest request) {
        return ResponseEntity.ok(authService.registerCitizen(request));
    }

    @PostMapping("/register/responder")
    public ResponseEntity<?> registerResponder(@RequestBody RegisterResponderRequest request) {
        return ResponseEntity.ok(authService.registerResponder(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
