<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit();
}

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['test_email'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Test email address is required']);
    exit();
}

$testEmail = filter_var($data['test_email'], FILTER_VALIDATE_EMAIL);
if (!$testEmail) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid email address']);
    exit();
}

try {
    $emailService = new EmailService();
    
    if (!$emailService->isEnabled()) {
        echo json_encode([
            'success' => false,
            'message' => 'Email notifications are disabled. Please enable them in settings first.'
        ]);
        exit();
    }
    
    $result = $emailService->sendTestEmail($testEmail, $data['test_name'] ?? '');
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error testing email: ' . $e->getMessage()
    ]);
}
?>
