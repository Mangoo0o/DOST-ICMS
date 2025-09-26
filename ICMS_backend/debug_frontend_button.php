<?php
// Debug endpoint to test frontend button clicks
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
    'raw_input' => file_get_contents('php://input'),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Not set'
];

$logFile = __DIR__ . '/frontend_debug_log.txt';
file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND | LOCK_EX);

$data = json_decode(file_get_contents('php://input'));

if ($data && isset($data->test_email)) {
    // Create a test email file
    $emailFile = __DIR__ . '/emails_sent/button_test_' . date('Y-m-d_H-i-s') . '_' . str_replace('@', '_at_', $data->test_email) . '.txt';
    $emailDir = dirname($emailFile);
    if (!is_dir($emailDir)) {
        mkdir($emailDir, 0755, true);
    }
    
    file_put_contents($emailFile, "Frontend Button Test\nTo: " . $data->test_email . "\nTime: " . date('Y-m-d H:i:s') . "\nFrom Frontend Button: YES\nStatus: Button click detected!");
    
    echo json_encode([
        'success' => true,
        'message' => 'Frontend button click detected! Email file created.',
        'test_email' => $data->test_email,
        'email_file' => basename($emailFile),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No test email provided or invalid data',
        'received_data' => $data
    ]);
}
?>




