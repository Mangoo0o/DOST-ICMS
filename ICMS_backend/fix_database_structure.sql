-- Fix Database Structure Issues
-- This script addresses inconsistencies between old and new database field naming

-- 1. Fix calibration_records table - ensure it uses correct field names
-- The table already uses 'id' as primary key and 'sample_id' correctly
-- But we need to ensure 'calibrated_by' references the correct user table

-- 2. Fix clients table - remove redundant user_id field if it exists
-- The clients table should only use 'id' as primary key

-- Check if user_id column exists in clients table and remove it if redundant
-- (This will be handled by the application code, not SQL)

-- 3. Ensure all foreign key relationships are correct
-- calibration_records.calibrated_by should reference users.id (if users table exists)
-- calibration_records.sample_id should reference sample.id
-- requests.client_id should reference clients.id

-- 4. Update any indexes that might reference old field names
-- Remove any indexes on old field names and ensure proper indexes exist

-- Add proper indexes if they don't exist
ALTER TABLE calibration_records 
ADD INDEX IF NOT EXISTS idx_sample_id (sample_id),
ADD INDEX IF NOT EXISTS idx_calibrated_by (calibrated_by),
ADD INDEX IF NOT EXISTS idx_calibration_type (calibration_type);

-- Ensure sample table has proper indexes
ALTER TABLE sample 
ADD INDEX IF NOT EXISTS idx_reservation_ref_no (reservation_ref_no),
ADD INDEX IF NOT EXISTS idx_calibrated_by (calibrated_by),
ADD INDEX IF NOT EXISTS idx_status (status);

-- Ensure clients table has proper indexes
ALTER TABLE clients 
ADD INDEX IF NOT EXISTS idx_email (email),
ADD INDEX IF NOT EXISTS idx_company (company);

-- Ensure requests table has proper indexes
ALTER TABLE requests 
ADD INDEX IF NOT EXISTS idx_client_id (client_id),
ADD INDEX IF NOT EXISTS idx_reference_number (reference_number),
ADD INDEX IF NOT EXISTS idx_status (status);

-- Note: The main issue is in the application code, not the database structure
-- The database structure is mostly correct, but the application code needs to be updated
-- to use consistent field names throughout.
