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

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['backup_data'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Backup data is required']);
    exit();
}

$backupData = $data['backup_data'];

try {
    $pdo->beginTransaction();
    
    // Validate backup format
    if (!isset($backupData['version']) || !isset($backupData['settings'])) {
        throw new Exception('Invalid backup format');
    }
    
    // Restore user preferences
    if (isset($backupData['settings']['user_preferences'])) {
        $stmt = $pdo->prepare("DELETE FROM user_preferences WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        foreach ($backupData['settings']['user_preferences'] as $pref) {
            $stmt = $pdo->prepare("INSERT INTO user_preferences (user_id, preference_key, preference_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->execute([$user_id, $pref['preference_key'], $pref['preference_value']]);
        }
    }
    
    // Restore theme settings
    if (isset($backupData['settings']['theme_settings'])) {
        $stmt = $pdo->prepare("DELETE FROM theme_settings WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        foreach ($backupData['settings']['theme_settings'] as $theme) {
            $stmt = $pdo->prepare("INSERT INTO theme_settings (user_id, theme_name, theme_config, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->execute([$user_id, $theme['theme_name'], $theme['theme_config']]);
        }
    }
    
    // Restore notification preferences
    if (isset($backupData['settings']['notification_preferences'])) {
        $stmt = $pdo->prepare("DELETE FROM notification_preferences WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        foreach ($backupData['settings']['notification_preferences'] as $notif) {
            $stmt = $pdo->prepare("INSERT INTO notification_preferences (user_id, notification_type, enabled, settings, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([$user_id, $notif['notification_type'], $notif['enabled'], $notif['settings']]);
        }
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Settings restored successfully'
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Settings restore error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to restore settings: ' . $e->getMessage()
    ]);
}
?>
