# Equipment to Sample Table Migration

This document describes the migration from the `equipment` table to the `sample` table in the ICMS system.

## Overview

The system has been updated to use the term "sample" instead of "equipment" throughout the codebase. This includes:
- Database table names
- API endpoints
- Frontend function names
- Database constraints and foreign keys

## Files Modified

### Backend Files
- `schema.sql` - Updated table creation script
- `migrate_reservations_to_requests.sql` - Updated migration script
- `update_schema.sql` - Updated schema update script
- `populate_transaction_table.sql` - Updated SQL queries
- All API files in `/api/` directory - Updated table references

### Frontend Files
- `src/services/api.js` - Updated function names and API calls

### New Migration Files
- `rename_equipment_to_sample.sql` - Script to rename the table
- `update_calibration_records.sql` - Script to update calibration records

## Database Changes

### Table Rename
- `equipment` → `sample`

### Column Rename in calibration_records
- `equipment_id` → `sample_id`

### Constraint Updates
- `equipment_ibfk_1` → `sample_ibfk_1`
- `equipment_ibfk_2` → `sample_ibfk_2`

## Migration Steps

### 1. Backup Your Database
Before running any migration scripts, create a backup of your database.

### 2. Run the Migration Scripts
Execute the scripts in the following order:

```sql
-- First, rename the equipment table to sample
SOURCE rename_equipment_to_sample.sql;

-- Then, update the calibration_records table
SOURCE update_calibration_records.sql;
```

### 3. Verify the Changes
After running the migration scripts, verify that:
- The `equipment` table has been renamed to `sample`
- The `calibration_records.equipment_id` column has been renamed to `sample_id`
- All foreign key constraints are properly set
- The application functions correctly

## API Endpoint Changes

The following API endpoints have been updated to use "sample" terminology:

### Calibration API
- `get_record_by_equipment.php` now expects `sample_id` parameter
- All internal references use `sample_id` instead of `equipment_id`

### Equipment API
- All queries now reference the `sample` table
- Function names updated to reflect "sample" terminology

## Frontend Changes

### Function Names Updated
- `createEquipment()` → `createSample()`
- `getEquipmentBySerial()` → `getSampleBySerial()`
- `updateEquipmentStatus()` → `updateSampleStatus()`
- `getCalibrationRecordByEquipmentId()` → `getCalibrationRecordBySampleId()`
- `getAllEquipment()` → `getAllSamples()`
- `getEquipmentById()` → `getSampleById()`

## Rollback Plan

If you need to rollback these changes:

1. Restore the database backup
2. Revert the code changes
3. The original `equipment` table structure will be preserved

## Testing

After migration, test the following functionality:
- Creating new samples
- Updating sample status
- Calibration record creation and retrieval
- Transaction processing
- Report generation

## Notes

- All existing data will be preserved during the migration
- The migration scripts handle foreign key constraints automatically
- No data loss should occur during the migration process
- The application will continue to work with the new table structure

## Support

If you encounter any issues during migration, please:
1. Check the database error logs
2. Verify all migration scripts executed successfully
3. Ensure all file changes have been applied
4. Contact the development team if problems persist
