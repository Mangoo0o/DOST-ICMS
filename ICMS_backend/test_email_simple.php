<?php
/**
 * Simple email test script
 * Run this to quickly test if email notifications are working
 */

require_once __DIR__ . '/api/services/EmailService.php';

echo "=== Simple Email Test ===\n\n";

try {
    $emailService = new EmailService();
    
    echo "Email Service Status:\n";
    echo "- Enabled: " . ($emailService->isEnabled() ? 'Yes' : 'No') . "\n";
    
    if (!$emailService->isEnabled()) {
        echo "\n❌ Email notifications are disabled.\n";
        echo "Please enable them in the frontend settings first.\n";
        exit(1);
    }
    
    echo "\nEnter test email address: ";
    $testEmail = trim(fgets(STDIN));
    
    if (empty($testEmail) || !filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
        echo "❌ Invalid email address\n";
        exit(1);
    }
    
    echo "Sending test email to: {$testEmail}\n";
    echo "Please wait...\n\n";
    
    $result = $emailService->sendTestEmail($testEmail, 'Test User');
    
    if ($result['success']) {
        echo "✅ SUCCESS!\n";
        echo "Test email sent successfully to {$testEmail}\n";
        echo "Check your inbox (and spam folder) for the test email.\n";
    } else {
        echo "❌ FAILED!\n";
        echo "Error: " . $result['message'] . "\n";
        echo "\nCommon issues:\n";
        echo "1. Check SMTP credentials in settings\n";
        echo "2. Verify SMTP host and port\n";
        echo "3. For Gmail, use App Password instead of regular password\n";
        echo "4. Check firewall/network settings\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>

