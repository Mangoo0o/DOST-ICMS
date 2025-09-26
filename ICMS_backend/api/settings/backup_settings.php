<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit();
}

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();
$user_id = $user_data->id;

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

try {
    // Get all settings from database
    $settings = [];
    
    // Get user preferences
    $stmt = $pdo->prepare("SELECT * FROM user_preferences WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $userPrefs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings['user_preferences'] = $userPrefs;
    
    // Get system settings
    $stmt = $pdo->prepare("SELECT * FROM system_settings");
    $stmt->execute();
    $systemSettings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings['system_settings'] = $systemSettings;
    
    // Get theme settings
    $stmt = $pdo->prepare("SELECT * FROM theme_settings WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $themeSettings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings['theme_settings'] = $themeSettings;
    
    // Get notification preferences
    $stmt = $pdo->prepare("SELECT * FROM notification_preferences WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $notificationSettings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings['notification_preferences'] = $notificationSettings;
    
    // Add metadata
    $backup = [
        'version' => '1.0',
        'created_at' => date('Y-m-d H:i:s'),
        'user_id' => $user_id,
        'settings' => $settings
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $backup,
        'message' => 'Settings backup created successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Settings backup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create settings backup: ' . $e->getMessage()
    ]);
}
?>
