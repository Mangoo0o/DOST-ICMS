<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../config/db.php';
require_once 'verify_token.php';
use \Firebase\JWT\JWT;

try {
    $userData = verifyToken();
    $db = new Database();
    $conn = $db->getConnection();
    $role = $userData->role;
    $user = null;
    if ($role === 'client') {
        $query = "SELECT id, email, first_name, last_name FROM clients WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$userData->id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) throw new Exception('Client not found.');
        $user['role'] = 'client';
    } else {
        $query = "SELECT id, email, first_name, last_name, role FROM users WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$userData->id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) throw new Exception('User not found.');
    }
    $secret_key = "ICMS_SECRET_KEY_2024";
    $issuer_claim = "THE_ISSUER";
    $audience_claim = "THE_AUDIENCE";
    $issuedat_claim = time();
    $notbefore_claim = $issuedat_claim;
    $expire_claim = $issuedat_claim + 86400 * 30;
    $token = array(
        "iss" => $issuer_claim,
        "aud" => $audience_claim,
        "iat" => $issuedat_claim,
        "nbf" => $notbefore_claim,
        "exp" => $expire_claim,
        "data" => array(
            "id" => $user['id'],
            "email" => $user['email'],
            "role" => $user['role'],
            "first_name" => $user['first_name'],
            "last_name" => $user['last_name']
        )
    );
    $jwt = JWT::encode($token, $secret_key, 'HS256');
    http_response_code(200);
    echo json_encode([
        "jwt" => $jwt,
        "message" => "Token refreshed successfully."
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["message" => $e->getMessage()]);
}
?> 