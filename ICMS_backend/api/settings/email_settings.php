<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get current email settings
    try {
        // Get settings from database first
        $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'email_%' OR setting_key LIKE 'smtp_%' OR setting_key LIKE 'from_%'");
        $stmt->execute();
        $dbSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Try to get EmailService settings, but don't fail if it doesn't work
        $emailServiceSettings = [];
        try {
            $emailService = new EmailService();
            $emailServiceSettings = $emailService->getSettings();
        } catch (Exception $e) {
            // If EmailService fails, just use database settings
            error_log("EmailService error in GET: " . $e->getMessage());
        }
        
        $response = [
            'success' => true,
            'data' => array_merge($emailServiceSettings, $dbSettings)
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving email settings: ' . $e->getMessage()
        ]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update email settings
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    // Debug: Log the received data
    error_log("Email settings raw input: " . $rawInput);
    error_log("Email settings POST data: " . json_encode($data));
    
    if (!isset($data['settings'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Settings data is required', 'received_data' => $data]);
        exit();
    }
    
    $settings = $data['settings'];
    
    // Enforce hardcoded rules: email notifications ON, SMTP host and port
    $settings['email_enabled'] = 'true';
    $settings['smtp_host'] = 'smtp.gmail.com';
    
    // Validate required fields
    $requiredFields = ['email_enabled', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email', 'from_name'];
    foreach ($requiredFields as $field) {
        if (!isset($settings[$field])) {
            http_response_code(400);
            echo json_encode(['message' => "Required field '{$field}' is missing", 'received_settings' => array_keys($settings)]);
            exit();
        }
    }
    
    // Validate email addresses
    if (!filter_var($settings['from_email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid from email address']);
        exit();
    }
    
    // Enforce and validate SMTP port (hardcoded to 587)
    $smtpPort = 587;
    $settings['smtp_port'] = $smtpPort;
    if ($smtpPort < 1 || $smtpPort > 65535) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid SMTP port number', 'received_port' => $settings['smtp_port']]);
        exit();
    }
    $settings['smtp_port'] = $smtpPort;
    
    try {
        $pdo->beginTransaction();
        
        // Update or insert email settings
        foreach ($settings as $key => $value) {
            $stmt = $pdo->prepare("
                INSERT INTO system_settings (setting_key, setting_value, description) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value), 
                updated_at = CURRENT_TIMESTAMP
            ");
            
            $description = getSettingDescription($key);
            $stmt->execute([$key, $value, $description]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Email settings updated successfully'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating email settings: ' . $e->getMessage()
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}

function getSettingDescription($key) {
    $descriptions = [
        'email_enabled' => 'Enable or disable email notifications',
        'smtp_host' => 'SMTP server hostname',
        'smtp_port' => 'SMTP server port number',
        'smtp_username' => 'SMTP authentication username',
        'smtp_password' => 'SMTP authentication password',
        'from_email' => 'Default sender email address',
        'from_name' => 'Default sender name'
    ];
    
    return $descriptions[$key] ?? 'Email notification setting';
}
?>
