<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'data' => null
    ]);
    exit();
}

try {
    $settings = [];
    
    // Helper to query or return empty if table missing
    $safeQuery = function($sql, $params = []) use ($pdo) {
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    };

    // Get user preferences
    $settings['user_preferences'] = $safeQuery("SELECT * FROM user_preferences WHERE user_id = ?", [$user_id]);
    
    // Get system settings
    $settings['system_settings'] = $safeQuery("SELECT * FROM system_settings");
    
    // Get theme settings
    $settings['theme_settings'] = $safeQuery("SELECT * FROM theme_settings WHERE user_id = ?", [$user_id]);
    
    // Get notification preferences
    $settings['notification_preferences'] = $safeQuery("SELECT * FROM notification_preferences WHERE user_id = ?", [$user_id]);
    
    echo json_encode([
        'success' => true,
        'data' => $settings,
        'message' => 'Settings retrieved successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Get settings error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve settings: ' . $e->getMessage()
    ]);
}
?>
