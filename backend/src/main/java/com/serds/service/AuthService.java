package com.serds.service;

import com.serds.dto.RegisterCitizenRequest;
import com.serds.dto.RegisterResponderRequest;
import com.serds.dto.AuthRequest;
import com.serds.entity.BaseUser;
import com.serds.entity.Citizen;
import com.serds.entity.Responder;
import com.serds.entity.Role;
import com.serds.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Citizen registerCitizen(RegisterCitizenRequest request) {
        if(userRepository.existsByNid(request.getNid())) {
            throw new RuntimeException("NID already registered!");
        }
        Citizen citizen = new Citizen();
        citizen.setFullName(request.getFullName());
        citizen.setNid(request.getNid());
        citizen.setPhoneNumber(request.getPhoneNumber());
        citizen.setPassword(passwordEncoder.encode(request.getPassword()));
        citizen.setRole(Role.CITIZEN);
        citizen.setHomeAddress(request.getHomeAddress());
        citizen.setEmergencyContactNumber(request.getEmergencyContactNumber());
        return userRepository.save(citizen);
    }
    
    public Responder registerResponder(RegisterResponderRequest request) {
        if(userRepository.existsByNid(request.getNid())) {
            throw new RuntimeException("NID already registered!");
        }
        Responder responder = new Responder();
        responder.setFullName(request.getFullName());
        responder.setNid(request.getNid());
        responder.setPhoneNumber(request.getPhoneNumber());
        responder.setPassword(passwordEncoder.encode(request.getPassword()));
        responder.setRole(Role.RESPONDER);
        responder.setServiceType(request.getServiceType());
        responder.setVehicleRegistrationNumber(request.getVehicleRegistrationNumber());
        return userRepository.save(responder);
    }

    public BaseUser login(AuthRequest request) {
        BaseUser user = userRepository.findByNid(request.getNid())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }
}
