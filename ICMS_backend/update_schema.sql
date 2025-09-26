-- SQL commands to update existing tables to match the new schema.
-- Run these commands on your existing database.

-- Update `reservations` table
ALTER TABLE `reservations`
ADD COLUMN IF NOT EXISTS `address` TEXT DEFAULT NULL AFTER `reference_number`,
ADD COLUMN IF NOT EXISTS `status` VARCHAR(50) NOT NULL DEFAULT 'pending' AFTER `address`,
ADD COLUMN IF NOT EXISTS `date_scheduled` DATETIME DEFAULT NULL AFTER `date_created`,
ADD COLUMN IF NOT EXISTS `date_expected_completion` DATETIME DEFAULT NULL AFTER `date_scheduled`;

-- Update `sample` table
ALTER TABLE `sample`
ADD COLUMN `quantity` int(11) NOT NULL DEFAULT 1 AFTER `price`,
ADD COLUMN `status` varchar(50) NOT NULL DEFAULT 'pending' AFTER `quantity`,
ADD COLUMN `calibrated_by` int(11) DEFAULT NULL AFTER `is_calibrated`,
ADD COLUMN `date_started` datetime DEFAULT NULL AFTER `calibrated_by`,
ADD COLUMN `remarks` text DEFAULT NULL AFTER `date_completed`,
ADD COLUMN `created_at` datetime NOT NULL DEFAULT current_timestamp() AFTER `remarks`,
ADD COLUMN `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `created_at`,
ADD KEY `calibrated_by` (`calibrated_by`),
ADD CONSTRAINT `sample_ibfk_2` FOREIGN KEY (`calibrated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE; 