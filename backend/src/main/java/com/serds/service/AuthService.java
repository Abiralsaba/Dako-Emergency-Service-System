package com.serds.service;

import com.serds.dto.AuthResponse;
import com.serds.dto.RegisterCitizenRequest;
import com.serds.dto.RegisterResponderRequest;
import com.serds.dto.AuthRequest;
import com.serds.entity.BaseUser;
import com.serds.entity.Citizen;
import com.serds.entity.Responder;
import com.serds.entity.Role;
import com.serds.entity.Admin;
import com.serds.enums.ApprovalStatus;
import com.serds.enums.ResponderStatus;
import com.serds.exception.InvalidOperationException;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.UserRepository;
import com.serds.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

// Handles registration and login — returns JWT token for stateless auth
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse registerCitizen(RegisterCitizenRequest request) {
        if (userRepository.existsByNid(request.getNid())) {
            throw new InvalidOperationException("NID already registered!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new InvalidOperationException("Phone number already registered!");
        }
        Citizen citizen = new Citizen();
        citizen.setFullName(request.getFullName());
        citizen.setNid(request.getNid());
        citizen.setPhoneNumber(request.getPhoneNumber());
        citizen.setPassword(passwordEncoder.encode(request.getPassword()));
        citizen.setRole(Role.CITIZEN);
        citizen.setHomeAddress(request.getHomeAddress());
        citizen.setEmergencyContactNumber(request.getEmergencyContactNumber());
        userRepository.save(citizen);

        return toAuthResponse(citizen);
    }

    public AuthResponse registerAdmin(RegisterCitizenRequest request) {
        if (userRepository.existsByNid(request.getNid())) {
            throw new InvalidOperationException("NID already registered!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new InvalidOperationException("Phone number already registered!");
        }
        Admin admin = new Admin();
        admin.setFullName(request.getFullName());
        admin.setNid(request.getNid());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        return toAuthResponse(admin);
    }

    public AuthResponse registerResponder(RegisterResponderRequest request) {
        if (userRepository.existsByNid(request.getNid())) {
            throw new InvalidOperationException("NID already registered!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new InvalidOperationException("Phone number already registered!");
        }
        Responder responder = new Responder();
        responder.setFullName(request.getFullName());
        responder.setNid(request.getNid());
        responder.setPhoneNumber(request.getPhoneNumber());
        responder.setPassword(passwordEncoder.encode(request.getPassword()));
        responder.setRole(Role.RESPONDER);
        responder.setServiceType(request.getServiceType());
        responder.setVehicleRegistrationNumber(request.getVehicleRegistrationNumber());
        responder.setCurrentStatus(ResponderStatus.OFFLINE);
        responder.setIsAvailable(false);
        responder.setApprovalStatus(ApprovalStatus.PENDING); // Must be approved by admin first
        userRepository.save(responder);

        return toAuthResponse(responder);
    }

    public AuthResponse login(AuthRequest request) {
        BaseUser user = userRepository.findByPhoneNumber(request.getPhoneNumber())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidOperationException("Invalid password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return toAuthResponse(user);
    }

    // Converts entity to a safe response with JWT token
    private AuthResponse toAuthResponse(BaseUser user) {
        String token = tokenProvider.generateToken(user.getId(), user.getRole().name());
        AuthResponse resp = new AuthResponse(
            user.getId(),
            user.getFullName(),
            user.getRole().name(),
            user.getPhoneNumber(),
            token
        );
        // Add extra info for responders
        if (user instanceof Responder r) {
            resp.setServiceType(r.getServiceType().name());
            resp.setApprovalStatus(r.getApprovalStatus().name());
        }
        return resp;
    }
}
