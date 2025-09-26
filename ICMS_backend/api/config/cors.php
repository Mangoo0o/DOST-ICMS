<?php
// Centralized CORS configuration
// This file should be included at the top of all API endpoints

// Only set CORS headers if this is a web request (not CLI)
if (php_sapi_name() !== 'cli') {
    // Set the allowed origins - add more for development if needed
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ];

    // Get the origin from the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // Check if the origin is allowed
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    } else {
        // For development, you might want to allow all origins
        // In production, you should remove this line
        header("Access-Control-Allow-Origin: http://localhost:5173");
    }

    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Accept, Origin");
    header("Access-Control-Max-Age: 3600");

    // Handle preflight OPTIONS request
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?> 