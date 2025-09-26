<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../config/db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

$database = new Database();
$db = $database->getConnection();

try {
    // Check if test user already exists
    $check_query = "SELECT id FROM users WHERE email = 'admin@example.com'";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        echo json_encode(["message" => "Test user already exists"]);
        exit();
    }

    // Create test user
    $query = "INSERT INTO users (first_name, last_name, email, password, role, status) 
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    
    $first_name = "Admin";
    $last_name = "User";
    $email = "admin@example.com";
    $password = password_hash("admin123", PASSWORD_BCRYPT);
    $role = "admin";
    $status = true;
    
    if($stmt->execute([$first_name, $last_name, $email, $password, $role, $status])) {
        echo json_encode([
            "message" => "Test user created successfully",
            "user" => [
                "id" => $db->lastInsertId(),
                "first_name" => $first_name,
                "last_name" => $last_name,
                "email" => $email,
                "role" => $role,
                "status" => $status
            ]
        ]);
    } else {
        throw new Exception("Failed to create test user");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error creating test user",
        "error" => $e->getMessage()
    ]);
}
?> 