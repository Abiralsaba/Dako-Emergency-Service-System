package com.serds.service;

import com.serds.entity.*;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HealthService {

    private final HealthCardRepository healthCardRepo;
    private final VaccinationRecordRepository vaccinationRepo;
    private final DoctorAppointmentRepository appointmentRepo;
    private final HealthComplaintRepository complaintRepo;
    private final UserRepository userRepo;

    public HealthService(HealthCardRepository healthCardRepo,
                         VaccinationRecordRepository vaccinationRepo,
                         DoctorAppointmentRepository appointmentRepo,
                         HealthComplaintRepository complaintRepo,
                         UserRepository userRepo) {
        this.healthCardRepo = healthCardRepo;
        this.vaccinationRepo = vaccinationRepo;
        this.appointmentRepo = appointmentRepo;
        this.complaintRepo = complaintRepo;
        this.userRepo = userRepo;
    }

    private Citizen getCitizen(Long citizenId) {
        BaseUser user = userRepo.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found"));
        if (!(user instanceof Citizen)) {
            throw new IllegalArgumentException("User is not a citizen");
        }
        return (Citizen) user;
    }

    // Health Card
    public HealthCard applyHealthCard(Long citizenId, HealthCard card) {
        card.setCitizen(getCitizen(citizenId));
        return healthCardRepo.save(card);
    }

    public HealthCard getHealthCard(Long citizenId) {
        return healthCardRepo.findByCitizenId(citizenId).orElse(null);
    }

    // Vaccination
    public VaccinationRecord registerVaccination(Long citizenId, VaccinationRecord record) {
        record.setCitizen(getCitizen(citizenId));
        return vaccinationRepo.save(record);
    }

    public List<VaccinationRecord> getVaccinationRecords(Long citizenId) {
        return vaccinationRepo.findAllByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    // Appointment
    public DoctorAppointment bookAppointment(Long citizenId, DoctorAppointment appointment) {
        appointment.setCitizen(getCitizen(citizenId));
        return appointmentRepo.save(appointment);
    }

    public List<DoctorAppointment> getAppointments(Long citizenId) {
        return appointmentRepo.findAllByCitizenIdOrderByAppointmentDateDesc(citizenId);
    }

    // Complaint
    public HealthComplaint submitComplaint(Long citizenId, HealthComplaint complaint) {
        complaint.setCitizen(getCitizen(citizenId));
        return complaintRepo.save(complaint);
    }

    public List<HealthComplaint> getComplaints(Long citizenId) {
        return complaintRepo.findAllByCitizenIdOrderByCreatedAtDesc(citizenId);
    }
}
