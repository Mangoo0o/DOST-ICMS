  -- Create transaction table for ICMS
  CREATE TABLE IF NOT EXISTS `transaction` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `reservation_ref_no` varchar(50) NOT NULL,
    `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
    `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
    `status` varchar(50) NOT NULL DEFAULT 'unpaid',
    `payment_date` datetime DEFAULT NULL,
    `payment_method` varchar(100) DEFAULT NULL,
    `discount` JSON DEFAULT NULL,
    `payments` JSON DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `reservation_ref_no` (`reservation_ref_no`),
    CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`reservation_ref_no`) REFERENCES `reservations` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 