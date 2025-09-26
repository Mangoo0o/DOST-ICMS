<?php
// Test the simple email endpoint
echo "=== Testing Simple Email Endpoint ===\n\n";

// Simulate POST data
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Simulate JSON input
$testData = json_encode(['test_email' => 'crtpatongan@gmail.com']);
file_put_contents('php://input', $testData);

// Capture output
ob_start();

// Include the endpoint
include 'api/settings/test_email_simple.php';

$output = ob_get_clean();

echo "Response:\n";
echo $output . "\n\n";

echo "Done!\n";
?>




