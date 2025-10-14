# ICMS Settings User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Data Management Workflows (CRUD)](#data-management-workflows-crud)
3. [Accessing Settings](#accessing-settings)
4. [Theme Settings](#theme-settings)
5. [Email Configuration](#email-configuration)
6. [Full System Backup & Restore](#full-system-backup--restore)
7. [System Logs (Admin Only)](#system-logs-admin-only)
8. [Settings Backup & Restore](#settings-backup--restore)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)
11. [Support and Contact](#support-and-contact)

---

## System Overview

The Integrated Calibration Management System (ICMS) DOST-PSTO is a comprehensive web-based application designed for managing calibration services, equipment inventory, client requests, and financial transactions. The system includes a robust settings framework that provides:

### Core Features
- **Multi-role User Management**: Admin, Calibration Engineers, Cashiers, and Clients
- **Equipment & Sample Management**: Test weights, thermometers, and other calibration equipment
- **Request & Reservation System**: Client booking and scheduling
- **Calibration Records**: Digital certificates and measurement tracking
- **Financial Management**: Transactions, payments, and invoicing
- **Inventory Control**: Equipment status and maintenance tracking
- **Reporting System**: Comprehensive analytics and documentation

### Settings System Capabilities
- **Personalization**: Theme selection and user preferences
- **Data Protection**: Full system backup and restore functionality
- **Audit Trail**: Comprehensive logging and monitoring
- **Configuration Management**: System-wide and user-specific settings
- **Security Controls**: Role-based access and permission management

The settings system is designed to be intuitive for end-users while providing powerful administrative capabilities for system maintenance and data protection.

---

## Data Management Workflows (CRUD)

This comprehensive section covers how to create, read, update, and delete data across all major modules in the ICMS system. Each workflow includes detailed step-by-step instructions, role requirements, and best practices.

### Requests (Reservations) Management

#### Creating a New Request
**Required Role**: Admin, Calibration Engineers, or Front Office Staff

1. **Navigate to Requests**:
   - Click "Requests" in the sidebar
   - You'll see the requests dashboard with existing requests

2. **Start New Request**:
   - Click "New Request" or the "+" button
   - A request form will open

3. **Fill Required Information**:
   - **Client Information**: Select existing client or create new one
   - **Equipment/Sample Details**: Specify what needs calibration
   - **Requested Date**: Choose preferred calibration date
   - **Priority Level**: Set urgency (Low, Medium, High, Critical)
   - **Special Instructions**: Add any specific requirements

4. **Add Attachments** (Optional):
   - Click "With Attachment" if documents are needed
   - Upload PDF, images, or other relevant files
   - Maximum file size: 10MB per file

5. **Submit Request**:
   - Review all information
   - Click "Save" to create the request
   - System generates a unique Reference Number

#### Updating Request Information
**Required Role**: Admin, Calibration Engineers

1. **Open Request**:
   - Find the request in the list
   - Click on the request to open details

2. **Edit Fields**:
   - **Schedule Changes**: Update requested dates
   - **Assignment**: Assign to specific engineer
   - **Status Updates**: Change from Pending to In Progress
   - **Notes**: Add internal comments or updates

3. **Save Changes**:
   - Click "Save" to update the request
   - Changes are logged in system audit trail

#### Managing Request Status
**Status Flow**: Pending → In Progress → Completed/Cancelled

1. **Update Status**:
   - Use the status dropdown in request details
   - Add status change reason if required

2. **Status-Specific Actions**:
   - **In Progress**: Can assign engineer, add notes
   - **Completed**: Can generate certificates, process payments
   - **Cancelled**: Must provide cancellation reason

### Client Management

#### Registering a New Client
**Required Role**: Admin, Front Office Staff

1. **Access Registration**:
   - Click "Register Client" or go to User Management
   - Fill out the client registration form

2. **Required Information**:
   - **Personal Details**: Full name, email, phone
   - **Organization**: Company name, address, type
   - **Contact Preferences**: Communication methods
   - **Account Type**: Individual or Corporate

3. **Submit Registration**:
   - Verify all information is correct
   - Click "Register" to create client account
   - Client receives login credentials via email

#### Updating Client Information
**Required Role**: Admin, Front Office Staff

1. **Find Client**:
   - Go to "User Management" or "Clients"
   - Use search to locate specific client

2. **Edit Details**:
   - Click on client name to open profile
   - Update contact information, organization details
   - Modify account status if needed

3. **Save Changes**:
   - Click "Save" to update client record
   - Changes are immediately reflected in system

#### Viewing Client History
1. **Open Client Profile**:
   - Navigate to client details
   - Click "Requests" tab to view all their reservations
   - Filter by date range, status, or equipment type

### Calibration Records Management

#### Creating Calibration Records
**Required Role**: Calibration Engineers, Admin

1. **Access Calibration Module**:
   - Go to "Calibration" in the sidebar
   - Select "New Calibration" or choose from existing requests

2. **Select Equipment/Sample**:
   - Choose from available equipment inventory
   - Or select from pending calibration requests
   - Verify equipment details and specifications

3. **Enter Measurement Data**:
   - **Test Points**: Record measurements at various points
   - **Uncertainties**: Calculate and enter measurement uncertainties
   - **Environmental Conditions**: Temperature, humidity, pressure
   - **Reference Standards**: Document standards used

4. **Save and Finalize**:
   - **Save as Draft**: For incomplete calibrations
   - **Finalize**: For completed calibrations (requires all data)

#### Generating Calibration Certificates
**Required Role**: Calibration Engineers, Admin

1. **Open Completed Calibration**:
   - Navigate to finalized calibration record
   - Verify all data is complete and accurate

2. **Generate Certificate**:
   - Click "Generate Certificate"
   - System creates PDF using official templates
   - Certificate includes all measurement data and uncertainties

3. **Review and Distribute**:
   - Review certificate for accuracy
   - Download or email to client
   - Certificate is stored in system for future reference

#### Updating Calibration Records
1. **Open Record**:
   - Find calibration in the list
   - Click to open details

2. **Edit Information**:
   - Modify measurement data (if not finalized)
   - Update notes or additional information
   - Change status if needed

3. **Save Changes**:
   - Click "Save" to update record
   - System maintains version history

### Inventory Management

#### Viewing Inventory
**Available to**: All users (with different access levels)

1. **Access Inventory**:
   - Click "Inventory" in the sidebar
   - Select appropriate category (Test Weights, Thermometers, etc.)

2. **Filter and Search**:
   - Use filters for status, location, calibration date
   - Search by equipment ID, model, or serial number
   - Sort by various criteria

#### Adding New Equipment
**Required Role**: Admin, Calibration Engineers

1. **Start New Item**:
   - Click "Add Item" in the inventory section
   - Select equipment category

2. **Enter Equipment Details**:
   - **Identification**: Model, serial number, manufacturer
   - **Specifications**: Range, accuracy, resolution
   - **Status**: Available, In Use, Out of Service, Calibrated
   - **Location**: Physical location in facility
   - **Calibration Schedule**: Next due date, interval

3. **Save Equipment**:
   - Review all information
   - Click "Save" to add to inventory
   - Equipment appears in available inventory

#### Updating Equipment Information
1. **Open Equipment Record**:
   - Find equipment in inventory list
   - Click to open details

2. **Modify Information**:
   - Update status, location, or specifications
   - Add maintenance notes or issues
   - Update calibration schedule

3. **Save Changes**:
   - Click "Save" to update record
   - Changes are logged in system

#### Equipment Status Management
- **Available**: Ready for calibration use
- **In Use**: Currently assigned to calibration
- **Out of Service**: Under maintenance or repair
- **Calibrated**: Recently calibrated and ready
- **Expired**: Calibration due or overdue

### Transaction and Payment Management

#### Creating Transactions
**Required Role**: Cashiers, Admin

1. **Access Transactions**:
   - Go to "Transactions" in the sidebar
   - Click "New Transaction"

2. **Select Related Items**:
   - Choose client for the transaction
   - Link to specific requests or calibrations
   - Add multiple line items if needed

3. **Enter Financial Details**:
   - **Service Fees**: Calibration charges
   - **Additional Charges**: Rush fees, special handling
   - **Taxes**: Applicable taxes and fees
   - **Payment Terms**: Due date, payment method

4. **Save Transaction**:
   - Review all charges and totals
   - Click "Save" to create transaction
   - System generates transaction number

#### Processing Payments
**Required Role**: Cashiers, Admin

1. **Open Transaction**:
   - Find transaction in the list
   - Click to open payment details

2. **Process Payment**:
   - Click "Process Payment"
   - Enter payment amount and method
   - Add payment reference or check number

3. **Confirm Payment**:
   - Review payment details
   - Click "Confirm" to record payment
   - System updates transaction status

#### Managing Discounts
1. **Open Transaction**:
   - Navigate to transaction details
   - Click "Update Discount"

2. **Apply Discount**:
   - Enter discount amount or percentage
   - Add discount reason or authorization
   - Save discount application

### Report Generation

#### Creating Reports
**Available to**: Admin, Calibration Engineers (limited)

1. **Access Reports**:
   - Click "Reports" in the sidebar
   - Choose report type from available options

2. **Set Report Parameters**:
   - **Date Range**: Select start and end dates
   - **Filters**: Status, client, equipment type
   - **Grouping**: By date, client, engineer, etc.

3. **Generate Report**:
   - Click "Generate" to create report
   - Review data and formatting
   - Export as PDF or Excel if needed

#### Available Report Types
- **Calibration Summary**: All calibrations in date range
- **Client Activity**: Client requests and payments
- **Equipment Status**: Inventory and calibration status
- **Financial Reports**: Revenue, payments, outstanding
- **Performance Metrics**: Engineer productivity, turnaround times

### User Management (Admin Only)

#### Creating New Users
**Required Role**: Admin only

1. **Access User Management**:
   - Go to "User Management" in the sidebar
   - Click "Add User"

2. **Enter User Details**:
   - **Personal Information**: Name, email, phone
   - **Login Credentials**: Username and temporary password
   - **Role Assignment**: Admin, Engineer, Cashier, Client
   - **Permissions**: Specific access rights

3. **Save User**:
   - Review all information
   - Click "Save" to create user account
   - User receives login credentials via email

#### Managing User Roles
1. **Open User Profile**:
   - Find user in the management list
   - Click to open user details

2. **Update Role**:
   - Change user role if needed
   - Modify permissions and access rights
   - Update contact information

3. **Save Changes**:
   - Click "Save" to update user
   - Changes take effect immediately

### Role-Based Access Control

#### Admin Users
- **Full System Access**: All modules and functions
- **User Management**: Create, edit, delete users
- **System Settings**: Configure system-wide settings
- **Backup/Restore**: Full system backup capabilities
- **Audit Logs**: View all system activity

#### Calibration Engineers
- **Calibration Management**: Create, edit calibration records
- **Request Management**: Process and update requests
- **Inventory Access**: View and update equipment status
- **Certificate Generation**: Create calibration certificates
- **Limited Reports**: Calibration and equipment reports

#### Cashiers
- **Transaction Management**: Create and process payments
- **Client Billing**: Generate invoices and statements
- **Payment Processing**: Record payments and receipts
- **Financial Reports**: Revenue and payment reports
- **Limited Client Access**: View client information

#### Clients
- **Request Submission**: Submit calibration requests
- **Status Tracking**: View request and calibration status
- **Certificate Access**: Download calibration certificates
- **Payment Viewing**: View invoices and payment history
- **Profile Management**: Update personal information

### Best Practices for Data Management

#### Data Entry
- **Always verify information** before saving
- **Use consistent formatting** for names, dates, and numbers
- **Complete all required fields** before submission
- **Add meaningful notes** for future reference

#### Data Security
- **Never share login credentials** with others
- **Log out** when finished with your session
- **Report suspicious activity** to administrators
- **Follow data retention policies** for sensitive information

#### System Performance
- **Use filters and search** to find specific records
- **Avoid creating duplicate entries** when possible
- **Regularly clean up** old or unnecessary data
- **Report system issues** promptly to administrators

#### Audit and Compliance
- **All changes are logged** in the system audit trail
- **Maintain data integrity** by following procedures
- **Document unusual situations** in notes or comments
- **Regular backup verification** ensures data safety

---

## Accessing Settings

### How to Open Settings
1. **Log in** to the ICMS system with your credentials
2. **Navigate to the sidebar** on the left side of the screen
3. **Look for the Settings option** in the bottom-left corner of the sidebar
4. **Click on "Settings"** to open the settings modal
5. The settings modal will appear with all available options based on your role

### Settings Interface Overview
The settings modal is organized into several sections:
- **Header**: Contains the modal title and close button
- **Theme Settings**: Personal appearance customization
- **System Information**: Database and file system statistics (admin only)
- **Backup & Restore**: Data protection options
- **System Logs**: Activity monitoring (admin only)
- **User Manual**: Quick access to this documentation

### Role-Based Access Control
Settings availability varies by user role:

#### Admin Users
- ✅ **Full System Backup & Restore**: Complete database and file system backup
- ✅ **System Logs**: View all system activity and audit trails
- ✅ **Settings Backup & Restore**: Export/import user preferences
- ✅ **Theme Settings**: All theme options
- ✅ **Debug Information**: System diagnostics and health checks

#### Calibration Engineers
- ✅ **Theme Settings**: Personal appearance customization
- ✅ **Settings Backup & Restore**: Personal preferences only
- ❌ **System Logs**: No access to system monitoring
- ❌ **Full System Backup**: No access to system-wide backups

#### Cashiers
- ✅ **Theme Settings**: Personal appearance customization
- ✅ **Settings Backup & Restore**: Personal preferences only
- ❌ **System Logs**: No access to system monitoring
- ❌ **Full System Backup**: No access to system-wide backups

#### Clients
- ✅ **Theme Settings**: Personal appearance customization
- ❌ **Settings Backup & Restore**: No access to settings management
- ❌ **System Logs**: No access to system monitoring
- ❌ **Full System Backup**: No access to system-wide backups

---

## Theme Settings

### Available Themes
The ICMS system supports three comprehensive theme options designed for different user preferences and working environments:

#### 1. Light Theme
- **Appearance**: Clean, bright interface with light backgrounds and high contrast
- **Color Scheme**: 
  - Primary: White backgrounds (#FFFFFF)
  - Secondary: Light gray backgrounds (#F8F9FA)
  - Text: Dark gray/black (#212529)
  - Accents: Blue highlights (#0D6EFD)
- **Best for**: 
  - Daytime use and well-lit environments
  - Users who prefer high contrast
  - Professional office settings
  - Extended reading sessions

#### 2. Dark Theme
- **Appearance**: Modern dark interface with reduced eye strain
- **Color Scheme**:
  - Primary: Dark gray backgrounds (#212529)
  - Secondary: Darker gray backgrounds (#343A40)
  - Text: Light gray/white (#F8F9FA)
  - Accents: Blue highlights (#0D6EFD)
- **Best for**:
  - Nighttime use and low-light environments
  - Users who prefer reduced screen brightness
  - Extended work sessions
  - Modern aesthetic preferences

#### 3. System Theme
- **Appearance**: Automatically follows your operating system's theme preference
- **Behavior**: 
  - Detects OS theme changes in real-time
  - Switches between light and dark based on system settings
  - Maintains consistency with other applications
- **Best for**:
  - Users who prefer system-wide consistency
  - Multi-application workflows
  - Automatic adaptation to time of day
  - Minimal configuration needs

### How to Change Theme
1. **Open Settings** by clicking "Settings" in the sidebar
2. **Locate the Theme section** at the top of the settings modal
3. **Select your preferred theme**:
   - Click **"Light"** for the light theme
   - Click **"Dark"** for the dark theme
   - Click **"System"** for automatic theme detection
4. **The change is applied immediately** - no save button required
5. **Verify the change** by checking the interface appearance

### Theme Features and Benefits

#### Visual Elements Affected
- **Background Colors**: Main content areas, sidebars, and modals
- **Text Colors**: Headers, body text, and labels
- **Button Styles**: Primary, secondary, and action buttons
- **Form Elements**: Input fields, dropdowns, and checkboxes
- **Navigation**: Sidebar, menu items, and breadcrumbs
- **Tables**: Headers, rows, and borders
- **Cards and Panels**: Content containers and information boxes

#### Accessibility Features
- **High Contrast**: Ensures text readability in all themes
- **Consistent Focus States**: Clear visual indicators for keyboard navigation
- **Color Blindness Support**: Uses patterns and shapes alongside colors
- **Scalable Text**: All themes support browser zoom and text scaling

### Theme Persistence and Synchronization
- **Automatic Saving**: Your theme selection is saved immediately to your user profile
- **Cross-Device Sync**: Theme preference syncs across all devices when logged in
- **Session Persistence**: Theme remains active across browser sessions
- **Individual Settings**: Each user can have their own theme preference
- **No System Impact**: Theme changes don't affect other users or system functionality

### Troubleshooting Theme Issues
- **Theme Not Applying**: Refresh the page or clear browser cache
- **Inconsistent Appearance**: Check if browser extensions are interfering
- **System Theme Not Working**: Ensure your OS supports theme detection
- **Partial Theme Application**: Try logging out and back in

---

## Email Configuration

### Overview
The ICMS system includes a comprehensive email notification system that automatically sends emails to clients when their calibration requests are completed or when request statuses change. This section covers how to configure and manage email settings.

### Email System Features
- **Automatic Notifications**: Sends emails immediately when request status changes
- **Completion Notifications**: Special emails when requests are completed
- **Professional Templates**: HTML and text email templates with DOST-PSTO branding
- **Test Functionality**: Built-in email testing capabilities
- **Error Handling**: Graceful error handling with logging
- **SMTP Integration**: Uses industry-standard SMTP for reliable delivery

### Accessing Email Settings
1. **Log in** to the ICMS system with admin credentials
2. **Navigate to Settings** by clicking "Settings" in the sidebar
3. **Look for "Email Settings"** section in the settings modal
4. **Click "Configure Email"** to open the email configuration interface

### Email Configuration Interface

#### Enable Email Notifications
- **Toggle Switch**: Enable/disable email notifications system-wide
- **Default**: Enabled (recommended)
- **Effect**: When enabled, system sends automatic emails; when disabled, no emails are sent

#### SMTP Configuration
The system uses SMTP (Simple Mail Transfer Protocol) to send emails. You need to configure:

##### SMTP Username
- **Purpose**: Your email account username for SMTP authentication
- **Format**: Usually your full email address (e.g., `yourname@gmail.com`)
- **Important**: This email address will also be used as the sender email
- **Example**: `crtpatongan@gmail.com`

##### SMTP Password
- **Purpose**: Password for SMTP authentication
- **Security**: Use App Password for Gmail (not your regular password)
- **Format**: App-specific password generated by your email provider
- **Example**: `abcd efgh ijkl mnop` (Gmail App Password)

### Gmail Configuration Guide

#### Prerequisites
1. **Gmail Account**: You need a Gmail account
2. **2-Factor Authentication**: Must be enabled on your Google account
3. **App Password**: Generate a specific app password for ICMS

#### Step-by-Step Gmail Setup

##### Step 1: Enable 2-Factor Authentication
1. **Go to Google Account Settings**: https://myaccount.google.com/
2. **Navigate to Security** section
3. **Enable 2-Step Verification** if not already enabled
4. **Follow the setup process** to secure your account

##### Step 2: Generate App Password
1. **In Google Account Settings**, go to **Security**
2. **Find "2-Step Verification"** section
3. **Click "App passwords"** (you may need to sign in again)
4. **Select "Mail"** as the app type
5. **Choose "Other"** and enter "ICMS" as the device name
6. **Click "Generate"**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
8. **Save this password securely** - you won't be able to see it again

##### Step 3: Configure ICMS Email Settings
1. **Open ICMS Email Settings**
2. **Enter SMTP Username**: Your Gmail address (e.g., `crtpatongan@gmail.com`)
3. **Enter SMTP Password**: The App Password you generated (e.g., `abcd efgh ijkl mnop`)
4. **Click "Save Settings"**
5. **Test the configuration** using the test email feature

### Other Email Providers

#### Outlook/Hotmail Configuration
- **SMTP Host**: `smtp-mail.outlook.com`
- **SMTP Port**: `587`
- **Security**: TLS/STARTTLS
- **Authentication**: Username and password required
- **App Password**: Generate from Microsoft Account settings

#### Yahoo Mail Configuration
- **SMTP Host**: `smtp.mail.yahoo.com`
- **SMTP Port**: `587`
- **Security**: TLS/STARTTLS
- **Authentication**: Username and password required
- **App Password**: Generate from Yahoo Account settings

#### Custom SMTP Server
- **SMTP Host**: Your organization's SMTP server
- **SMTP Port**: Usually `587` (TLS) or `465` (SSL)
- **Security**: Configure based on your server requirements
- **Authentication**: Username and password as provided by IT

### Testing Email Configuration

#### Test Email Feature
1. **In Email Settings**, scroll to "Test Email Configuration"
2. **Enter Test Email Address**: Use your own email or a test address
3. **Enter Test Name** (optional): Name to display in the test email
4. **Click "Send Test Email"**
5. **Check your inbox** (and spam folder) for the test email

#### What to Expect
- **Test Email Subject**: "ICMS Test Email"
- **Sender**: "ICMS <your-smtp-username@domain.com>"
- **Content**: Professional HTML email with system information
- **Delivery Time**: Usually within 1-2 minutes

#### Troubleshooting Test Emails
- **Not Received**: Check spam/junk folder
- **Error Message**: Verify SMTP credentials
- **Delivery Delay**: Wait a few minutes, check server status
- **Authentication Failed**: Verify App Password is correct

### Email Templates and Content

#### Request Completion Email
**Triggered When**: A calibration request is marked as "completed"

**Content Includes**:
- Professional DOST-PSTO branding
- Request reference number
- Completion date
- Sample information and counts
- Payment details (if applicable)
- Contact information

**Example Subject**: "Your ICMS Request is Completed • RL-072025-MET-0669"

#### Status Update Email
**Triggered When**: Request status changes (pending → in progress → completed)

**Content Includes**:
- Current status information
- Expected completion timeline
- Reference number
- Contact information for questions

#### Test Email
**Triggered When**: Using the test email feature

**Content Includes**:
- System configuration details
- Timestamp of test
- SMTP server information
- Confirmation that settings are working

### Email Delivery and Reliability

#### Delivery Guarantees
- **Immediate Sending**: Emails are sent as soon as status changes
- **Retry Logic**: System attempts to resend failed emails
- **Error Logging**: All email attempts are logged for troubleshooting
- **Graceful Failure**: System continues working even if emails fail

#### Rate Limits
- **Gmail**: ~100 emails per day for free accounts
- **Outlook**: ~300 emails per day for free accounts
- **Yahoo**: ~500 emails per day for free accounts
- **Custom SMTP**: Depends on your server configuration

#### Best Practices for Email Delivery
- **Use App Passwords**: Never use regular passwords for SMTP
- **Monitor Delivery**: Check system logs for failed deliveries
- **Test Regularly**: Use test email feature to verify configuration
- **Backup Configuration**: Document your email settings

### Security Considerations

#### SMTP Security
- **TLS Encryption**: All emails are sent using TLS encryption
- **App Passwords**: Use app-specific passwords, not regular passwords
- **Access Control**: Only admins can configure email settings
- **Audit Trail**: All email configuration changes are logged

#### Data Protection
- **No Email Storage**: System doesn't store email content permanently
- **Secure Transmission**: All SMTP communication is encrypted
- **Access Logging**: All email-related activities are logged
- **Password Protection**: SMTP passwords are stored securely

### Troubleshooting Email Issues

#### Common Problems and Solutions

##### "SMTP Authentication Failed"
**Problem**: Cannot authenticate with email server
**Solutions**:
- Verify SMTP username is correct (usually your email address)
- Check that App Password is correct (not regular password)
- Ensure 2-factor authentication is enabled
- Try generating a new App Password

##### "Connection Timeout"
**Problem**: Cannot connect to SMTP server
**Solutions**:
- Check internet connection
- Verify SMTP host and port settings
- Check firewall settings
- Try different SMTP port (587 or 465)

##### "Emails Not Being Received"
**Problem**: Emails sent but not delivered
**Solutions**:
- Check recipient's spam/junk folder
- Verify recipient email address is correct
- Check sender reputation and domain
- Monitor email server logs

##### "Test Email Fails"
**Problem**: Test email feature doesn't work
**Solutions**:
- Verify all SMTP settings are correct
- Check that email notifications are enabled
- Try with a different test email address
- Check system logs for error details

#### Error Messages and Solutions

##### "Invalid SMTP credentials"
- Double-check username and password
- Ensure App Password is used (not regular password)
- Verify account has SMTP access enabled

##### "SMTP server not responding"
- Check SMTP host and port settings
- Verify internet connectivity
- Try different SMTP server if available

##### "Email notifications are disabled"
- Enable email notifications in settings
- Save settings after enabling
- Test configuration after enabling

### Email Settings Management

#### Saving Settings
1. **Configure all required fields**
2. **Click "Save Settings"** button
3. **Wait for confirmation message**
4. **Test configuration** to verify it works

#### Resetting Settings
1. **Clear all fields** if needed
2. **Save empty configuration** to reset
3. **Reconfigure** with correct settings
4. **Test again** to ensure it works

#### Backup Email Configuration
- **Document settings**: Keep a record of your SMTP settings
- **Secure storage**: Store App Passwords securely
- **Regular testing**: Test email configuration monthly
- **Update passwords**: Rotate App Passwords regularly

### Advanced Email Configuration

#### Custom Email Templates
- **Professional Branding**: All emails include DOST-PSTO branding
- **HTML Format**: Emails are sent in both HTML and text formats
- **Responsive Design**: Templates work on all devices
- **Consistent Styling**: Maintains professional appearance

#### Email Monitoring
- **Delivery Tracking**: Monitor email delivery success rates
- **Error Logging**: All email failures are logged
- **Performance Metrics**: Track email sending performance
- **User Feedback**: Monitor client satisfaction with email notifications

### Best Practices for Email Configuration

#### Security Best Practices
- **Use App Passwords**: Never use regular email passwords
- **Regular Updates**: Update App Passwords periodically
- **Access Control**: Limit email configuration access to admins
- **Monitor Usage**: Regularly check email sending logs

#### Operational Best Practices
- **Test Regularly**: Use test email feature monthly
- **Monitor Delivery**: Check for failed email deliveries
- **Backup Settings**: Document email configuration
- **Train Users**: Ensure staff understand email system

#### Maintenance Best Practices
- **Regular Testing**: Test email configuration after system updates
- **Password Rotation**: Change App Passwords every 6 months
- **Log Review**: Regularly review email sending logs
- **Performance Monitoring**: Monitor email delivery performance

---

## Full System Backup & Restore

> **⚠️ Important**: Full system backup/restore is available to **admin users only**. This feature affects the entire system and all user data.

### System Information Display
The settings modal shows current system status:
- **Database Size**: Total size of all database tables
- **Database Tables**: Number of tables in the system
- **File Count**: Number of uploaded files in the system
- **Total File Size**: Combined size of all uploaded files

### Creating a Full Backup

#### What's Included
A full backup includes:
- **All database tables** (users, requests, calibrations, transactions, etc.)
- **All uploaded files** (reservation attachments, certificates, etc.)
- **System configuration** and settings
- **Complete data integrity** with foreign key relationships

#### How to Create Backup
1. **Open Settings** (admin access required)
2. **Scroll to "Full System Backup & Restore"** section
3. **Click "Create Full Backup"** button
4. **Wait for the process** to complete (may take a few minutes)
5. **A .sql file will be downloaded** automatically
6. **Save the file** in a secure location

#### Backup File Naming
- **Format**: `icms_db_YYYY-MM-DD-HH-MM-SS.sql`
- **Example**: `icms_db_2024-01-15-14-30-45.sql`
- **Location**: Downloads folder (or chosen location)

### Restoring a Full Backup

> **⚠️ Warning**: Restoring a backup will **completely replace** all current data. This action cannot be undone.

#### Before Restoring
- **Test the backup** on a development environment first
- **Ensure you have a current backup** of existing data
- **Notify all users** that the system will be temporarily unavailable
- **Verify the backup file** is complete and not corrupted

#### How to Restore
1. **Open Settings** (admin access required)
2. **Scroll to "Full System Backup & Restore"** section
3. **Click "Restore Full Backup"** button
4. **Select your .sql backup file** from your computer
5. **Wait for the restoration** to complete
6. **The system will automatically reload** after successful restoration

#### After Restoring
- **Verify data integrity** by checking key records
- **Test critical functions** (login, requests, calibrations)
- **Notify users** that the system is back online
- **Check system logs** for any issues

### Debug Information
The debug feature provides system diagnostics:
- **Database Connection Status**: Confirms database connectivity
- **Table Count**: Number of available database tables
- **File System Status**: Uploads directory accessibility
- **PHP Configuration**: Memory limits and version information
- **System Health**: Overall system status

---

## System Logs (Admin Only)

### What Are System Logs?
System logs track all important activities in the ICMS system:
- **User Actions**: Logins, logouts, data modifications
- **System Events**: Backups, restores, configuration changes
- **Error Tracking**: System errors and warnings
- **Audit Trail**: Complete record of system usage

### Viewing System Logs
1. **Open Settings** (admin access required)
2. **Scroll to "System Logs"** section
3. **Logs are automatically loaded** when settings open
4. **Use the filter box** to search for specific activities

### Log Information
Each log entry shows:
- **Timestamp**: When the action occurred
- **Action Type**: What type of action was performed
- **User**: Who performed the action
- **Details**: Additional information about the action

### Log Filtering
- **Search by action**: Type action names (e.g., "login", "backup")
- **Search by user**: Type user names or IDs
- **Search by details**: Type specific information
- **Case insensitive**: Searches work regardless of capitalization

### Log Categories
Common log actions include:
- **request_create**: New calibration requests
- **calibration_create**: New calibration records
- **calibration_update**: Updated calibration records
- **payment_process**: Payment processing
- **settings_update**: Settings changes
- **backup_export_sql**: Full system backups
- **backup_import_sql**: Full system restores

---

## Settings Backup & Restore

### User Settings Backup
This feature allows you to backup and restore your personal settings:
- **Theme preferences**
- **User preferences**
- **Notification settings**
- **Personal configurations**

### Exporting Settings
1. **Open Settings**
2. **Look for "Backup & Restore"** section (if available)
3. **Click "Export Settings"** button
4. **A JSON file will be downloaded** with your settings
5. **Save the file** for future use

### Importing Settings
1. **Open Settings**
2. **Look for "Backup & Restore"** section (if available)
3. **Click "Import Settings"** button
4. **Select your previously exported JSON file**
5. **Settings will be restored** immediately

### Settings File Format
- **Format**: JSON (JavaScript Object Notation)
- **Extension**: `.json`
- **Size**: Typically very small (few KB)
- **Security**: Contains only your personal preferences

---

## Troubleshooting

### Common Issues and Solutions

#### Settings Modal Won't Open
**Problem**: Clicking "Settings" doesn't open the modal
**Solutions**:
- Refresh the page and try again
- Check if you're logged in properly
- Clear browser cache and cookies
- Try a different browser

#### Theme Changes Not Applied
**Problem**: Theme selection doesn't change the appearance
**Solutions**:
- Wait a few seconds for the change to apply
- Refresh the page
- Check if your browser supports the theme system
- Try logging out and back in

#### Backup Creation Fails
**Problem**: "Create Full Backup" button doesn't work
**Solutions**:
- Ensure you have admin privileges
- Check your internet connection
- Wait for any ongoing operations to complete
- Try the debug feature to check system status

#### Restore Process Fails
**Problem**: Backup restoration doesn't work
**Solutions**:
- Verify the backup file is complete and not corrupted
- Check that the file is a valid .sql file
- Ensure sufficient disk space is available
- Try a different backup file

#### Logs Not Loading
**Problem**: System logs section is empty
**Solutions**:
- Ensure you have admin privileges
- Check your internet connection
- Wait for logs to load (may take a moment)
- Try refreshing the settings modal

### Error Messages

#### "Database connection failed"
- Check if the database server is running
- Verify database credentials
- Contact system administrator

#### "Forbidden: Admins only"
- You don't have admin privileges
- Contact your administrator for access
- Use basic settings features only

#### "Invalid backup format"
- The backup file is corrupted or invalid
- Try downloading a new backup
- Ensure the file is a valid .sql file

#### "Failed to restore backup"
- The backup file may be incompatible
- Check system requirements
- Contact technical support

---

## Best Practices

### For All Users

#### Theme Selection
- **Choose based on environment**: Light for bright rooms, dark for dim lighting
- **Consider eye strain**: Switch themes if you experience discomfort
- **Use system theme** for automatic adaptation

#### Regular Settings Backup
- **Export settings monthly** to avoid losing preferences
- **Store backup files securely** in multiple locations
- **Test restore process** occasionally to ensure backups work

### For Admin Users

#### Backup Strategy
- **Create full backups weekly** or before major changes
- **Test restore process** on development environment first
- **Store backups securely** with proper access controls
- **Document backup procedures** for team members

#### System Monitoring
- **Check system logs regularly** for unusual activity
- **Monitor backup success** and system health
- **Review user activity** for security purposes
- **Document any issues** for technical support

#### Before Major Changes
- **Create full backup** before system updates
- **Notify all users** of planned maintenance
- **Test changes** in development environment first
- **Have rollback plan** ready

### Security Considerations

#### Backup Security
- **Encrypt backup files** when storing long-term
- **Limit access** to backup files
- **Regularly rotate** backup storage locations
- **Verify backup integrity** periodically

#### Access Control
- **Use strong passwords** for admin accounts
- **Limit admin privileges** to necessary personnel
- **Monitor admin activities** through system logs
- **Regularly review** user permissions

---

## Support and Contact

### Getting Help
- **Check this manual** for common solutions
- **Review system logs** for error details
- **Contact your system administrator** for access issues
- **Report bugs** to the development team

### System Requirements
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **JavaScript enabled** in browser
- **Stable internet connection** for full functionality
- **Admin privileges** for advanced features

### Version Information
- **ICMS Version**: 1.0.0
- **Settings System**: v1.0
- **Last Updated**: 2024

---

*This manual covers the ICMS Settings system. For other system features, please refer to the main ICMS documentation.*
