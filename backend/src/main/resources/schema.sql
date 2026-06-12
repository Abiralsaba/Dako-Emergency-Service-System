
CREATE DATABASE IF NOT EXISTS dispatch_system
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci //
USE dispatch_system //


CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  nid VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CITIZEN','RESPONDER','ADMIN') NOT NULL,
  profile_image_url VARCHAR(500),
  latitude DOUBLE,
  longitude DOUBLE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone_number),
  INDEX idx_nid (nid),
  INDEX idx_role (role)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS zones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  boundary_north_lat DOUBLE NOT NULL,
  boundary_south_lat DOUBLE NOT NULL,
  boundary_east_lng DOUBLE NOT NULL,
  boundary_west_lng DOUBLE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_zone_active (is_active)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS stations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  station_type ENUM('POLICE_STATION','FIRE_STATION','HOSPITAL') NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  capacity INT,
  is_operational BOOLEAN NOT NULL DEFAULT TRUE,
  zone_id BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
  INDEX idx_station_type (station_type),
  INDEX idx_station_zone (zone_id),
  INDEX idx_station_operational (is_operational)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS citizens (
  id BIGINT PRIMARY KEY,
  home_address VARCHAR(500),
  emergency_contact_number VARCHAR(20),
  blood_group VARCHAR(10),
  medical_conditions TEXT,
  date_of_birth DATE,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS responders (
  id BIGINT PRIMARY KEY,
  service_type ENUM('POLICE','AMBULANCE','FIRE_SERVICE','EMERGENCY_CAR') NOT NULL,
  vehicle_registration_number VARCHAR(50),
  badge_number VARCHAR(50),
  current_status ENUM('OFFLINE','ONLINE','OFFERED','ASSIGNED','EN_ROUTE','ARRIVED','BUSY') NOT NULL DEFAULT 'OFFLINE',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  reliability_score DOUBLE NOT NULL DEFAULT 100.0,
  last_seen_at DATETIME,
  total_response_count INT NOT NULL DEFAULT 0,
  rating DOUBLE NOT NULL DEFAULT 5.0,
  station_id BIGINT,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL,
  INDEX idx_service_avail (service_type, approval_status, is_available, current_status),
  INDEX idx_approval (approval_status),
  INDEX idx_responder_station (station_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY,
  department VARCHAR(100) DEFAULT 'GENERAL_ADMINISTRATION',
  access_level ENUM('SUPER_ADMIN','REGIONAL_ADMIN','OPERATOR') NOT NULL DEFAULT 'OPERATOR',
  station_id BIGINT,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS emergency_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  responder_id BIGINT,
  emergency_type ENUM('POLICE','MEDICAL','FIRE','EMERGENCY_CAR','GENERAL') NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('SEARCHING','OFFER_SENT','ACCEPTED','RESPONDER_EN_ROUTE','RESPONDER_ARRIVED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED','UNASSIGNED') NOT NULL DEFAULT 'SEARCHING',
  description TEXT,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  address VARCHAR(500),
  search_radius_km DOUBLE,
  base_fare DOUBLE,
  per_km_fare DOUBLE,
  total_distance_km DOUBLE,
  total_fare DOUBLE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dispatched_at DATETIME,
  accepted_at DATETIME,
  arrived_at DATETIME,
  resolved_at DATETIME,
  cancelled_at DATETIME,
  cancel_reason TEXT,
  FOREIGN KEY (citizen_id) REFERENCES users(id),
  FOREIGN KEY (responder_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_citizen (citizen_id),
  INDEX idx_responder_status (responder_id, status),
  INDEX idx_created (created_at),
  INDEX idx_emergency_type_status (emergency_type, status)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS emergency_offers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  emergency_id BIGINT NOT NULL,
  responder_id BIGINT NOT NULL,
  status ENUM('SENT','ACCEPTED','DECLINED','EXPIRED') NOT NULL DEFAULT 'SENT',
  distance_km DOUBLE,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  response_at DATETIME,
  FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id),
  FOREIGN KEY (responder_id) REFERENCES responders(id),
  INDEX idx_emergency_status (emergency_id, status),
  INDEX idx_responder_offers (responder_id, status),
  INDEX idx_expiry (status, expires_at)
) ENGINE=InnoDB //


CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type ENUM('PATROL_CAR','AMBULANCE','FIRE_TRUCK','MOTORCYCLE') NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  current_status ENUM('AVAILABLE','IN_USE','MAINTENANCE','RETIRED') NOT NULL DEFAULT 'AVAILABLE',
  station_id BIGINT,
  responder_id BIGINT,
  fuel_level DOUBLE,
  last_service_date DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vehicle_station (station_id),
  INDEX idx_vehicle_status (current_status),
  INDEX idx_vehicle_responder (responder_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS incident_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNIQUE NOT NULL,
  responder_id BIGINT NOT NULL,
  report_text TEXT NOT NULL,
  actions_taken TEXT NOT NULL,
  casualty_count INT NOT NULL DEFAULT 0,
  injury_count INT NOT NULL DEFAULT 0,
  property_damage BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_image_urls TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id),
  INDEX idx_report_responder (responder_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNIQUE NOT NULL,
  citizen_id BIGINT NOT NULL,
  responder_id BIGINT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES users(id),
  FOREIGN KEY (responder_id) REFERENCES users(id),
  INDEX idx_rating_responder (responder_id),
  INDEX idx_rating_citizen (citizen_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipient_id BIGINT NOT NULL,
  request_id BIGINT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('SOS_ALERT','DISPATCH','STATUS_UPDATE','SYSTEM','RATING_REQUEST') NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE SET NULL,
  INDEX idx_notif_recipient (recipient_id, is_read),
  INDEX idx_notif_type (type)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS dispatch_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  performed_by_id BIGINT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  action ENUM('CREATED','ASSIGNED','REASSIGNED','STATUS_CHANGE','CANCELLED','RESOLVED') NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dispatch_request (request_id),
  INDEX idx_dispatch_action (action)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  message_text TEXT NOT NULL,
  message_type ENUM('TEXT','IMAGE','LOCATION') NOT NULL DEFAULT 'TEXT',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  INDEX idx_chat_request (request_id),
  INDEX idx_chat_unread (request_id, is_read)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_contact_citizen (citizen_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS shifts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  responder_id BIGINT NOT NULL,
  station_id BIGINT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  shift_type ENUM('DAY','NIGHT','OVERTIME'),
  status ENUM('SCHEDULED','ACTIVE','COMPLETED','ABSENT') NOT NULL DEFAULT 'SCHEDULED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  INDEX idx_shift_responder (responder_id),
  INDEX idx_shift_station (station_id),
  INDEX idx_shift_status (status),
  INDEX idx_shift_time (start_time, end_time)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS sos_media (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  media_url TEXT NOT NULL,
  media_type ENUM('IMAGE','VIDEO','AUDIO') NOT NULL,
  file_size BIGINT,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
  INDEX idx_media_request (request_id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  user_role VARCHAR(20),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB //



DROP VIEW IF EXISTS v_active_emergencies //
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
    er.created_at ASC //


DROP VIEW IF EXISTS v_responder_dashboard //
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
ORDER BY r.rating DESC //


DROP VIEW IF EXISTS v_station_overview //
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
ORDER BY s.name //


DROP VIEW IF EXISTS v_daily_stats //
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
ORDER BY total_count DESC //


DROP VIEW IF EXISTS v_responder_performance //
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
ORDER BY r.rating DESC //


DROP VIEW IF EXISTS v_zone_heatmap //
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
ORDER BY total_emergencies DESC //


DROP VIEW IF EXISTS v_pending_reviews //
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
ORDER BY er.resolved_at ASC //


DROP VIEW IF EXISTS v_shift_schedule //
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
ORDER BY sh.start_time ASC //



DROP TRIGGER IF EXISTS trg_after_emergency_insert //
CREATE TRIGGER trg_after_emergency_insert
AFTER INSERT ON emergency_requests
FOR EACH ROW
BEGIN
    INSERT INTO dispatch_logs (request_id, performed_by_id, previous_status, new_status, action, notes, created_at)
    VALUES (NEW.id, NEW.citizen_id, NULL, NEW.status, 'CREATED',
            CONCAT('Emergency created: ', NEW.emergency_type, ' | Severity: ', NEW.severity),
            NOW());
END //


DROP TRIGGER IF EXISTS trg_after_emergency_status_update //
CREATE TRIGGER trg_after_emergency_status_update
AFTER UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO dispatch_logs (request_id, performed_by_id, previous_status, new_status, action, notes, created_at)
        VALUES (NEW.id, NEW.responder_id, OLD.status, NEW.status, 'STATUS_CHANGE',
                CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
                NOW());
    END IF;

    IF (OLD.responder_id IS NULL AND NEW.responder_id IS NOT NULL)
       OR (OLD.responder_id IS NOT NULL AND NEW.responder_id IS NOT NULL AND OLD.responder_id != NEW.responder_id) THEN
        INSERT INTO dispatch_logs (request_id, performed_by_id, previous_status, new_status, action, notes, created_at)
        VALUES (NEW.id, NEW.responder_id, OLD.status, NEW.status,
                IF(OLD.responder_id IS NULL, 'ASSIGNED', 'REASSIGNED'),
                CONCAT('Responder #', NEW.responder_id, ' assigned'),
                NOW());
    END IF;
END //


DROP TRIGGER IF EXISTS trg_after_rating_insert //
CREATE TRIGGER trg_after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    DECLARE avg_score DOUBLE;

    SELECT AVG(score) INTO avg_score
    FROM ratings
    WHERE responder_id = NEW.responder_id;

    UPDATE responders
    SET rating = ROUND(avg_score, 2)
    WHERE id = NEW.responder_id;
END //


DROP TRIGGER IF EXISTS trg_after_incident_report_insert //
CREATE TRIGGER trg_after_incident_report_insert
AFTER INSERT ON incident_reports
FOR EACH ROW
BEGIN
    DECLARE citizen_user_id BIGINT;

    SELECT citizen_id INTO citizen_user_id
    FROM emergency_requests
    WHERE id = NEW.request_id;

    IF citizen_user_id IS NOT NULL THEN
        INSERT INTO notifications (recipient_id, request_id, title, message, type, created_at)
        VALUES (citizen_user_id, NEW.request_id,
                'Incident Report Filed',
                'The responder has filed an incident report for your emergency.',
                'STATUS_UPDATE', NOW());
    END IF;
END //


DROP TRIGGER IF EXISTS trg_before_emergency_cancel //
CREATE TRIGGER trg_before_emergency_cancel
BEFORE UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'CANCELLED' AND OLD.status = 'COMPLETED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot cancel a completed emergency';
    END IF;
END //


DROP TRIGGER IF EXISTS trg_after_emergency_completed //
CREATE TRIGGER trg_after_emergency_completed
AFTER UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' AND NEW.citizen_id IS NOT NULL THEN
        INSERT INTO notifications (recipient_id, request_id, title, message, type, created_at)
        VALUES (NEW.citizen_id, NEW.id,
                'Rate Your Responder',
                'Your emergency has been resolved. Please rate the responder who helped you.',
                'RATING_REQUEST', NOW());
    END IF;
END //


DROP TRIGGER IF EXISTS trg_after_offer_expired //
CREATE TRIGGER trg_after_offer_expired
AFTER UPDATE ON emergency_offers
FOR EACH ROW
BEGIN
    IF OLD.status = 'SENT' AND NEW.status = 'EXPIRED' THEN
        UPDATE responders
        SET reliability_score = GREATEST(0, reliability_score - 1.5)
        WHERE id = NEW.responder_id;
    END IF;
END //



DROP PROCEDURE IF EXISTS sp_dispatch_analytics //
CREATE PROCEDURE sp_dispatch_analytics(
    IN p_start_date DATE,
    IN p_end_date DATE
)
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
END //


DROP PROCEDURE IF EXISTS sp_responder_performance_report //
CREATE PROCEDURE sp_responder_performance_report(
    IN p_responder_id BIGINT
)
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
END //


DROP PROCEDURE IF EXISTS sp_auto_escalate_critical //
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
END //


DROP PROCEDURE IF EXISTS sp_shift_rotation //
CREATE PROCEDURE sp_shift_rotation(
    IN p_station_id BIGINT
)
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
END //


DROP PROCEDURE IF EXISTS sp_cleanup_expired_data //
CREATE PROCEDURE sp_cleanup_expired_data(
    IN p_days_old INT
)
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
END //


DROP PROCEDURE IF EXISTS sp_generate_monthly_report //
CREATE PROCEDURE sp_generate_monthly_report(
    IN p_year INT,
    IN p_month INT
)
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
END //


CREATE TABLE IF NOT EXISTS health_cards (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mother_name VARCHAR(100),
  nid VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_group VARCHAR(10),
  phone VARCHAR(20) NOT NULL,
  emergency_contact VARCHAR(20),
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(50) NOT NULL,
  address TEXT,
  allergies VARCHAR(255),
  chronic_diseases VARCHAR(255),
  disability VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS vaccination_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  vaccine_type VARCHAR(50) NOT NULL,
  vaccine_name VARCHAR(100) NOT NULL,
  dose_number INT NOT NULL,
  preferred_date DATE,
  preferred_center VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS doctor_appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  hospital VARCHAR(255),
  department VARCHAR(100) NOT NULL,
  preferred_doctor VARCHAR(100),
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  urgency VARCHAR(50),
  symptoms TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id)
) ENGINE=InnoDB //

CREATE TABLE IF NOT EXISTS health_complaints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  complaint_type VARCHAR(100) NOT NULL,
  hospital_name VARCHAR(255),
  division VARCHAR(50),
  district VARCHAR(50),
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id)
) ENGINE=InnoDB //
