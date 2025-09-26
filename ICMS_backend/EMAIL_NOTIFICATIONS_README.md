# ICMS Email Notification System

## Overview

The ICMS Email Notification System provides automatic email notifications to clients when their calibration requests are completed or when request status changes. The system is designed to be configurable, reliable, and easy to use.

## Features

- **Automatic Notifications**: Sends emails immediately when request status changes
- **Completion Notifications**: Special emails when requests are completed
- **Configurable Settings**: Full SMTP configuration through frontend interface
- **Test Functionality**: Built-in email testing capabilities
- **Professional Templates**: HTML and text email templates
- **Error Handling**: Graceful error handling with logging

## System Components

### Backend Components

1. **EmailService.php** (`api/services/EmailService.php`)
   - Main email service class
   - Handles SMTP configuration
   - Sends different types of notifications
   - Provides test email functionality

2. **Email Settings API** (`api/settings/email_settings.php`)
   - GET: Retrieve current email settings
   - POST: Update email settings
   - Validates configuration data

3. **Test Email API** (`api/settings/test_email.php`)
   - Sends test emails to verify configuration
   - Validates email addresses

4. **Request Status Integration**
   - `api/request/update_status.php`: Sends emails on manual status updates
   - `api/equipment/update_status.php`: Sends emails when samples are completed

### Frontend Components

1. **EmailSettings.jsx** (`src/components/EmailSettings.jsx`)
   - Complete email configuration interface
   - SMTP settings form
   - Test email functionality
   - Help documentation

2. **EmailSettingsPage.jsx** (`src/pages/EmailSettingsPage.jsx`)
   - Page wrapper for email settings
   - Integrated with routing system

## Database Schema

The system uses the existing `system_settings` table with the following email-related settings:

```sql
-- Email notification settings
email_enabled          -- Enable/disable email notifications (true/false)
smtp_host             -- SMTP server hostname (e.g., smtp.gmail.com)
smtp_port             -- SMTP server port (e.g., 587)
smtp_username         -- SMTP authentication username
smtp_password         -- SMTP authentication password
from_email            -- Default sender email address
from_name             -- Default sender name
```

## Setup Instructions

### 1. Initial Setup

Run the setup script to initialize email settings:

```bash
php ICMS_backend/setup_email_settings.php
```

### 2. Frontend Configuration

1. Navigate to the ICMS frontend
2. Go to Settings (click the settings icon in the sidebar)
3. Click "Configure Email" in the Email Settings card
4. Configure your SMTP settings:
   - **Enable Email Notifications**: Toggle on
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 for TLS or 465 for SSL
   - **SMTP Username**: Your email address
   - **SMTP Password**: Your email password or app password
   - **From Email**: The email address to send from
   - **From Name**: The name to display as sender

### 3. Gmail Configuration

For Gmail users:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use these settings:
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 587
   - **SMTP Username**: your-gmail@gmail.com
   - **SMTP Password**: The app password (not your regular password)

### 4. Testing

1. In the Email Settings page, enter a test email address
2. Click "Send Test Email"
3. Check your inbox (and spam folder) for the test email

## Email Templates

### Completion Email
- Sent when a request is marked as completed
- Includes request details, sample counts, and completion date
- Professional HTML and text versions

### Status Update Email
- Sent when request status changes (pending, in_progress, etc.)
- Includes new status and update information
- Professional HTML and text versions

### Test Email
- Simple test email to verify configuration
- Includes system information and timestamp

## API Endpoints

### GET `/api/settings/email_settings.php`
Retrieve current email settings.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "user@gmail.com",
    "from_email": "noreply@dost-psto.com",
    "from_name": "DOST-PSTO ICMS"
  }
}
```

### POST `/api/settings/email_settings.php`
Update email settings.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "settings": {
    "email_enabled": true,
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "user@gmail.com",
    "smtp_password": "app_password",
    "from_email": "noreply@dost-psto.com",
    "from_name": "DOST-PSTO ICMS"
  }
}
```

### POST `/api/settings/test_email.php`
Send a test email.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "test_email": "test@example.com",
  "test_name": "Test User"
}
```

## Testing

### Automated Testing

Run the comprehensive test script:

```bash
php ICMS_backend/test_email_notifications.php
```

### Simple Testing

Run the simple test script:

```bash
php ICMS_backend/test_email_simple.php
```

### Manual Testing

1. Create a test request in the system
2. Update the request status to "completed"
3. Check if the client receives an email notification

## Troubleshooting

### Common Issues

1. **"Email notifications are disabled"**
   - Check if `email_enabled` is set to `true` in system_settings
   - Verify through frontend settings

2. **"SMTP authentication failed"**
   - Verify SMTP username and password
   - For Gmail, ensure you're using an App Password
   - Check if 2-factor authentication is enabled

3. **"Connection timeout"**
   - Verify SMTP host and port
   - Check firewall settings
   - Ensure network connectivity

4. **"Emails not being sent"**
   - Check PHP error logs
   - Verify client email addresses in the database
   - Test with the test email functionality

### Debugging

1. Check PHP error logs for detailed error messages
2. Use the test email functionality to isolate issues
3. Verify database settings are correct
4. Test SMTP settings with external tools

### Logs

Email service errors are logged to PHP error logs. Check for messages starting with "EmailService:".

## Security Considerations

1. **Password Storage**: SMTP passwords are stored in the database. Consider encryption for production environments.

2. **Access Control**: Email settings are protected by authentication. Only authorized users can modify settings.

3. **Input Validation**: All email addresses and settings are validated before use.

4. **Error Handling**: Sensitive information is not exposed in error messages.

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **Multiple Recipients**: Support for CC/BCC recipients
3. **Email Scheduling**: Delayed or scheduled email sending
4. **Email Analytics**: Track email delivery and open rates
5. **Attachment Support**: Include certificates or documents in emails

## Support

For issues or questions about the email notification system:

1. Check this documentation first
2. Run the test scripts to diagnose issues
3. Check PHP error logs for detailed error messages
4. Verify SMTP configuration with your email provider

## Version History

- **v1.0**: Initial implementation with basic email notifications
- **v1.1**: Added test email functionality and improved error handling
- **v1.2**: Enhanced frontend interface and documentation

