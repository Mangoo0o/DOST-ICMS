<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

function verifyToken() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return ['success' => false, 'message' => 'No token provided.'];
    }

    $jwt = str_replace('Bearer ', '', $headers['Authorization']);
    $secret_key = "ICMS_SECRET_KEY_2024"; // Change this to a secure key in production

    try {
        // Add leeway to allow for clock skew (e.g., 60 seconds)
        JWT::$leeway = 60;
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        return ['success' => true, 'user' => $decoded->data];
    } catch(Exception $e) {
        return ['success' => false, 'message' => 'Invalid token.'];
    }
}
?> 