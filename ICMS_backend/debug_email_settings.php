<?php
/**
 * Debug script for email settings API
 */

require_once __DIR__ . '/api/config/db.php';
require_once __DIR__ . '/api/services/EmailService.php';

echo "=== Email Settings Debug ===\n\n";

// Test 1: Check if EmailService can be instantiated
echo "Test 1: EmailService Instantiation\n";
try {
    $emailService = new EmailService();
    echo "✅ EmailService instantiated successfully\n";
    echo "Email enabled: " . ($emailService->isEnabled() ? 'Yes' : 'No') . "\n";
    
    $settings = $emailService->getSettings();
    echo "Current settings:\n";
    foreach ($settings as $key => $value) {
        if ($key === 'smtp_password') {
            echo "  - {$key}: " . (empty($value) ? 'Not set' : 'Set (hidden)') . "\n";
        } else {
            echo "  - {$key}: {$value}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Failed to instantiate EmailService: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Check database connection and settings
echo "Test 2: Database Connection and Settings\n";
try {
    $db = (new Database())->getConnection();
    echo "✅ Database connection successful\n";
    
    // Check if system_settings table exists
    $stmt = $db->prepare("SHOW TABLES LIKE 'system_settings'");
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        echo "✅ system_settings table exists\n";
        
        // Check email settings
        $stmt = $db->prepare("SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'email_%' OR setting_key LIKE 'smtp_%' OR setting_key LIKE 'from_%'");
        $stmt->execute();
        $emailSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        echo "Email settings in database:\n";
        if (empty($emailSettings)) {
            echo "  ⚠️  No email settings found\n";
        } else {
            foreach ($emailSettings as $key => $value) {
                if ($key === 'smtp_password') {
                    echo "  - {$key}: " . (empty($value) ? 'Not set' : 'Set (hidden)') . "\n";
                } else {
                    echo "  - {$key}: {$value}\n";
                }
            }
        }
    } else {
        echo "❌ system_settings table does not exist\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Test the API endpoint directly
echo "Test 3: API Endpoint Test\n";
$testData = [
    'settings' => [
        'email_enabled' => true,
        'smtp_host' => 'smtp.gmail.com',
        'smtp_port' => 587,
        'smtp_username' => 'test@gmail.com',
        'smtp_password' => 'test_password',
        'from_email' => 'noreply@dost-psto.com',
        'from_name' => 'DOST-PSTO ICMS'
    ]
];

echo "Test data structure:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n";

// Test 4: Check if the API file exists and is accessible
echo "\nTest 4: API File Check\n";
$apiFile = __DIR__ . '/api/settings/email_settings.php';
if (file_exists($apiFile)) {
    echo "✅ API file exists: {$apiFile}\n";
    
    // Check file permissions
    if (is_readable($apiFile)) {
        echo "✅ API file is readable\n";
    } else {
        echo "❌ API file is not readable\n";
    }
} else {
    echo "❌ API file does not exist: {$apiFile}\n";
}

echo "\n=== Debug Complete ===\n";
?>

