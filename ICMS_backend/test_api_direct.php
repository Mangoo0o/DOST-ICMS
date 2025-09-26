<?php
/**
 * Direct API test for email settings
 */

// Test the API endpoint directly
$url = 'http://localhost:8000/api/settings/email_settings.php';

// Test data
$testData = [
    'settings' => [
        'email_enabled' => true,
        'smtp_host' => 'smtp.gmail.com',
        'smtp_port' => 587,
        'smtp_username' => 'test@gmail.com',
        'smtp_password' => 'test_password',
        'from_email' => 'noreply@dost-psto.com',
        'from_name' => 'DOST-PSTO ICMS'
    ]
];

echo "=== Direct API Test ===\n\n";
echo "URL: {$url}\n";
echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Make the request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer test_token' // This will fail auth, but we can see the response
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
echo "Response: {$response}\n";
if ($error) {
    echo "cURL Error: {$error}\n";
}

echo "\n=== Test Complete ===\n";
?>

