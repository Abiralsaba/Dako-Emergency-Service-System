-- ═══════════════════════════════════════════════════════
-- DAKO Emergency Dispatch System — Database Schema
-- MySQL 8.x compatible
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS dispatch_system
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dispatch_system;

-- Base users table (JOINED inheritance root)
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
) ENGINE=InnoDB;

-- Citizens
CREATE TABLE IF NOT EXISTS citizens (
  id BIGINT PRIMARY KEY,
  home_address VARCHAR(500),
  emergency_contact_number VARCHAR(20),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Responders
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
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_service_avail (service_type, approval_status, is_available, current_status),
  INDEX idx_approval (approval_status)
) ENGINE=InnoDB;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY,
  department VARCHAR(100) DEFAULT 'GENERAL_ADMINISTRATION',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Emergency requests — the core dispatch entity
CREATE TABLE IF NOT EXISTS emergency_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id BIGINT NOT NULL,
  responder_id BIGINT,
  emergency_type ENUM('POLICE','MEDICAL','FIRE','EMERGENCY_CAR','GENERAL') NOT NULL,
  status ENUM('SEARCHING','OFFER_SENT','ACCEPTED','RESPONDER_EN_ROUTE','RESPONDER_ARRIVED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED','UNASSIGNED') NOT NULL DEFAULT 'SEARCHING',
  description TEXT,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  address VARCHAR(500),
  search_radius_km DOUBLE,
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
  INDEX idx_citizen (citizen_id),
  INDEX idx_responder_status (responder_id, status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Emergency offers — tracks each individual offer sent to a responder
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
) ENGINE=InnoDB;

-- Audit logs — every significant action
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
) ENGINE=InnoDB;
