-- Migration script to rename equipment table to sample
-- This script should be run on the existing database

-- Step 1: Drop foreign key constraints that reference the equipment table
ALTER TABLE `calibration_records` DROP FOREIGN KEY `calibration_records_ibfk_1`;

-- Step 2: Rename the equipment table to sample
RENAME TABLE `equipment` TO `sample`;

-- Step 3: Update the foreign key constraint in calibration_records to reference the new table name
ALTER TABLE `calibration_records` 
ADD CONSTRAINT `calibration_records_ibfk_1` 
FOREIGN KEY (`equipment_id`) REFERENCES `sample` (`id`);

-- Step 4: Update the constraint names in the sample table
ALTER TABLE `sample` DROP FOREIGN KEY `equipment_ibfk_1`;
ALTER TABLE `sample` DROP FOREIGN KEY `equipment_ibfk_2`;

-- Step 5: Add the new foreign key constraints with updated names
ALTER TABLE `sample` 
ADD CONSTRAINT `sample_ibfk_1` 
FOREIGN KEY (`reservation_ref_no`) REFERENCES `requests` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sample` 
ADD CONSTRAINT `sample_ibfk_2` 
FOREIGN KEY (`calibrated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Update indexes to use the new table name
-- (The indexes will automatically be updated when the table is renamed)

-- Verification queries (uncomment to verify the changes)
-- SHOW TABLES LIKE 'sample';
-- DESCRIBE sample;
-- SHOW CREATE TABLE sample;
-- SHOW CREATE TABLE calibration_records;
