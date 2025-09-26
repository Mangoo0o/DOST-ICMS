# Email Notification Testing Guide

## Overview
This guide explains how to test the email notification system in the ICMS application.

## Prerequisites
1. Email settings must be configured in the frontend (Settings → Email Settings)
2. A valid SMTP configuration must be set up
3. Email notifications must be enabled

## Testing Steps

### 1. Configure Email Settings
1. Navigate to the frontend application
2. Go to Settings (click the settings icon in the sidebar)
3. Click "Configure Email" in the Email Settings card
4. Configure your SMTP settings:
   - Enable Email Notifications: Toggle ON
   - SMTP Host: Your email provider's SMTP server
   - SMTP Port: Usually 587 for TLS
   - SMTP Username: Your email address
   - SMTP Password: Your email password or app password
   - From Email: The email address to send from
   - From Name: The name to display as sender
5. Click "Save Settings"
6. Test the configuration by clicking "Send Test Email"

### 2. Test Email Notifications via Request Completion
1. Navigate to the Requests page
2. Find a request that is not yet completed
3. Click "View Details" on any request
4. In the request details modal, you'll see a blue "Mark as Completed" button
5. Click "Mark as Completed"
6. The system will:
   - Update the request status to "completed"
   - Send an email notification to the client
   - Show a success message: "Request marked as completed! Email notification has been sent to the client."

### 3. Verify Email Delivery
1. Check the client's email inbox
2. Look for an email with subject: "Request Completed - [Reference Number]"
3. The email should contain:
   - Professional HTML formatting
   - Request details (reference number, completion date)
   - Sample information
   - DOST-PSTO branding

### 4. Test Different Scenarios
- **Pending → Completed**: Test the main completion flow
- **In Progress → Completed**: Test status updates
- **Multiple Samples**: Test with requests that have multiple samples
- **Different Clients**: Test with different client email addresses

## Troubleshooting

### Email Not Sent
1. Check if email notifications are enabled in settings
2. Verify SMTP credentials are correct
3. Check PHP error logs for email service errors
4. Ensure client has a valid email address in the system

### SMTP Authentication Failed
1. For Gmail: Use App Password instead of regular password
2. Enable 2-factor authentication first
3. Verify SMTP host and port settings
4. Check firewall/network settings

### Email Goes to Spam
1. Check spam/junk folder
2. Add the sender email to contacts
3. Configure SPF/DKIM records for the domain (for production)

## API Endpoints Used
- `GET /api/settings/email_settings.php` - Get email settings
- `POST /api/settings/email_settings.php` - Update email settings
- `POST /api/settings/test_email.php` - Send test email
- `POST /api/request/update_status.php` - Update request status (triggers email)

## Email Templates
The system includes three email templates:
1. **Request Completion**: Sent when request is marked as completed
2. **Status Update**: Sent when request status changes
3. **Test Email**: Sent when testing email configuration

## Success Indicators
- ✅ Email settings save without errors
- ✅ Test email is received
- ✅ Request completion triggers email
- ✅ Email contains correct information
- ✅ Client receives professional-looking email

## Next Steps
Once testing is complete:
1. Configure production SMTP settings
2. Set up proper email templates if needed
3. Monitor email delivery rates
4. Set up email analytics if required

