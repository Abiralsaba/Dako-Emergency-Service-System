package com.serds.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

// Auto-creates MySQL views, triggers, and stored procedures on startup
// We can't use schema.sql for these because DELIMITER is MySQL CLI-only
@Component
public class DatabaseInitializer {

    private final EntityManager em;
    private final DataSource dataSource;

    public DatabaseInitializer(EntityManager entityManager, DataSource dataSource) {
        this.em = entityManager;
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDatabaseObjects() {
        System.out.println("[Dako] Creating MySQL views, triggers, and stored procedures...");

        // Fix database columns that might be missing DEFAULT values
        fixColumnDefaults();

        // Drop any leftover views/triggers/procedures from previous runs first
        cleanOldDatabaseObjects();

        createViews();
        createTriggers();
        createStoredProcedures();

        System.out.println("[Dako] Database objects created successfully!");
    }

    // Fix columns that are NOT NULL without a DEFAULT — prevents insert/update failures
    private void fixColumnDefaults() {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(
                "ALTER TABLE notifications MODIFY COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE");
            stmt.executeUpdate(
                "ALTER TABLE chat_messages MODIFY COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE");
            System.out.println("[Dako]   ✓ Fixed is_read column defaults");
        } catch (Exception e) {
            System.err.println("[Dako]   Warning fixing column defaults: " + e.getMessage());
        }

        // Add image_url column to emergency_requests if it doesn't exist
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = 'emergency_requests' AND COLUMN_NAME = 'image_url'");
            rs.next();
            if (rs.getInt(1) == 0) {
                stmt.executeUpdate(
                    "ALTER TABLE emergency_requests ADD COLUMN image_url VARCHAR(500) DEFAULT NULL");
                System.out.println("[Dako]   ✓ Added image_url column to emergency_requests");
            }
            rs.close();
        } catch (Exception e) {
            System.err.println("[Dako]   Warning adding image_url column: " + e.getMessage());
        }
    }

    // Wipe leftover views, triggers, procedures so we can recreate them fresh
    private void cleanOldDatabaseObjects() {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            // Drop all existing triggers
            ResultSet triggers = stmt.executeQuery(
                "SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()");
            List<String> triggerNames = new ArrayList<>();
            while (triggers.next()) triggerNames.add(triggers.getString(1));
            triggers.close();
            for (String name : triggerNames) {
                stmt.executeUpdate("DROP TRIGGER IF EXISTS " + name);
                System.out.println("[Dako]   Dropped trigger: " + name);
            }

            // Drop all existing views
            ResultSet views = stmt.executeQuery(
                "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = DATABASE()");
            List<String> viewNames = new ArrayList<>();
            while (views.next()) viewNames.add(views.getString(1));
            views.close();
            for (String name : viewNames) {
                stmt.executeUpdate("DROP VIEW IF EXISTS " + name);
                System.out.println("[Dako]   Dropped view: " + name);
            }

            // Drop all existing stored procedures
            ResultSet procs = stmt.executeQuery(
                "SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE'");
            List<String> procNames = new ArrayList<>();
            while (procs.next()) procNames.add(procs.getString(1));
            procs.close();
            for (String name : procNames) {
                stmt.executeUpdate("DROP PROCEDURE IF EXISTS " + name);
                System.out.println("[Dako]   Dropped procedure: " + name);
            }

            System.out.println("[Dako]   ✓ Cleaned old database objects");
        } catch (Exception e) {
            System.err.println("[Dako] Warning during cleanup: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════
    // SECTION 1: VIEWS (8 dashboard queries)
    // ═══════════════════════════════════════════

    private void createViews() {

        // View 1: Live emergency feed with citizen + responder info
        exec("DROP VIEW IF EXISTS v_active_emergencies");
        exec("""
            CREATE VIEW v_active_emergencies AS
            SELECT
                er.id AS emergency_id,
                er.emergency_type,
                er.severity,
                er.status,
                er.latitude,
                er.longitude,
                er.address,
                er.description,
                er.created_at,
                er.dispatched_at,
                er.arrived_at,
                cu.full_name AS citizen_name,
                cu.phone_number AS citizen_phone,
                ru.full_name AS responder_name,
                ru.phone_number AS responder_phone,
                r.service_type AS responder_service,
                r.current_status AS responder_status,
                TIMESTAMPDIFF(MINUTE, er.created_at, NOW()) AS minutes_elapsed
            FROM emergency_requests er
            JOIN users cu ON er.citizen_id = cu.id
            LEFT JOIN users ru ON er.responder_id = ru.id
            LEFT JOIN responders r ON er.responder_id = r.id
            WHERE er.status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED')
            ORDER BY
                FIELD(er.severity, 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
                er.created_at ASC
            """);

        // View 2: Responder dashboard — status, rating, active jobs
        exec("DROP VIEW IF EXISTS v_responder_dashboard");
        exec("""
            CREATE VIEW v_responder_dashboard AS
            SELECT
                u.id AS responder_id,
                u.full_name,
                u.phone_number,
                r.service_type,
                r.current_status,
                r.is_available,
                r.approval_status,
                r.rating,
                r.reliability_score,
                r.total_response_count,
                s.name AS station_name,
                s.station_type,
                u.latitude AS current_lat,
                u.longitude AS current_lng,
                u.last_login_at,
                (SELECT COUNT(*) FROM emergency_requests er
                 WHERE er.responder_id = u.id
                 AND er.status IN ('ACCEPTED','RESPONDER_EN_ROUTE','RESPONDER_ARRIVED','IN_PROGRESS')) AS active_jobs
            FROM users u
            JOIN responders r ON u.id = r.id
            LEFT JOIN stations s ON r.station_id = s.id
            WHERE u.role = 'RESPONDER'
            ORDER BY r.rating DESC
            """);

        // View 3: Station overview — capacity, responder count, vehicles
        exec("DROP VIEW IF EXISTS v_station_overview");
        exec("""
            CREATE VIEW v_station_overview AS
            SELECT
                s.id AS station_id,
                s.name AS station_name,
                s.station_type,
                s.address,
                s.capacity,
                s.is_operational,
                z.name AS zone_name,
                (SELECT COUNT(*) FROM responders r WHERE r.station_id = s.id) AS responder_count,
                (SELECT COUNT(*) FROM vehicles v WHERE v.station_id = s.id) AS vehicle_count,
                (SELECT COUNT(*) FROM vehicles v WHERE v.station_id = s.id AND v.current_status = 'AVAILABLE') AS available_vehicles,
                (SELECT COUNT(*) FROM shifts sh WHERE sh.station_id = s.id AND sh.status = 'ACTIVE') AS active_shifts
            FROM stations s
            LEFT JOIN zones z ON s.zone_id = z.id
            ORDER BY s.name
            """);

        // View 4: Today's emergency breakdown by type and status
        exec("DROP VIEW IF EXISTS v_daily_stats");
        exec("""
            CREATE VIEW v_daily_stats AS
            SELECT
                er.emergency_type,
                er.severity,
                er.status,
                COUNT(*) AS total_count,
                CURDATE() AS report_date
            FROM emergency_requests er
            WHERE DATE(er.created_at) = CURDATE()
            GROUP BY er.emergency_type, er.severity, er.status
            ORDER BY total_count DESC
            """);

        // View 5: Responder performance — avg response time, total jobs, avg rating
        exec("DROP VIEW IF EXISTS v_responder_performance");
        exec("""
            CREATE VIEW v_responder_performance AS
            SELECT
                u.id AS responder_id,
                u.full_name,
                r.service_type,
                r.rating AS avg_rating,
                r.total_response_count,
                r.reliability_score,
                (SELECT COUNT(*) FROM emergency_requests er
                 WHERE er.responder_id = u.id AND er.status = 'COMPLETED') AS completed_jobs,
                (SELECT AVG(TIMESTAMPDIFF(MINUTE, er.created_at, er.arrived_at))
                 FROM emergency_requests er
                 WHERE er.responder_id = u.id AND er.arrived_at IS NOT NULL) AS avg_response_minutes,
                (SELECT AVG(TIMESTAMPDIFF(MINUTE, er.arrived_at, er.resolved_at))
                 FROM emergency_requests er
                 WHERE er.responder_id = u.id AND er.resolved_at IS NOT NULL AND er.arrived_at IS NOT NULL) AS avg_resolution_minutes
            FROM users u
            JOIN responders r ON u.id = r.id
            WHERE u.role = 'RESPONDER'
            ORDER BY r.rating DESC
            """);

        // View 6: Zone heatmap — emergency count per zone
        exec("DROP VIEW IF EXISTS v_zone_heatmap");
        exec("""
            CREATE VIEW v_zone_heatmap AS
            SELECT
                z.id AS zone_id,
                z.name AS zone_name,
                z.boundary_north_lat,
                z.boundary_south_lat,
                z.boundary_east_lng,
                z.boundary_west_lng,
                (SELECT COUNT(*) FROM emergency_requests er
                 WHERE er.latitude BETWEEN z.boundary_south_lat AND z.boundary_north_lat
                 AND er.longitude BETWEEN z.boundary_west_lng AND z.boundary_east_lng) AS total_emergencies,
                (SELECT COUNT(*) FROM emergency_requests er
                 WHERE er.latitude BETWEEN z.boundary_south_lat AND z.boundary_north_lat
                 AND er.longitude BETWEEN z.boundary_west_lng AND z.boundary_east_lng
                 AND er.status NOT IN ('COMPLETED','CANCELLED','EXPIRED')) AS active_emergencies,
                (SELECT COUNT(*) FROM stations s WHERE s.zone_id = z.id) AS station_count
            FROM zones z
            WHERE z.is_active = TRUE
            ORDER BY total_emergencies DESC
            """);

        // View 7: Emergencies completed but not yet rated
        exec("DROP VIEW IF EXISTS v_pending_reviews");
        exec("""
            CREATE VIEW v_pending_reviews AS
            SELECT
                er.id AS emergency_id,
                er.emergency_type,
                er.severity,
                er.resolved_at,
                cu.id AS citizen_id,
                cu.full_name AS citizen_name,
                ru.id AS responder_id,
                ru.full_name AS responder_name,
                TIMESTAMPDIFF(HOUR, er.resolved_at, NOW()) AS hours_since_resolved
            FROM emergency_requests er
            JOIN users cu ON er.citizen_id = cu.id
            JOIN users ru ON er.responder_id = ru.id
            WHERE er.status = 'COMPLETED'
              AND er.responder_id IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM ratings rt WHERE rt.request_id = er.id)
            ORDER BY er.resolved_at ASC
            """);

        // View 8: Current and upcoming shift schedule
        exec("DROP VIEW IF EXISTS v_shift_schedule");
        exec("""
            CREATE VIEW v_shift_schedule AS
            SELECT
                sh.id AS shift_id,
                u.full_name AS responder_name,
                u.phone_number AS responder_phone,
                r.service_type,
                s.name AS station_name,
                s.station_type,
                sh.start_time,
                sh.end_time,
                sh.shift_type,
                sh.status AS shift_status,
                CASE
                    WHEN sh.status = 'ACTIVE' THEN 'ON DUTY'
                    WHEN sh.start_time <= NOW() AND sh.end_time >= NOW() AND sh.status = 'SCHEDULED' THEN 'SHOULD BE ACTIVE'
                    WHEN sh.start_time > NOW() THEN 'UPCOMING'
                    ELSE 'PAST'
                END AS duty_status
            FROM shifts sh
            JOIN users u ON sh.responder_id = u.id
            JOIN responders r ON sh.responder_id = r.id
            JOIN stations s ON sh.station_id = s.id
            WHERE sh.end_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ORDER BY sh.start_time ASC
            """);

        System.out.println("[Dako]   ✓ 8 views created");
    }

    // ═══════════════════════════════════════════
    // SECTION 2: TRIGGERS (7 automated actions)
    // ═══════════════════════════════════════════

    private void createTriggers() {

        // Trigger 1: Auto-log when a new emergency is created
        exec("DROP TRIGGER IF EXISTS trg_after_emergency_insert");
        exec("""
            CREATE TRIGGER trg_after_emergency_insert
            AFTER INSERT ON emergency_requests
            FOR EACH ROW
            INSERT INTO dispatch_logs (request_id, performed_by_id, previous_status, new_status, action, notes, created_at)
            VALUES (NEW.id, NEW.citizen_id, NULL, NEW.status, 'CREATED',
                    CONCAT('Emergency created: ', NEW.emergency_type, ' | Severity: ', NEW.severity),
                    NOW())
            """);

        // Trigger 2: Auto-log every status change on an emergency
        // Note: MySQL doesn't allow BEGIN...END blocks via JDBC without DELIMITER
        // So we use a single-statement form. For multi-statement triggers, we split into separate triggers.
        exec("DROP TRIGGER IF EXISTS trg_after_emergency_status_update");
        exec("""
            CREATE TRIGGER trg_after_emergency_status_update
            AFTER UPDATE ON emergency_requests
            FOR EACH ROW
            INSERT INTO dispatch_logs (request_id, performed_by_id, previous_status, new_status, action, notes, created_at)
            SELECT NEW.id, NEW.responder_id, OLD.status, NEW.status, 'STATUS_CHANGE',
                   CONCAT('Status changed from ', OLD.status, ' to ', NEW.status), NOW()
            FROM dual WHERE OLD.status != NEW.status
            """);

        // Trigger 2b: Combined BEFORE UPDATE — prevents bad cancels + auto-sets dispatched_at
        // MySQL only allows one BEFORE UPDATE trigger per table, so we merge both into one
        exec("DROP TRIGGER IF EXISTS trg_before_emergency_update");
        exec("""
            CREATE TRIGGER trg_before_emergency_update
            BEFORE UPDATE ON emergency_requests
            FOR EACH ROW
            SET NEW.status = IF(
                    NEW.status = 'CANCELLED' AND OLD.status = 'COMPLETED',
                    OLD.status, NEW.status),
                NEW.dispatched_at = IF(
                    OLD.responder_id IS NULL AND NEW.responder_id IS NOT NULL AND NEW.dispatched_at IS NULL,
                    NOW(), NEW.dispatched_at)
            """);

        // Trigger 3: Auto-recalculate responder's average rating
        exec("DROP TRIGGER IF EXISTS trg_after_rating_insert");
        exec("""
            CREATE TRIGGER trg_after_rating_insert
            AFTER INSERT ON ratings
            FOR EACH ROW
            UPDATE responders
            SET rating = (SELECT ROUND(AVG(score), 2) FROM ratings WHERE responder_id = NEW.responder_id)
            WHERE id = NEW.responder_id
            """);

        // Trigger 4: Auto-notify citizen when incident report is filed
        exec("DROP TRIGGER IF EXISTS trg_after_incident_report_insert");
        exec("""
            CREATE TRIGGER trg_after_incident_report_insert
            AFTER INSERT ON incident_reports
            FOR EACH ROW
            INSERT INTO notifications (recipient_id, request_id, title, message, type, is_read, created_at)
            SELECT er.citizen_id, NEW.request_id,
                   'Incident Report Filed',
                   'The responder has filed an incident report for your emergency.',
                   'STATUS_UPDATE', FALSE, NOW()
            FROM emergency_requests er WHERE er.id = NEW.request_id AND er.citizen_id IS NOT NULL
            """);

        // Trigger 6: Auto-send rating request when emergency is completed
        exec("DROP TRIGGER IF EXISTS trg_after_emergency_completed");
        exec("""
            CREATE TRIGGER trg_after_emergency_completed
            AFTER UPDATE ON emergency_requests
            FOR EACH ROW
            INSERT INTO notifications (recipient_id, request_id, title, message, type, is_read, created_at)
            SELECT NEW.citizen_id, NEW.id,
                   'Rate Your Responder',
                   'Your emergency has been resolved. Please rate the responder who helped you.',
                   'RATING_REQUEST', FALSE, NOW()
            FROM dual
            WHERE OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' AND NEW.citizen_id IS NOT NULL
            """);

        // Trigger 7: Decrease reliability score when offer expires
        exec("DROP TRIGGER IF EXISTS trg_after_offer_expired");
        exec("""
            CREATE TRIGGER trg_after_offer_expired
            AFTER UPDATE ON emergency_offers
            FOR EACH ROW
            UPDATE responders
            SET reliability_score = GREATEST(0, reliability_score - 1.5)
            WHERE id = NEW.responder_id AND OLD.status = 'SENT' AND NEW.status = 'EXPIRED'
            """);

        System.out.println("[Dako]   ✓ 7 triggers created");
    }

    // ═══════════════════════════════════════════
    // SECTION 3: STORED PROCEDURES (6 procedures)
    // ═══════════════════════════════════════════

    private void createStoredProcedures() {

        // Procedure 1: Full dispatch analytics for a date range
        exec("DROP PROCEDURE IF EXISTS sp_dispatch_analytics");
        exec("""
            CREATE PROCEDURE sp_dispatch_analytics(IN p_start_date DATE, IN p_end_date DATE)
            BEGIN
                SELECT
                    COUNT(*) AS total_emergencies,
                    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
                    SUM(CASE WHEN status IN ('SEARCHING','OFFER_SENT','ACCEPTED','RESPONDER_EN_ROUTE','RESPONDER_ARRIVED','IN_PROGRESS','UNASSIGNED') THEN 1 ELSE 0 END) AS still_active,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, COALESCE(arrived_at, NOW()))), 1) AS avg_response_minutes,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, COALESCE(resolved_at, NOW()))), 1) AS avg_total_minutes,
                    SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_count,
                    SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) AS high_count
                FROM emergency_requests
                WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date;

                SELECT
                    emergency_type,
                    COUNT(*) AS count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM emergency_requests
                        WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date), 1) AS percentage
                FROM emergency_requests
                WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
                GROUP BY emergency_type
                ORDER BY count DESC;

                SELECT
                    HOUR(created_at) AS hour_of_day,
                    COUNT(*) AS count
                FROM emergency_requests
                WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
                GROUP BY HOUR(created_at)
                ORDER BY hour_of_day;
            END
            """);

        // Procedure 2: Detailed performance report for one responder
        exec("DROP PROCEDURE IF EXISTS sp_responder_performance_report");
        exec("""
            CREATE PROCEDURE sp_responder_performance_report(IN p_responder_id BIGINT)
            BEGIN
                SELECT
                    u.full_name,
                    r.service_type,
                    r.rating,
                    r.reliability_score,
                    r.total_response_count,
                    r.current_status,
                    r.approval_status,
                    s.name AS station_name
                FROM users u
                JOIN responders r ON u.id = r.id
                LEFT JOIN stations s ON r.station_id = s.id
                WHERE u.id = p_responder_id;

                SELECT
                    status,
                    COUNT(*) AS count
                FROM emergency_requests
                WHERE responder_id = p_responder_id
                GROUP BY status
                ORDER BY count DESC;

                SELECT
                    COUNT(*) AS total_completed,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, accepted_at, arrived_at)), 1) AS avg_arrival_minutes,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, arrived_at, resolved_at)), 1) AS avg_resolution_minutes,
                    ROUND(MIN(TIMESTAMPDIFF(MINUTE, accepted_at, arrived_at)), 1) AS fastest_arrival,
                    ROUND(MAX(TIMESTAMPDIFF(MINUTE, accepted_at, arrived_at)), 1) AS slowest_arrival
                FROM emergency_requests
                WHERE responder_id = p_responder_id
                  AND status = 'COMPLETED'
                  AND accepted_at IS NOT NULL
                  AND arrived_at IS NOT NULL;

                SELECT
                    score,
                    COUNT(*) AS count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings WHERE responder_id = p_responder_id), 1) AS percentage
                FROM ratings
                WHERE responder_id = p_responder_id
                GROUP BY score
                ORDER BY score DESC;
            END
            """);

        // Procedure 3: Auto-escalate critical emergencies stuck in SEARCHING
        exec("DROP PROCEDURE IF EXISTS sp_auto_escalate_critical");
        exec("""
            CREATE PROCEDURE sp_auto_escalate_critical()
            BEGIN
                DECLARE escalated_count INT DEFAULT 0;

                UPDATE emergency_requests
                SET status = 'UNASSIGNED'
                WHERE severity = 'CRITICAL'
                  AND status = 'SEARCHING'
                  AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 5;

                SET escalated_count = ROW_COUNT();

                UPDATE emergency_requests
                SET status = 'UNASSIGNED'
                WHERE severity = 'HIGH'
                  AND status = 'SEARCHING'
                  AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 10;

                SET escalated_count = escalated_count + ROW_COUNT();

                SELECT escalated_count AS emergencies_escalated;
            END
            """);

        // Procedure 4: Shift rotation — complete expired, activate current
        exec("DROP PROCEDURE IF EXISTS sp_shift_rotation");
        exec("""
            CREATE PROCEDURE sp_shift_rotation(IN p_station_id BIGINT)
            BEGIN
                UPDATE shifts
                SET status = 'COMPLETED'
                WHERE station_id = p_station_id
                  AND status IN ('SCHEDULED', 'ACTIVE')
                  AND end_time < NOW();

                UPDATE shifts
                SET status = 'ACTIVE'
                WHERE station_id = p_station_id
                  AND status = 'SCHEDULED'
                  AND start_time <= NOW()
                  AND end_time >= NOW();

                SELECT
                    sh.id, u.full_name, r.service_type,
                    sh.start_time, sh.end_time, sh.shift_type, sh.status
                FROM shifts sh
                JOIN users u ON sh.responder_id = u.id
                JOIN responders r ON sh.responder_id = r.id
                WHERE sh.station_id = p_station_id
                  AND sh.status = 'ACTIVE'
                ORDER BY sh.start_time;
            END
            """);

        // Procedure 5: Clean up old resolved data
        exec("DROP PROCEDURE IF EXISTS sp_cleanup_expired_data");
        exec("""
            CREATE PROCEDURE sp_cleanup_expired_data(IN p_days_old INT)
            BEGIN
                DECLARE cutoff_date DATETIME;
                SET cutoff_date = DATE_SUB(NOW(), INTERVAL p_days_old DAY);

                DELETE cm FROM chat_messages cm
                JOIN emergency_requests er ON cm.request_id = er.id
                WHERE er.status IN ('COMPLETED', 'CANCELLED')
                  AND er.created_at < cutoff_date;

                DELETE FROM notifications
                WHERE is_read = TRUE
                  AND created_at < cutoff_date;

                DELETE dl FROM dispatch_logs dl
                JOIN emergency_requests er ON dl.request_id = er.id
                WHERE er.status IN ('COMPLETED', 'CANCELLED')
                  AND er.created_at < cutoff_date;

                DELETE FROM audit_logs
                WHERE created_at < cutoff_date;

                SELECT 'Cleanup completed' AS result, p_days_old AS days_cleaned;
            END
            """);

        // Procedure 6: Generate monthly summary report
        exec("DROP PROCEDURE IF EXISTS sp_generate_monthly_report");
        exec("""
            CREATE PROCEDURE sp_generate_monthly_report(IN p_year INT, IN p_month INT)
            BEGIN
                SELECT
                    COUNT(*) AS total_emergencies,
                    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS resolved,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
                    ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS resolution_rate,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, COALESCE(arrived_at, resolved_at))), 1) AS avg_response_time_min,
                    (SELECT COUNT(DISTINCT responder_id) FROM emergency_requests
                     WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month
                     AND responder_id IS NOT NULL) AS active_responders,
                    (SELECT ROUND(AVG(score), 2) FROM ratings
                     WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month) AS avg_satisfaction_score
                FROM emergency_requests
                WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month;

                SELECT
                    u.full_name,
                    r.service_type,
                    COUNT(er.id) AS jobs_completed,
                    r.rating,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, er.accepted_at, er.arrived_at)), 1) AS avg_arrival_min
                FROM emergency_requests er
                JOIN users u ON er.responder_id = u.id
                JOIN responders r ON er.responder_id = r.id
                WHERE er.status = 'COMPLETED'
                  AND YEAR(er.created_at) = p_year AND MONTH(er.created_at) = p_month
                GROUP BY u.id, u.full_name, r.service_type, r.rating
                ORDER BY jobs_completed DESC, r.rating DESC
                LIMIT 5;

                SELECT
                    DATE(created_at) AS day,
                    COUNT(*) AS emergency_count
                FROM emergency_requests
                WHERE YEAR(created_at) = p_year AND MONTH(created_at) = p_month
                GROUP BY DATE(created_at)
                ORDER BY emergency_count DESC
                LIMIT 10;
            END
            """);

        System.out.println("[Dako]   ✓ 6 stored procedures created");
    }

    // Helper — runs a single native SQL statement with clear logging
    private void exec(String sql) {
        String preview = sql.trim().split("\\n")[0].trim();
        if (preview.length() > 80) preview = preview.substring(0, 80) + "...";
        try {
            em.createNativeQuery(sql).executeUpdate();
            System.out.println("[Dako]     OK: " + preview);
        } catch (Exception e) {
            System.err.println("[Dako]   FAIL: " + preview);
            System.err.println("[Dako]         → " + e.getMessage());
        }
    }
}
