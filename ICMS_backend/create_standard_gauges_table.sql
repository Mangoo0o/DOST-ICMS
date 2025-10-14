-- Create standard_gauges table for storing calibration equipment information
CREATE TABLE IF NOT EXISTS `standard_gauges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL DEFAULT 'Digital Pressure Calibrator',
  `model_maker` varchar(255) NOT NULL DEFAULT 'ADT672-05-GP15-BAR-N',
  `measurement_range` varchar(255) NOT NULL DEFAULT '0-1 bar (0-750 mmHg)',
  `accuracy` varchar(50) NOT NULL DEFAULT '0.05',
  `serial_no` varchar(255) NOT NULL DEFAULT '2731706006',
  `certificate_no` varchar(255) NOT NULL DEFAULT '102023-INS-08090',
  `traceability` varchar(255) NOT NULL DEFAULT 'Metal Industry Research and Development Center',
  `calibration_date` varchar(50) NOT NULL DEFAULT 'Oct-25',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default standard gauge data
INSERT INTO `standard_gauges` (
  `type`, 
  `model_maker`, 
  `measurement_range`, 
  `accuracy`, 
  `serial_no`, 
  `certificate_no`, 
  `traceability`, 
  `calibration_date`,
  `is_active`
) VALUES (
  'Digital Pressure Calibrator',
  'ADT672-05-GP15-BAR-N',
  '0-1 bar (0-750 mmHg)',
  '0.05',
  '2731706006',
  '102023-INS-08090',
  'Metal Industry Research and Development Center',
  'Oct-25',
  1
) ON DUPLICATE KEY UPDATE `is_active` = 1;



