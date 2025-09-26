<?php
// CORS headers - allow specific origin for development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, email, password, role, first_name, last_name, status FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->email]);
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Debug log
        error_log("User status: " . $row['status']);
        error_log("Status type: " . gettype($row['status']));
        
        // Check if user is inactive - explicitly check for 0 or '0'
        if($row['status'] == 0 || $row['status'] === '0' || $row['status'] === false) {
            http_response_code(401);
            echo json_encode(array("message" => "Account is inactive. Please contact administrator."));
            exit();
        }
        
        if(password_verify($data->password, $row['password'])) {
            $secret_key = "ICMS_SECRET_KEY_2024"; // Match the key in verify_token.php
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
                    "id" => $row['id'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name']
                )
            );

            http_response_code(200);
            $jwt = JWT::encode($token, $secret_key, 'HS256');
            echo json_encode(
                array(
                    "message" => "Login successful.",
                    "jwt" => $jwt,
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name'],
                    "full_name" => $row['first_name'] . ' ' . $row['last_name']
                ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "User not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to login. Data is incomplete."));
}
?> 