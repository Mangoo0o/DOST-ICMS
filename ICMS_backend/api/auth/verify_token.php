<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

function verifyToken() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(array("message" => "No token provided."));
        exit();
    }

    $jwt = str_replace('Bearer ', '', $headers['Authorization']);
    $secret_key = "ICMS_SECRET_KEY_2024"; // Change this to a secure key in production

    try {
        // Add leeway to allow for clock skew (e.g., 60 seconds)
        JWT::$leeway = 60;
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        return $decoded->data;
    } catch(Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid token."));
        exit();
    }
}
?> 