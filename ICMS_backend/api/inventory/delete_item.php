<?php
require_once __DIR__ . '/../config/cors.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../auth/verify_token.php';

// Verify token and get user data
$user_data = verifyToken();

// Check if user has admin role
if ($user_data->role !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied. Admin privileges required."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    // Check if item exists
    $check_query = "SELECT id FROM inventory_items WHERE id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$data->id]);
    
    if($check_stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Item not found."));
        exit();
    }

    // Check if item has any active reservations
    $reservation_check = "SELECT id FROM requests WHERE item_id = ? AND status = 'approved'";
    $reservation_stmt = $db->prepare($reservation_check);
    $reservation_stmt->execute([$data->id]);
    
    if($reservation_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Cannot delete item with active reservations."));
        exit();
    }

    $query = "DELETE FROM inventory_items WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if($stmt->execute([$data->id])) {
        http_response_code(200);
        echo json_encode(array("message" => "Item was successfully deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete item."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete item. Item ID is required."));
}
?>