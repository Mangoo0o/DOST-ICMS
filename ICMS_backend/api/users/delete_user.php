<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

include_once __DIR__ . '/../config/db.php';

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get the raw input data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate required fields
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(array("message" => "User ID is required"));
        exit();
    }

    // Check if user exists
    $check_query = "SELECT id FROM users WHERE id = :id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':id', $data['id']);
    $check_stmt->execute();

    if ($check_stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "User not found"));
        exit();
    }

    // Delete the user
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "User deleted successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to delete user"));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database error occurred",
        "error" => $e->getMessage()
    ));
}
?> 