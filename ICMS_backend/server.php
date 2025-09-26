<?php
// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load Composer's autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string if present
if (($pos = strpos($request_uri, '?')) !== false) {
    $request_uri = substr($request_uri, 0, $pos);
}

// Remove leading slash
$request_uri = ltrim($request_uri, '/');

// Route the request to the appropriate API endpoint
if (strpos($request_uri, 'api/') === 0) {
    $api_path = substr($request_uri, 4); // Remove 'api/' prefix
    $file_path = __DIR__ . '/api/' . $api_path;
    
    if (file_exists($file_path)) {
        require $file_path;
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'API endpoint not found']);
    }
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Invalid API request']);
}
?> 