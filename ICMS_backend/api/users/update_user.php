<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Make sure that the user is an admin
require_once __DIR__ . '/../auth/verify_token.php';

try {
    // Verify the token and get user data
    $userData = verifyToken();
    
    // Check if the user is an admin
    if ($userData->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Access denied."));
        exit();
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid token."));
    exit();
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create a log file
$logFile = __DIR__ . '/debug.log';
file_put_contents($logFile, "Update request started at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Log the raw input
$raw_data = file_get_contents("php://input");
file_put_contents($logFile, "Raw input: " . $raw_data . "\n", FILE_APPEND);

$data = json_decode($raw_data);
file_put_contents($logFile, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

include_once __DIR__ . '/../config/db.php';

// Verify token and get user data
$user_data = verifyToken();
file_put_contents($logFile, "User data from token: " . print_r($user_data, true) . "\n", FILE_APPEND);

$database = new Database();
$db = $database->getConnection();

if(!empty($data->id)) {
    // Check if user exists
    $check_query = "SELECT id FROM users WHERE id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$data->id]);
    
    if($check_stmt->rowCount() == 0) {
        file_put_contents($logFile, "User not found with ID: " . $data->id . "\n", FILE_APPEND);
        http_response_code(404);
        echo json_encode(array("message" => "User not found."));
        exit();
    }

    // Build update query based on provided fields
    $update_fields = array();
    $params = array();

    if(!empty($data->first_name)) {
        $update_fields[] = "first_name = ?";
        $params[] = $data->first_name;
    }

    if(!empty($data->last_name)) {
        $update_fields[] = "last_name = ?";
        $params[] = $data->last_name;
    }

    if(!empty($data->email)) {
        // Check if new email already exists
        $email_check = "SELECT id FROM users WHERE email = ? AND id != ?";
        $email_stmt = $db->prepare($email_check);
        $email_stmt->execute([$data->email, $data->id]);
        
        if($email_stmt->rowCount() > 0) {
            file_put_contents($logFile, "Email already exists: " . $data->email . "\n", FILE_APPEND);
            http_response_code(400);
            echo json_encode(array("message" => "Email already exists."));
            exit();
        }

        $update_fields[] = "email = ?";
        $params[] = $data->email;
    }

    if(!empty($data->role) && $userData->role === 'admin') {
        $update_fields[] = "role = ?";
        $params[] = $data->role;
    }

    if(isset($data->status)) {
        $update_fields[] = "status = ?";
        $params[] = $data->status ? 1 : 0;
    }

    file_put_contents($logFile, "Update fields: " . implode(", ", $update_fields) . "\n", FILE_APPEND);
    file_put_contents($logFile, "Parameters: " . print_r($params, true) . "\n", FILE_APPEND);

    if(count($update_fields) > 0) {
        $params[] = $data->id;
        $query = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = ?";
        file_put_contents($logFile, "Final query: " . $query . "\n", FILE_APPEND);
        
        $stmt = $db->prepare($query);
        
        if($stmt->execute($params)) {
            // Fetch the updated user data
            $fetch_query = "SELECT id, first_name, last_name, email, role, status FROM users WHERE id = ?";
            $fetch_stmt = $db->prepare($fetch_query);
            $fetch_stmt->execute([$data->id]);
            $updated_user = $fetch_stmt->fetch(PDO::FETCH_ASSOC);
            
            file_put_contents($logFile, "Updated user data: " . print_r($updated_user, true) . "\n", FILE_APPEND);

            http_response_code(200);
            echo json_encode(array(
                "message" => "User was successfully updated.",
                "first_name" => $updated_user['first_name'],
                "last_name" => $updated_user['last_name'],
                "email" => $updated_user['email'],
                "role" => $updated_user['role'],
                "status" => (bool)$updated_user['status']
            ));
        } else {
            file_put_contents($logFile, "Failed to execute update query\n", FILE_APPEND);
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update user."));
        }
    } else {
        file_put_contents($logFile, "No fields to update\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(array("message" => "No fields to update."));
    }
} else {
    file_put_contents($logFile, "No user ID provided\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update user. User ID is required."));
}

file_put_contents($logFile, "Update request completed at " . date('Y-m-d H:i:s') . "\n\n", FILE_APPEND);
?> 