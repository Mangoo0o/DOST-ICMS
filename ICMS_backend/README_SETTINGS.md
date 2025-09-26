# Settings Backup and Restore System

This document describes the settings backup and restore functionality implemented for the ICMS DOST-PSTO system.

## Overview

The settings backup and restore system allows users to:
- Export their current settings to a JSON file
- Import settings from a previously exported JSON file
- Backup settings to the server
- Restore settings from server backup

## Database Tables

The following tables are created to support the settings system:

### 1. `user_preferences`
Stores user-specific preferences like theme, display options, etc.
- `id`: Primary key
- `user_id`: Foreign key to users table
- `preference_key`: The preference name (e.g., 'theme', 'language')
- `preference_value`: The preference value
- `created_at`, `updated_at`: Timestamps

### 2. `system_settings`
Stores system-wide settings that apply to all users.
- `id`: Primary key
- `setting_key`: The setting name
- `setting_value`: The setting value
- `description`: Human-readable description
- `created_at`, `updated_at`: Timestamps

### 3. `theme_settings`
Stores user-specific theme configurations.
- `id`: Primary key
- `user_id`: Foreign key to users table
- `theme_name`: Name of the theme
- `theme_config`: JSON configuration for the theme
- `created_at`, `updated_at`: Timestamps

### 4. `notification_preferences`
Stores user notification preferences.
- `id`: Primary key
- `user_id`: Foreign key to users table
- `notification_type`: Type of notification (email, browser, etc.)
- `enabled`: Whether this notification type is enabled
- `settings`: JSON configuration for notifications
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### 1. GET `/api/settings/get_settings.php`
Retrieves all settings for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_preferences": [...],
    "system_settings": [...],
    "theme_settings": [...],
    "notification_preferences": [...]
  }
}
```

### 2. POST `/api/settings/backup_settings.php`
Creates a backup of all user settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "created_at": "2024-01-01 12:00:00",
    "user_id": 123,
    "settings": {...}
  }
}
```

### 3. POST `/api/settings/restore_settings.php`
Restores settings from backup data.

**Request Body:**
```json
{
  "backup_data": {
    "version": "1.0",
    "created_at": "2024-01-01 12:00:00",
    "user_id": 123,
    "settings": {...}
  }
}
```

### 4. POST `/api/settings/update_settings.php`
Updates specific settings.

**Request Body:**
```json
{
  "settings_type": "user_preferences",
  "settings_data": [
    {
      "key": "theme",
      "value": "dark"
    }
  ]
}
```

## Frontend Components

### SettingsContext
React context that manages settings state and provides methods for:
- Loading settings from the server
- Updating settings
- Exporting settings to JSON file
- Importing settings from JSON file
- Backup and restore operations

### Settings Modal
Enhanced settings modal in the sidebar that includes:
- Theme selection (Light/Dark/System)
- Export settings button
- Import settings button
- Error handling and loading states

## Setup Instructions

1. Run the database setup script:
   ```bash
   php setup_settings.php
   ```

2. The script will create all necessary tables and insert default settings.

3. The settings functionality will be available immediately in the application.

## Usage

### Export Settings
1. Click on "Settings" in the sidebar
2. Click the "Export" button in the Backup & Restore section
3. A JSON file will be downloaded with all your current settings

### Import Settings
1. Click on "Settings" in the sidebar
2. Click the "Import" button in the Backup & Restore section
3. Select a previously exported JSON file
4. Settings will be restored from the file

### Backup to Server
The backup functionality automatically saves settings to the server when exporting.

### Restore from Server
Settings are automatically loaded from the server when the application starts.

## File Format

The exported settings file has the following structure:

```json
{
  "version": "1.0",
  "created_at": "2024-01-01T12:00:00",
  "user_id": 123,
  "settings": {
    "user_preferences": [
      {
        "id": 1,
        "user_id": 123,
        "preference_key": "theme",
        "preference_value": "dark",
        "created_at": "2024-01-01 12:00:00",
        "updated_at": "2024-01-01 12:00:00"
      }
    ],
    "system_settings": [...],
    "theme_settings": [...],
    "notification_preferences": [...]
  }
}
```

## Security Considerations

- All API endpoints require authentication
- User settings are isolated by user_id
- File uploads are validated for JSON format
- Backup data is validated before restoration

## Error Handling

The system includes comprehensive error handling:
- Database connection errors
- Invalid backup file format
- Missing required fields
- Permission errors
- Network errors

All errors are logged and user-friendly messages are displayed.
