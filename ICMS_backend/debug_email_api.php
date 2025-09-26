<?php
/**
 * Debug script for email settings API
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Email Settings API Debug ===\n\n";

// Test 1: Check if we can include the required files
echo "Test 1: Including required files\n";
try {
    require_once __DIR__ . '/vendor/autoload.php';
    echo "✅ Autoloader loaded\n";
    
    require_once __DIR__ . '/api/config/cors.php';
    echo "✅ CORS config loaded\n";
    
    require_once __DIR__ . '/api/config/db.php';
    echo "✅ Database config loaded\n";
    
    require_once __DIR__ . '/api/services/EmailService.php';
    echo "✅ EmailService loaded\n";
} catch (Exception $e) {
    echo "❌ Error loading files: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Check database connection
echo "\nTest 2: Database connection\n";
try {
    $db = new Database();
    $pdo = $db->getConnection();
    if ($pdo) {
        echo "✅ Database connection successful\n";
    } else {
        echo "❌ Database connection failed\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Check EmailService instantiation
echo "\nTest 3: EmailService instantiation\n";
try {
    $emailService = new EmailService();
    echo "✅ EmailService instantiated successfully\n";
    
    $settings = $emailService->getSettings();
    echo "✅ EmailService getSettings() works\n";
    echo "Settings: " . json_encode($settings) . "\n";
} catch (Exception $e) {
    echo "❌ EmailService error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

// Test 4: Check system_settings table
echo "\nTest 4: System settings table\n";
try {
    $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'email_%' OR setting_key LIKE 'smtp_%' OR setting_key LIKE 'from_%'");
    $stmt->execute();
    $dbSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    echo "✅ Database query successful\n";
    echo "Settings found: " . count($dbSettings) . "\n";
    foreach ($dbSettings as $key => $value) {
        if ($key === 'smtp_password') {
            echo "  - {$key}: " . (empty($value) ? 'Not set' : 'Set (hidden)') . "\n";
        } else {
            echo "  - {$key}: {$value}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Database query error: " . $e->getMessage() . "\n";
}

echo "\n=== Debug Complete ===\n";
?>
