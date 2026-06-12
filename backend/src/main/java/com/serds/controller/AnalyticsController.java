package com.serds.controller;

import com.serds.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Dashboard analytics — powered by MySQL views and stored procedures
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // --- View-based endpoints (SHOW options) ---

    @GetMapping("/active-emergencies")
    public ResponseEntity<List<Object[]>> getActiveEmergencies() {
        return ResponseEntity.ok(analyticsService.getActiveEmergencies());
    }

    @GetMapping("/responder-dashboard")
    public ResponseEntity<List<Object[]>> getResponderDashboard() {
        return ResponseEntity.ok(analyticsService.getResponderDashboard());
    }

    @GetMapping("/station-overview")
    public ResponseEntity<List<Object[]>> getStationOverview() {
        return ResponseEntity.ok(analyticsService.getStationOverview());
    }

    @GetMapping("/daily-stats")
    public ResponseEntity<List<Object[]>> getDailyStats() {
        return ResponseEntity.ok(analyticsService.getDailyStats());
    }

    @GetMapping("/responder-performance")
    public ResponseEntity<List<Object[]>> getResponderPerformance() {
        return ResponseEntity.ok(analyticsService.getResponderPerformance());
    }

    @GetMapping("/zone-heatmap")
    public ResponseEntity<List<Object[]>> getZoneHeatmap() {
        return ResponseEntity.ok(analyticsService.getZoneHeatmap());
    }

    @GetMapping("/pending-reviews")
    public ResponseEntity<List<Object[]>> getPendingReviews() {
        return ResponseEntity.ok(analyticsService.getPendingReviews());
    }

    @GetMapping("/shift-schedule")
    public ResponseEntity<List<Object[]>> getShiftSchedule() {
        return ResponseEntity.ok(analyticsService.getShiftSchedule());
    }

    // --- Stored Procedure endpoints ---

    @GetMapping("/dispatch-report")
    public ResponseEntity<List<Object[]>> getDispatchReport(
            @RequestParam String startDate, @RequestParam String endDate) {
        return ResponseEntity.ok(analyticsService.getDispatchAnalytics(startDate, endDate));
    }

    @GetMapping("/responder-report/{responderId}")
    public ResponseEntity<List<Object[]>> getResponderReport(@PathVariable Long responderId) {
        return ResponseEntity.ok(analyticsService.getResponderPerformanceReport(responderId));
    }

    @PostMapping("/escalate-critical")
    public ResponseEntity<Map<String, String>> escalateCritical() {
        analyticsService.autoEscalateCritical();
        return ResponseEntity.ok(Map.of("message", "Critical emergencies escalated"));
    }

    @PostMapping("/rotate-shifts/{stationId}")
    public ResponseEntity<Map<String, String>> rotateShifts(@PathVariable Long stationId) {
        analyticsService.rotateShifts(stationId);
        return ResponseEntity.ok(Map.of("message", "Shifts rotated for station #" + stationId));
    }

    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanup(@RequestParam(defaultValue = "90") int daysOld) {
        analyticsService.cleanupExpiredData(daysOld);
        return ResponseEntity.ok(Map.of("message", "Cleaned up data older than " + daysOld + " days"));
    }

    @GetMapping("/monthly-report")
    public ResponseEntity<List<Object[]>> getMonthlyReport(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(analyticsService.getMonthlyReport(year, month));
    }
}
