-- Create signatory management table
CREATE TABLE IF NOT EXISTS `signatories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `role` enum('technical_manager', 'calibration_engineer', 'other') NOT NULL DEFAULT 'other',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default technical manager
INSERT INTO `signatories` (`name`, `title`, `role`, `is_active`) VALUES
('BERNADINE P. SUNIEGA', 'Technical Manager', 'technical_manager', 1);

-- Insert default calibration engineer
INSERT INTO `signatories` (`name`, `title`, `role`, `is_active`) VALUES
('MA. FERNANDA I. BANDA', 'Calibration Engineer', 'calibration_engineer', 1);
