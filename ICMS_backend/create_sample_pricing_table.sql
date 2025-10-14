-- Create sample pricing configuration table
CREATE TABLE IF NOT EXISTS `sample_pricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `range` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sample_pricing` (`section`, `type`, `range`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default sample pricing data
INSERT INTO `sample_pricing` (`section`, `type`, `range`, `price`, `is_active`) VALUES
-- Weighing Scale pricing
('Weighing Scale', 'Special Accuracy I (Nawi)', 'Special Accuracy I (Nawi)', 1200.00, 1),
('Weighing Scale', 'High Accuracy II (Nawi)', 'High Accuracy II (Nawi)', 1000.00, 1),
('Weighing Scale', 'Medium Accuracy III (Nawi)', 'Medium Accuracy III (Nawi)', 900.00, 1),
('Weighing Scale', 'Ordinary III (Nawi)', 'Ordinary III (Nawi)', 280.00, 1),
('Weighing Scale', 'Weighing Scale Ordinary III (platform balance)', 'Weighing Scale Ordinary III (platform balance)', 540.00, 1),

-- Test-Weights pricing
('Test-Weights', '1 kg to 10 kg (OIML Class F2)', '1 kg to 10 kg (OIML Class F2)', 600.00, 1),
('Test-Weights', '10 kg to 20 kg (OIML Class F2)', '10 kg to 20 kg (OIML Class F2)', 800.00, 1),
('Test-Weights', '20 kg to 50 kg (OIML Class F2)', '20 kg to 50 kg (OIML Class F2)', 1000.00, 1),
('Test-Weights', 'up to 5 kg (OIML Class M1/M2/M3)', 'up to 5 kg (OIML Class M1/M2/M3)', 450.00, 1),
('Test-Weights', '10 kg to 20 kg (OIML Class M1/M2/M3)', '10 kg to 20 kg (OIML Class M1/M2/M3)', 600.00, 1),
('Test-Weights', '25 kg to 50 kg (OIML Class M1/M2/M3)', '25 kg to 50 kg (OIML Class M1/M2/M3)', 700.00, 1),

-- Thermometer pricing
('Thermometer', '-20°C to +80°C (Digital Thermometer)', '-20°C to +80°C (Digital Thermometer)', 1700.00, 1),
('Thermometer', '-30°C to +100°C (Wall / Refrigerator / Bimetallic Thermometer)', '-30°C to +100°C (Wall / Refrigerator / Bimetallic Thermometer)', 1020.00, 1),
('Thermometer', '0°C to 45°C (Room, Max & Min Liquid, Thermograph Dial Type & Electronics)', '0°C to 45°C (Room, Max & Min Liquid, Thermograph Dial Type & Electronics)', 425.00, 1),

-- Sphygmomanometer pricing
('Sphygmomanometer', '0 bar to 1 bar mmHg to 750 mmHg', '0 bar to 1 bar mmHg to 750 mmHg', 1300.00, 1),

-- Thermohygrometer pricing
('Thermohygrometer', '0-100% Rh, 0-100°C (Electronic and Dial Thermohygrometer)', '0-100% Rh, 0-100°C (Electronic and Dial Thermohygrometer)', 1550.00, 1);
