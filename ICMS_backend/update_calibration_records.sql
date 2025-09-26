-- Migration script to update calibration_records table
-- This script should be run after renaming the equipment table to sample

-- Step 1: Drop the foreign key constraint
ALTER TABLE `calibration_records` DROP FOREIGN KEY `calibration_records_ibfk_1`;

-- Step 2: Rename the column from equipment_id to sample_id
ALTER TABLE `calibration_records` CHANGE `equipment_id` `sample_id` int(11) NOT NULL;

-- Step 3: Add the new foreign key constraint
ALTER TABLE `calibration_records` 
ADD CONSTRAINT `calibration_records_ibfk_1` 
FOREIGN KEY (`sample_id`) REFERENCES `sample` (`id`);

-- Verification queries (uncomment to verify the changes)
-- DESCRIBE calibration_records;
-- SHOW CREATE TABLE calibration_records;
