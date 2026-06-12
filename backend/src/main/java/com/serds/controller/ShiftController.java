package com.serds.controller;

import com.serds.entity.Shift;
import com.serds.enums.ShiftStatus;
import com.serds.enums.ShiftType;
import com.serds.service.ShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Shift management — schedule and track responder duty hours
@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @PostMapping
    public ResponseEntity<Shift> createShift(@RequestBody Map<String, Object> body) {
        Long responderId = Long.parseLong(body.get("responderId").toString());
        Long stationId = Long.parseLong(body.get("stationId").toString());
        LocalDateTime start = LocalDateTime.parse((String) body.get("startTime"));
        LocalDateTime end = LocalDateTime.parse((String) body.get("endTime"));
        ShiftType type = body.containsKey("shiftType") ? ShiftType.valueOf((String) body.get("shiftType")) : ShiftType.DAY;
        return ResponseEntity.ok(shiftService.createShift(responderId, stationId, start, end, type));
    }

    @PutMapping("/{shiftId}/status")
    public ResponseEntity<Shift> updateStatus(@PathVariable Long shiftId, @RequestBody Map<String, String> body) {
        ShiftStatus status = ShiftStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(shiftService.updateStatus(shiftId, status));
    }

    @GetMapping("/responder/{responderId}")
    public ResponseEntity<List<Shift>> getResponderShifts(@PathVariable Long responderId) {
        return ResponseEntity.ok(shiftService.getResponderShifts(responderId));
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Shift>> getStationShifts(@PathVariable Long stationId) {
        return ResponseEntity.ok(shiftService.getStationShifts(stationId));
    }

    @GetMapping("/station/{stationId}/active")
    public ResponseEntity<List<Shift>> getActiveAtStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(shiftService.getActiveShiftsAtStation(stationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shift> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.getById(id));
    }
}
