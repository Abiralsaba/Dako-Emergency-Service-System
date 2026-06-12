package com.serds.controller;

import com.serds.entity.*;
import com.serds.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*") // Allows React to connect
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    // Health Card
    @PostMapping("/cards")
    public ResponseEntity<HealthCard> applyHealthCard(@RequestAttribute("userId") Long userId, @RequestBody HealthCard card) {
        return ResponseEntity.ok(healthService.applyHealthCard(userId, card));
    }

    @GetMapping("/cards")
    public ResponseEntity<HealthCard> getHealthCard(@RequestAttribute("userId") Long userId) {
        HealthCard card = healthService.getHealthCard(userId);
        if (card == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(card);
    }

    // Vaccination
    @PostMapping("/vaccinations")
    public ResponseEntity<VaccinationRecord> registerVaccination(@RequestAttribute("userId") Long userId, @RequestBody VaccinationRecord record) {
        return ResponseEntity.ok(healthService.registerVaccination(userId, record));
    }

    @GetMapping("/vaccinations")
    public ResponseEntity<List<VaccinationRecord>> getVaccinationRecords(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(healthService.getVaccinationRecords(userId));
    }

    // Appointments
    @PostMapping("/appointments")
    public ResponseEntity<DoctorAppointment> bookAppointment(@RequestAttribute("userId") Long userId, @RequestBody DoctorAppointment appointment) {
        return ResponseEntity.ok(healthService.bookAppointment(userId, appointment));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<DoctorAppointment>> getAppointments(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(healthService.getAppointments(userId));
    }

    // Complaints
    @PostMapping("/complaints")
    public ResponseEntity<HealthComplaint> submitComplaint(@RequestAttribute("userId") Long userId, @RequestBody HealthComplaint complaint) {
        return ResponseEntity.ok(healthService.submitComplaint(userId, complaint));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<HealthComplaint>> getComplaints(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(healthService.getComplaints(userId));
    }

    // Overview Stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestAttribute("userId") Long userId) {
        HealthCard card = healthService.getHealthCard(userId);
        List<VaccinationRecord> vaccines = healthService.getVaccinationRecords(userId);
        List<DoctorAppointment> appointments = healthService.getAppointments(userId);
        List<HealthComplaint> complaints = healthService.getComplaints(userId);
        
        return ResponseEntity.ok(Map.of(
            "hasHealthCard", card != null,
            "vaccineCount", vaccines.size(),
            "appointmentCount", appointments.size(),
            "complaintCount", complaints.size()
        ));
    }
}
