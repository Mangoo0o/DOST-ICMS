-- Migration script to rename reservations table to requests
-- Run this script in your MySQL database

-- Step 1: Rename the main table
RENAME TABLE `reservations` TO `requests`;

-- Step 2: Update the sample table foreign key constraint
-- Drop the existing foreign key constraint
ALTER TABLE `sample` DROP FOREIGN KEY `sample_ibfk_1`;

-- Add the new foreign key constraint referencing the requests table
ALTER TABLE `sample`
ADD CONSTRAINT `sample_ibfk_1`
FOREIGN KEY (`reservation_ref_no`) REFERENCES `requests` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Update transaction table if it has foreign key to reservations
-- Check if transaction table has a foreign key to reservations table
-- If it does, update it as well (uncomment the following lines if needed):

-- ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_ibfk_1`;
-- ALTER TABLE `transaction` 
-- ADD CONSTRAINT `transaction_ibfk_1` 
-- FOREIGN KEY (`reservation_ref_no`) REFERENCES `requests` (`reference_number`) 
-- ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Update any indexes that might reference the old table name
-- (This is usually handled automatically, but included for completeness)

-- Verification queries (run these to check the changes):
-- SHOW TABLES LIKE 'requests';
-- DESCRIBE requests;
-- SHOW CREATE TABLE sample;
-- SHOW CREATE TABLE transaction;
