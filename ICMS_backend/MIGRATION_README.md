# Database Migration for PWD and 4Ps Features

This migration adds support for Person with Disability (PWD) and 4Ps Beneficiary status to the clients table.

## New Fields Added

- `is_pwd` (TINYINT(1)) - Person with Disability status (0 = No, 1 = Yes)
- `is_4ps` (TINYINT(1)) - 4Ps Beneficiary status (0 = No, 1 = Yes)

## How to Run the Migration

### Option 1: Using the PHP Migration Script (Recommended)

1. Navigate to your backend directory:
   ```bash
   cd ICMS_backend
   ```

2. Run the migration script:
   ```bash
   php run_migration.php
   ```

3. The script will:
   - Add the new fields to the clients table
   - Add indexes for better performance
   - Verify that the fields were added successfully
   - Show you the results

### Option 2: Manual SQL Execution

If you prefer to run the SQL manually, you can execute the following SQL commands in your database:

```sql
-- Add is_pwd field (Person with Disability)
ALTER TABLE `clients` 
ADD COLUMN IF NOT EXISTS `is_pwd` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Person with Disability status: 0 = No, 1 = Yes';

-- Add is_4ps field (4Ps Beneficiary)
ALTER TABLE `clients` 
ADD COLUMN IF NOT EXISTS `is_4ps` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT '4Ps Beneficiary status: 0 = No, 1 = Yes';

-- Add indexes for better query performance
ALTER TABLE `clients` 
ADD INDEX IF NOT EXISTS `idx_is_pwd` (`is_pwd`),
ADD INDEX IF NOT EXISTS `idx_is_4ps` (`is_4ps`);
```

## Backend API Updates

The following API endpoints have been updated to handle the new fields:

### 1. Create Client (`/api/clients/create_client.php`)
- Now accepts `is_pwd` and `is_4ps` fields
- Sets default values (0) if not provided
- Stores the values in the database

### 2. Update Client (`/api/clients/update_client.php`)
- Now accepts `is_pwd` and `is_4ps` fields
- Updates the values in the database
- Returns the updated values in the response

### 3. Get Clients (`/api/clients/get_clients.php`)
- Now includes `is_pwd` and `is_4ps` fields in the response
- Returns boolean values (0 or 1)

### 4. Get Client Details (`/api/clients/get_client_details.php`)
- Now includes `is_pwd` and `is_4ps` fields in the response

## Frontend Integration

The frontend has been updated to:
- Display PWD and 4Ps checkboxes in forms
- Send the values to the backend APIs
- Display the values in client details views

## Verification

After running the migration, you can verify the changes by:

1. Checking the database structure:
   ```sql
   DESCRIBE clients;
   ```

2. Testing the API endpoints with the new fields

3. Creating a new client with PWD and 4Ps status

## Troubleshooting

If you encounter any issues:

1. **Database connection errors**: Check your database configuration in `/api/config/db.php`
2. **Permission errors**: Ensure your database user has ALTER TABLE permissions
3. **Field already exists**: The migration uses `IF NOT EXISTS`, so it's safe to run multiple times

## Rollback (if needed)

If you need to remove these fields (not recommended), you can run:

```sql
ALTER TABLE `clients` 
DROP COLUMN `is_pwd`,
DROP COLUMN `is_4ps`;
```

**Note**: This will permanently delete the data in these fields. 