<?php
/**
 * Setup script for email notification settings
 * This script initializes the email settings in the database
 */

require_once __DIR__ . '/api/config/db.php';

echo "=== ICMS Email Settings Setup ===\n\n";

try {
    $db = (new Database())->getConnection();
    echo "✅ Database connection successful\n";
    
    // Check if system_settings table exists
    $stmt = $db->prepare("SHOW TABLES LIKE 'system_settings'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        echo "❌ system_settings table does not exist\n";
        echo "Please run setup_settings.php first\n";
        exit(1);
    }
    
    echo "✅ system_settings table exists\n";
    
    // Default email settings
    $defaultSettings = [
        'email_enabled' => [
            'value' => 'true',
            'description' => 'Enable or disable email notifications for request status updates'
        ],
        'smtp_host' => [
            'value' => 'smtp.gmail.com',
            'description' => 'SMTP server hostname for sending emails'
        ],
        'smtp_port' => [
            'value' => '587',
            'description' => 'SMTP server port number (587 for TLS, 465 for SSL)'
        ],
        'smtp_username' => [
            'value' => '',
            'description' => 'SMTP authentication username (usually your email address)'
        ],
        'smtp_password' => [
            'value' => '',
            'description' => 'SMTP authentication password (use App Password for Gmail)'
        ],
        'from_email' => [
            'value' => 'noreply@dost-psto.com',
            'description' => 'Default sender email address for notifications'
        ],
        'from_name' => [
            'value' => 'DOST-PSTO ICMS',
            'description' => 'Default sender name for notifications'
        ]
    ];
    
    echo "\nSetting up default email settings...\n";
    
    foreach ($defaultSettings as $key => $config) {
        $stmt = $db->prepare("
            INSERT INTO system_settings (setting_key, setting_value, description) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            description = VALUES(description),
            updated_at = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([$key, $config['value'], $config['description']]);
        echo "✅ {$key}: {$config['value']}\n";
    }
    
    echo "\n=== Email Settings Setup Complete ===\n";
    echo "Next steps:\n";
    echo "1. Go to the frontend application\n";
    echo "2. Navigate to Settings > Email Settings\n";
    echo "3. Configure your SMTP credentials\n";
    echo "4. Enable email notifications\n";
    echo "5. Test with a real email address\n";
    
    echo "\nFor Gmail setup:\n";
    echo "- SMTP Host: smtp.gmail.com\n";
    echo "- SMTP Port: 587\n";
    echo "- Username: your-gmail@gmail.com\n";
    echo "- Password: Use App Password (not your regular password)\n";
    echo "- Enable 2-factor authentication first\n";
    echo "- Generate App Password in Google Account settings\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>

