DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  name varchar(50) DEFAULT NULL,
  phone varchar(15) DEFAULT NULL,
  email varchar(50) DEFAULT NULL,
  password varchar(50) DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS user_registration_logs;
CREATE TABLE user_registration_logs (
  log_id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  registered_name varchar(50) DEFAULT NULL,
  registered_email varchar(50) DEFAULT NULL,
  registration_timestamp datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY user_registration_logs_user_id_idx (user_id),
  CONSTRAINT user_registration_logs_user_fk FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
  driver_id int NOT NULL,
  name varchar(50) DEFAULT NULL,
  phone varchar(15) DEFAULT NULL,
  license_no varchar(50) DEFAULT NULL,
  email varchar(50) DEFAULT NULL,
  password varchar(50) DEFAULT NULL,
  PRIMARY KEY (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS admin;
CREATE TABLE admin (
  admin_id int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password varchar(50) NOT NULL,
  PRIMARY KEY (admin_id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS cabs;
CREATE TABLE cabs (
  cab_id int NOT NULL AUTO_INCREMENT,
  cab_number varchar(20) DEFAULT NULL,
  cab_type varchar(20) DEFAULT NULL,
  driver_id int DEFAULT NULL,
  ac_type varchar(10) DEFAULT 'AC',
  PRIMARY KEY (cab_id),
  KEY driver_id (driver_id),
  CONSTRAINT cabs_ibfk_1 FOREIGN KEY (driver_id) REFERENCES drivers (driver_id)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS booking;
CREATE TABLE booking (
  booking_id int NOT NULL AUTO_INCREMENT,
  user_id int DEFAULT NULL,
  cab_id int DEFAULT NULL,
  pickup_location varchar(100) DEFAULT NULL,
  drop_location varchar(100) DEFAULT NULL,
  booking_date date DEFAULT NULL,
  booking_time time DEFAULT NULL,
  status varchar(20) DEFAULT 'Confirmed',
  PRIMARY KEY (booking_id),
  KEY booking_ibfk_1 (user_id),
  KEY booking_ibfk_2 (cab_id),
  CONSTRAINT booking_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT booking_ibfk_2 FOREIGN KEY (cab_id) REFERENCES cabs (cab_id)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS booking_logs;
CREATE TABLE booking_logs (
  log_id int NOT NULL AUTO_INCREMENT,
  booking_id int NOT NULL,
  old_status varchar(20) DEFAULT NULL,
  new_status varchar(20) DEFAULT NULL,
  changed_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY booking_logs_booking_id_idx (booking_id),
  CONSTRAINT booking_logs_booking_fk FOREIGN KEY (booking_id) REFERENCES booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TRIGGER IF EXISTS booking_status_audit_trigger;
DELIMITER $$
CREATE TRIGGER booking_status_audit_trigger
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
  IF NOT (OLD.status <=> NEW.status) THEN
    INSERT INTO booking_logs (booking_id, old_status, new_status, changed_at)
    VALUES (NEW.booking_id, OLD.status, NEW.status, NOW());
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS users_registration_audit_trigger;
DELIMITER $$
CREATE TRIGGER users_registration_audit_trigger
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO user_registration_logs (
    user_id,
    registered_name,
    registered_email,
    registration_timestamp
  )
  VALUES (
    NEW.user_id,
    NEW.name,
    NEW.email,
    NOW()
  );
END$$
DELIMITER ;

DROP VIEW IF EXISTS detailed_bookings;
CREATE VIEW detailed_bookings AS
SELECT
  b.booking_id,
  b.user_id,
  b.cab_id,
  b.pickup_location,
  b.drop_location,
  b.booking_date,
  b.booking_time,
  b.status,
  u.name AS user_name,
  u.phone AS user_phone,
  u.email,
  c.cab_number,
  c.cab_type,
  d.name AS driver_name,
  d.phone AS driver_phone,
  d.license_no
FROM booking AS b
LEFT JOIN users AS u ON u.user_id = b.user_id
LEFT JOIN cabs AS c ON c.cab_id = b.cab_id
LEFT JOIN drivers AS d ON d.driver_id = c.driver_id;
