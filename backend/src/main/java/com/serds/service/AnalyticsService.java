package com.serds.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Calls MySQL views and stored procedures for dashboard analytics
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final EntityManager entityManager;

    public AnalyticsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    // Pull data from the active emergencies view
    @SuppressWarnings("unchecked")
    public List<Object[]> getActiveEmergencies() {
        return entityManager.createNativeQuery("SELECT * FROM v_active_emergencies").getResultList();
    }

    // Responder dashboard view — stats for each responder
    @SuppressWarnings("unchecked")
    public List<Object[]> getResponderDashboard() {
        return entityManager.createNativeQuery("SELECT * FROM v_responder_dashboard").getResultList();
    }

    // Station overview — capacity, responder count, active incidents
    @SuppressWarnings("unchecked")
    public List<Object[]> getStationOverview() {
        return entityManager.createNativeQuery("SELECT * FROM v_station_overview").getResultList();
    }

    // Today's emergency breakdown by type and status
    @SuppressWarnings("unchecked")
    public List<Object[]> getDailyStats() {
        return entityManager.createNativeQuery("SELECT * FROM v_daily_stats").getResultList();
    }

    // Responder performance metrics
    @SuppressWarnings("unchecked")
    public List<Object[]> getResponderPerformance() {
        return entityManager.createNativeQuery("SELECT * FROM v_responder_performance").getResultList();
    }

    // Zone heatmap data — emergency count per zone
    @SuppressWarnings("unchecked")
    public List<Object[]> getZoneHeatmap() {
        return entityManager.createNativeQuery("SELECT * FROM v_zone_heatmap").getResultList();
    }

    // Emergencies completed but not yet rated
    @SuppressWarnings("unchecked")
    public List<Object[]> getPendingReviews() {
        return entityManager.createNativeQuery("SELECT * FROM v_pending_reviews").getResultList();
    }

    // Current and upcoming shift schedule
    @SuppressWarnings("unchecked")
    public List<Object[]> getShiftSchedule() {
        return entityManager.createNativeQuery("SELECT * FROM v_shift_schedule").getResultList();
    }

    // --- Stored Procedure calls ---

    // Full dispatch analytics for a date range
    @SuppressWarnings("unchecked")
    public List<Object[]> getDispatchAnalytics(String startDate, String endDate) {
        Query q = entityManager.createNativeQuery("CALL sp_dispatch_analytics(:startDate, :endDate)");
        q.setParameter("startDate", startDate);
        q.setParameter("endDate", endDate);
        return q.getResultList();
    }

    // Detailed performance report for one responder
    @SuppressWarnings("unchecked")
    public List<Object[]> getResponderPerformanceReport(Long responderId) {
        Query q = entityManager.createNativeQuery("CALL sp_responder_performance_report(:responderId)");
        q.setParameter("responderId", responderId);
        return q.getResultList();
    }

    // Escalate critical emergencies stuck too long
    @Transactional
    public void autoEscalateCritical() {
        entityManager.createNativeQuery("CALL sp_auto_escalate_critical()").executeUpdate();
    }

    // Rotate shifts for a station
    @Transactional
    public void rotateShifts(Long stationId) {
        entityManager.createNativeQuery("CALL sp_shift_rotation(:stationId)")
            .setParameter("stationId", stationId)
            .executeUpdate();
    }

    // Clean up old resolved emergencies
    @Transactional
    public void cleanupExpiredData(int daysOld) {
        entityManager.createNativeQuery("CALL sp_cleanup_expired_data(:daysOld)")
            .setParameter("daysOld", daysOld)
            .executeUpdate();
    }

    // Generate monthly summary report
    @SuppressWarnings("unchecked")
    public List<Object[]> getMonthlyReport(int year, int month) {
        Query q = entityManager.createNativeQuery("CALL sp_generate_monthly_report(:year, :month)");
        q.setParameter("year", year);
        q.setParameter("month", month);
        return q.getResultList();
    }
}
