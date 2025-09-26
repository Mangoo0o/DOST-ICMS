-- This schema assumes you have a `clients` table with an `id` primary key.
-- If not, you should create one first. A full definition is not provided here
-- because it contains potentially sensitive fields like 'password'.
-- Ensure it has at least `id` (PK), `first_name`, `last_name`, `company`,
-- `email`, `contact_number`, etc.


-- Main table for reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `date_created` datetime NOT NULL DEFAULT current_timestamp(),
  `date_scheduled` datetime DEFAULT NULL,
  `date_expected_completion` datetime DEFAULT NULL,
  `date_finished` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Table for sample associated with a reservation
CREATE TABLE IF NOT EXISTS `sample` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_ref_no` varchar(50) NOT NULL,
  `section` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `range` varchar(255) NOT NULL,
  `serial_no` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_calibrated` tinyint(1) NOT NULL DEFAULT 0,
  `date_completed` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_ref_no` (`reservation_ref_no`),
  CONSTRAINT `sample_ibfk_1` FOREIGN KEY (`reservation_ref_no`) REFERENCES `reservations` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 