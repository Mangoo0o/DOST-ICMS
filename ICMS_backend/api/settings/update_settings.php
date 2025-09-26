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

if (!isset($data['settings_type']) || !isset($data['settings_data'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Settings type and data are required']);
    exit();
}

$settingsType = $data['settings_type'];
$settingsData = $data['settings_data'];

try {
    $pdo->beginTransaction();
    
    switch ($settingsType) {
        case 'user_preferences':
            foreach ($settingsData as $pref) {
                $stmt = $pdo->prepare("
                    INSERT INTO user_preferences (user_id, preference_key, preference_value, created_at, updated_at) 
                    VALUES (?, ?, ?, NOW(), NOW()) 
                    ON DUPLICATE KEY UPDATE 
                    preference_value = VALUES(preference_value), 
                    updated_at = NOW()
                ");
                $stmt->execute([$user_id, $pref['key'], $pref['value']]);
            }
            break;
            
        case 'theme_settings':
            foreach ($settingsData as $theme) {
                $stmt = $pdo->prepare("
                    INSERT INTO theme_settings (user_id, theme_name, theme_config, created_at, updated_at) 
                    VALUES (?, ?, ?, NOW(), NOW()) 
                    ON DUPLICATE KEY UPDATE 
                    theme_config = VALUES(theme_config), 
                    updated_at = NOW()
                ");
                $stmt->execute([$user_id, $theme['name'], $theme['config']]);
            }
            break;
            
        case 'notification_preferences':
            foreach ($settingsData as $notif) {
                $stmt = $pdo->prepare("
                    INSERT INTO notification_preferences (user_id, notification_type, enabled, settings, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, NOW(), NOW()) 
                    ON DUPLICATE KEY UPDATE 
                    enabled = VALUES(enabled), 
                    settings = VALUES(settings), 
                    updated_at = NOW()
                ");
                $stmt->execute([$user_id, $notif['type'], $notif['enabled'], $notif['settings']]);
            }
            break;
            
        default:
            throw new Exception('Invalid settings type');
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Settings updated successfully'
    ]);
    // Log settings update
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $details = json_encode(['settings_type' => $settingsType]);
        $stmt = $pdo->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id ?? null, 'settings_update', $details, null]);
    } catch (Exception $ignore) {}
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Update settings error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update settings: ' . $e->getMessage()
    ]);
}
?>
