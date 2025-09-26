<?php
/**
 * Simple API test
 */

echo "=== Simple API Test ===\n\n";

// Test the email settings API
$url = 'http://localhost:8000/api/settings/email_settings.php';

echo "Testing GET request to: {$url}\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    echo "❌ Failed to get response\n";
    $error = error_get_last();
    if ($error) {
        echo "Error: " . $error['message'] . "\n";
    }
} else {
    echo "✅ Got response:\n";
    echo $response . "\n";
}

echo "\n=== Test Complete ===\n";
?>

