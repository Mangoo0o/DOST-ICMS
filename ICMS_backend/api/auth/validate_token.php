<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/db.php';
require_once 'verify_token.php';

try {
    // Verify the token and get user data
    $authResult = verifyToken();
    
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode(['message' => $authResult['message'] || 'Invalid token']);
        exit();
    }
    
    $userData = $authResult['user'];
    
    // Get additional user data from database
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check if it's a user or client based on the role in token
    if ($userData->role === 'client') {
        // Get client data
        $query = "SELECT id, first_name, last_name, email, COALESCE(require_password_change, 0) AS require_password_change FROM clients WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$userData->id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $response = array(
                "id" => $row['id'],
                "client_id" => $row['id'],
                "email" => $row['email'],
                "role" => "client",
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "full_name" => $row['first_name'] . ' ' . $row['last_name'],
                "require_password_change" => (bool)$row['require_password_change']
            );
            
            http_response_code(200);
            echo json_encode($response);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Client not found."));
        }
    } else {
        // Get user data
        $query = "SELECT first_name, last_name, email, role, COALESCE(require_password_change, 0) AS require_password_change FROM users WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$userData->id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $response = array(
                "id" => $userData->id,
                "email" => $row['email'],
                "role" => $row['role'],
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "full_name" => $row['first_name'] . ' ' . $row['last_name'],
                "require_password_change" => (bool)$row['require_password_change']
            );
            
            http_response_code(200);
            echo json_encode($response);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "User not found."));
        }
    }
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid token."));
}
?> 