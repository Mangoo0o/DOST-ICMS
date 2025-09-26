# Complete System Backup & Restore Documentation

This document provides comprehensive information about the full system backup and restore functionality implemented for the ICMS DOST-PSTO system.

## 🎯 **Overview**

The complete backup system provides three levels of backup:

1. **Settings Backup** - User preferences, themes, and application settings
2. **Database Backup** - All database tables and data
3. **Full System Backup** - Database + Files + Complete system state

## 📊 **What Gets Backed Up**

### **Full System Backup Includes:**

#### **Database Tables:**
- `users` - System users and authentication
- `clients` - Client information and profiles
- `reservations` - Calibration requests and reservations
- `sample` - Equipment/sample information
- `calibration_records` - Calibration data and results
- `inventory_items` - Equipment inventory
- `transactions` - Payment and transaction records
- `user_preferences` - User-specific settings
- `system_settings` - System-wide configuration
- `theme_settings` - Theme configurations
- `notification_preferences` - Notification settings
- All other system tables

#### **File System:**
- All uploaded files in `/uploads/` directory
- Reservation attachments (PDFs, images)
- Generated certificates and reports
- System assets and configurations

#### **System Information:**
- Database schema and structure
- Table relationships and constraints
- File metadata and timestamps
- System version and configuration

## 🔧 **API Endpoints**

### **1. Full System Backup**
- **Endpoint:** `POST /api/backup/full_backup.php`
- **Description:** Creates a complete system backup
- **Response:** JSON containing all database tables and files

### **2. Full System Restore**
- **Endpoint:** `POST /api/backup/full_restore.php`
- **Description:** Restores system from backup
- **Request:** JSON backup data
- **Warning:** This will REPLACE all existing data

### **3. Backup Information**
- **Endpoint:** `GET /api/backup/backup_info.php`
- **Description:** Gets system information for backup planning
- **Response:** Database size, table counts, file information

### **4. Scheduled Backup**
- **Endpoint:** `POST /api/backup/scheduled_backup.php`
- **Description:** Creates automated backups
- **Parameters:**
  - `schedule_type`: daily, weekly, monthly
  - `backup_type`: full, settings, database
  - `retention_days`: how long to keep backups

### **5. Backup Schedule Management**
- **Endpoint:** `GET/POST /api/backup/backup_schedule.php`
- **Description:** Manage backup schedules and view backup history

## 🖥️ **Frontend Interface**

### **Full Backup Modal**
Access via: **Sidebar → Full Backup**

**Features:**
- **System Overview**: Database size, file count, table information
- **Create Backup**: One-click full system backup with download
- **Restore Backup**: Upload and restore from backup file
- **Real-time Info**: Live system statistics
- **Progress Indicators**: Loading states and progress feedback
- **Error Handling**: Comprehensive error messages and validation

**Interface Sections:**
1. **Database Information Panel**
   - Database name and size
   - Total tables and row counts
   - Table-by-table breakdown

2. **Files Information Panel**
   - Total files and directories
   - Total file size
   - Directory structure

3. **Action Buttons**
   - Create Full Backup (Blue button)
   - Restore from Backup (Green button)
   - File picker for restore

4. **Warning Notice**
   - Important safety information
   - Best practices and recommendations

## ⚙️ **Automated Backup System**

### **Cron Job Setup**

Create cron jobs for automated backups:

```bash
# Daily full backup at 2 AM
0 2 * * * /usr/bin/php /path/to/ICMS_backend/backup_cron.php daily full

# Weekly settings backup on Sundays at 3 AM  
0 3 * * 0 /usr/bin/php /path/to/ICMS_backend/backup_cron.php weekly settings

# Monthly database backup on 1st of month at 4 AM
0 4 1 * * /usr/bin/php /path/to/ICMS_backend/backup_cron.php monthly database
```

### **Backup Types**

1. **Full Backup** (`full`)
   - Complete database dump
   - All uploaded files
   - System configuration
   - Largest backup size

2. **Settings Backup** (`settings`)
   - User preferences only
   - Theme configurations
   - Notification settings
   - Smallest backup size

3. **Database Backup** (`database`)
   - Database tables and data only
   - No file attachments
   - Medium backup size

### **Retention Policy**
- Default: 30 days
- Configurable per backup type
- Automatic cleanup of old backups
- Logged deletion activities

## 📁 **Backup File Structure**

### **Full Backup JSON Format:**
```json
{
  "version": "1.0",
  "created_at": "2024-01-15 10:30:00",
  "created_by": 123,
  "database_name": "icms_db",
  "tables": {
    "users": {
      "structure": "CREATE TABLE `users` (...)",
      "data": [...],
      "row_count": 25
    },
    "clients": {
      "structure": "CREATE TABLE `clients` (...)",
      "data": [...],
      "row_count": 150
    }
    // ... all other tables
  },
  "files": [
    {
      "path": "reservations/attachment1.pdf",
      "size": 1024000,
      "modified": "2024-01-15 09:00:00",
      "content": "base64_encoded_content"
    }
    // ... all other files
  ],
  "file_count": 58,
  "total_size": 15728640
}
```

## 🔒 **Security Features**

### **Authentication Required**
- All backup endpoints require valid user authentication
- JWT token verification for all operations
- User-specific backup access controls

### **Data Validation**
- Backup format validation before restore
- File type and size validation
- Database constraint checking
- Transaction safety with rollback

### **Access Control**
- Admin-only access to full system backup
- User-specific settings backup
- Audit logging for all backup operations

## 🚨 **Safety Measures**

### **Restore Warnings**
- Clear warnings about data replacement
- Confirmation dialogs for destructive operations
- Backup validation before restore
- Transaction rollback on errors

### **Data Integrity**
- Atomic database operations
- Foreign key constraint handling
- File system consistency checks
- Backup verification and validation

### **Error Handling**
- Comprehensive error logging
- User-friendly error messages
- Graceful failure handling
- Recovery procedures

## 📈 **Performance Considerations**

### **Backup Size Optimization**
- Compressed JSON format
- Base64 encoding for binary files
- Incremental backup options (future)
- Selective table backup (future)

### **Memory Management**
- Streaming for large datasets
- Chunked file processing
- Memory-efficient JSON handling
- Progress reporting for large backups

### **Storage Management**
- Automatic cleanup of old backups
- Configurable retention policies
- Disk space monitoring
- Backup compression (future)

## 🛠️ **Setup Instructions**

### **1. Database Setup**
```bash
# Run the settings tables setup
php ICMS_backend/setup_settings.php
```

### **2. Directory Permissions**
```bash
# Ensure backup directory is writable
mkdir -p ICMS_backend/backups
chmod 755 ICMS_backend/backups
```

### **3. Cron Job Configuration**
```bash
# Add to crontab
crontab -e

# Add backup schedules
0 2 * * * /usr/bin/php /path/to/ICMS_backend/backup_cron.php daily full
```

### **4. Web Server Configuration**
- Ensure PHP has sufficient memory limit
- Set appropriate execution time limits
- Configure file upload limits for restore

## 📋 **Usage Examples**

### **Create Full Backup via API**
```javascript
const response = await apiService.createFullBackup();
const backupData = response.data.data;
// Download backup file automatically
```

### **Restore from Backup via API**
```javascript
const backupData = JSON.parse(backupFileContent);
const response = await apiService.restoreFullBackup(backupData);
```

### **Get System Information**
```javascript
const response = await apiService.getBackupInfo();
const systemInfo = response.data.data;
console.log(`Database size: ${systemInfo.database.size_mb} MB`);
```

## 🔍 **Monitoring and Logging**

### **Backup Logs**
- Location: `ICMS_backend/backups/backup_log.json`
- Contains: Timestamp, type, size, status, errors
- Format: JSON array of log entries

### **System Monitoring**
- Database size tracking
- File count monitoring
- Backup success/failure rates
- Storage usage alerts

## 🚀 **Future Enhancements**

### **Planned Features**
- Incremental backups
- Cloud storage integration
- Backup encryption
- Automated restore testing
- Backup scheduling UI
- Email notifications
- Backup verification tools

### **Advanced Options**
- Selective table backup
- Custom backup filters
- Backup compression
- Multi-format export (SQL, CSV)
- Backup comparison tools

## ⚠️ **Important Notes**

1. **Always test restores** on a development environment first
2. **Keep multiple backup copies** in different locations
3. **Monitor backup sizes** and adjust retention policies accordingly
4. **Verify backup integrity** regularly
5. **Document restore procedures** for your team
6. **Test disaster recovery** scenarios periodically

This comprehensive backup system ensures your ICMS data is safe, recoverable, and properly managed! 🛡️
