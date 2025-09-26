<?php
// CORS headers - allow specific origin for development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Max-Age: 3600");

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
file_put_contents($logFile, "Request started at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

include_once __DIR__ . '/../config/db.php';

// Log the raw input
$raw_data = file_get_contents("php://input");
file_put_contents($logFile, "Raw input: " . $raw_data . "\n", FILE_APPEND);

$data = json_decode($raw_data);
file_put_contents($logFile, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

try {
    $database = new Database();
    $db = $database->getConnection();
    file_put_contents($logFile, "Database connection successful\n", FILE_APPEND);
} catch (Exception $e) {
    file_put_contents($logFile, "Database connection failed: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed"));
    exit();
}

if(
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->role)
) {
    file_put_contents($logFile, "All required fields are present\n", FILE_APPEND);

    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$data->email]);
    
    if($check_stmt->rowCount() > 0) {
        file_put_contents($logFile, "Email already exists: " . $data->email . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists."));
        exit();
    }

    $query = "INSERT INTO users (first_name, last_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $role = strtolower(str_replace(' ', '_', $data->role));
    
    file_put_contents($logFile, "Attempting to insert user with data:\n" . 
        "First Name: " . $data->first_name . "\n" .
        "Last Name: " . $data->last_name . "\n" .
        "Email: " . $data->email . "\n" .
        "Role: " . $role . "\n", FILE_APPEND);

    try {
        $result = $stmt->execute([
            $data->first_name,
            $data->last_name,
            $data->email,
            $password_hash,
            $role,
            true
        ]);
        
        if($result) {
            $user_id = $db->lastInsertId();
            file_put_contents($logFile, "User created successfully with ID: " . $user_id . "\n", FILE_APPEND);
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "User was successfully created.",
                "id" => $user_id,
                "first_name" => $data->first_name,
                "last_name" => $data->last_name,
                "email" => $data->email,
                "role" => $role,
                "status" => true
            ));
        } else {
            throw new Exception("Failed to execute insert statement");
        }
    } catch (Exception $e) {
        file_put_contents($logFile, "Error creating user: " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(503);
        echo json_encode(array(
            "message" => "Unable to create user.",
            "error" => $e->getMessage()
        ));
    }
} else {
    file_put_contents($logFile, "Missing required fields\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(array(
        "message" => "Unable to create user. Data is incomplete.",
        "received_data" => $data
    ));
}

file_put_contents($logFile, "Request completed at " . date('Y-m-d H:i:s') . "\n\n", FILE_APPEND);
?> 