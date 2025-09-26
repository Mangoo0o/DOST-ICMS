<?php
// Debug script to test frontend request
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo "=== Frontend Request Debug ===\n";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set') . "\n";
echo "Raw Input: " . file_get_contents('php://input') . "\n";

$data = json_decode(file_get_contents('php://input'));
echo "Parsed Data: " . print_r($data, true) . "\n";

if ($data && isset($data->test_email)) {
    echo "Test Email: " . $data->test_email . "\n";
    
    // Create a test email file
    $emailFile = __DIR__ . '/emails_sent/debug_' . date('Y-m-d_H-i-s') . '_' . str_replace('@', '_at_', $data->test_email) . '.txt';
    $emailDir = dirname($emailFile);
    if (!is_dir($emailDir)) {
        mkdir($emailDir, 0755, true);
    }
    
    file_put_contents($emailFile, "Debug Email Test\nTo: " . $data->test_email . "\nTime: " . date('Y-m-d H:i:s') . "\nFrom Frontend: YES");
    
    echo "Email file created: " . $emailFile . "\n";
    
    echo json_encode([
        'success' => true,
        'message' => 'Debug email created successfully!',
        'test_email' => $data->test_email,
        'email_file' => basename($emailFile)
    ]);
} else {
    echo "No test email provided\n";
    echo json_encode([
        'success' => false,
        'message' => 'No test email provided'
    ]);
}

echo "\n=== End Debug ===\n";
?>




