<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, email, password, first_name, last_name FROM clients WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->email]);
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
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
                    "role" => "client",
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name']
                )
            );

            http_response_code(200);
            $jwt = JWT::encode($token, $secret_key, 'HS256');
            echo json_encode(
                array(
                    "message" => "Client login successful.",
                    "jwt" => $jwt,
                    "email" => $row['email'],
                    "role" => "client",
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name'],
                    "full_name" => $row['first_name'] . ' ' . $row['last_name'],
                    "client_id" => $row['id']
                ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid password."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Client not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to login. Email and password are required."));
}
?> 