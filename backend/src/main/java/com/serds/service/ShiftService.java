package com.serds.service;

import com.serds.entity.BaseUser;
import com.serds.entity.Shift;
import com.serds.entity.Station;
import com.serds.enums.ShiftStatus;
import com.serds.enums.ShiftType;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.ShiftRepository;
import com.serds.repository.StationRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// Manages responder work schedules — tracks who's on duty and where
@Service
@Transactional
public class ShiftService {

    private final ShiftRepository shiftRepo;
    private final UserRepository userRepo;
    private final StationRepository stationRepo;

    public ShiftService(ShiftRepository shiftRepo, UserRepository userRepo,
                        StationRepository stationRepo) {
        this.shiftRepo = shiftRepo;
        this.userRepo = userRepo;
        this.stationRepo = stationRepo;
    }

    // Create a new shift for a responder at a station
    public Shift createShift(Long responderId, Long stationId, LocalDateTime start,
                             LocalDateTime end, ShiftType type) {
        BaseUser responder = userRepo.findById(responderId)
            .orElseThrow(() -> new ResourceNotFoundException("Responder not found"));
        Station station = stationRepo.findById(stationId)
            .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

        Shift shift = new Shift();
        shift.setResponder(responder);
        shift.setStation(station);
        shift.setStartTime(start);
        shift.setEndTime(end);
        shift.setShiftType(type);
        shift.setStatus(ShiftStatus.SCHEDULED);
        return shiftRepo.save(shift);
    }

    // Update shift status (start, complete, mark absent)
    public Shift updateStatus(Long shiftId, ShiftStatus newStatus) {
        Shift shift = shiftRepo.findById(shiftId)
            .orElseThrow(() -> new ResourceNotFoundException("Shift #" + shiftId + " not found"));
        shift.setStatus(newStatus);
        return shiftRepo.save(shift);
    }

    public List<Shift> getResponderShifts(Long responderId) {
        return shiftRepo.findByResponderIdOrderByStartTimeDesc(responderId);
    }

    public List<Shift> getStationShifts(Long stationId) {
        return shiftRepo.findByStationIdOrderByStartTimeDesc(stationId);
    }

    // Who's currently on duty at a station
    public List<Shift> getActiveShiftsAtStation(Long stationId) {
        return shiftRepo.findActiveShiftsByStation(stationId, LocalDateTime.now());
    }

    public Shift getById(Long id) {
        return shiftRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Shift #" + id + " not found"));
    }
}
