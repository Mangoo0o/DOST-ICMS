<?php
// CORS headers - allow specific origin for development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

try {
    $database = new Database();
    $db = $database->getConnection();
    file_put_contents($logFile, "Database connection successful\n", FILE_APPEND);

    // First, check if the table exists
    $check_table = "SHOW TABLES LIKE 'users'";
    $table_exists = $db->query($check_table)->rowCount() > 0;
    file_put_contents($logFile, "Table exists: " . ($table_exists ? "Yes" : "No") . "\n", FILE_APPEND);

    if (!$table_exists) {
        throw new Exception("Users table does not exist");
    }

    // Get the table structure
    $columns = $db->query("SHOW COLUMNS FROM users")->fetchAll(PDO::FETCH_COLUMN);
    file_put_contents($logFile, "Table columns: " . implode(", ", $columns) . "\n", FILE_APPEND);

    $query = "SELECT id, first_name, last_name, email, role, status FROM users ORDER BY created_at DESC";
    file_put_contents($logFile, "Executing query: " . $query . "\n", FILE_APPEND);
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $users_arr = array();
        $users_arr["records"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            file_put_contents($logFile, "Raw row data: " . print_r($row, true) . "\n", FILE_APPEND);
            
            $user_item = array(
                "id" => $row['id'],
                "fullname" => $row['first_name'] . ' ' . $row['last_name'],
                "email" => $row['email'],
                "userlvl" => $row['role'],
                "status" => (bool)$row['status']
            );
            array_push($users_arr["records"], $user_item);
        }

        file_put_contents($logFile, "Found " . count($users_arr["records"]) . " users\n", FILE_APPEND);
        file_put_contents($logFile, "Response data: " . json_encode($users_arr) . "\n", FILE_APPEND);

        http_response_code(200);
        echo json_encode($users_arr);
    } else {
        file_put_contents($logFile, "No users found in database\n", FILE_APPEND);
        http_response_code(404);
        echo json_encode(array("message" => "No users found."));
    }
} catch (Exception $e) {
    file_put_contents($logFile, "Error: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database error occurred",
        "error" => $e->getMessage()
    ));
}

file_put_contents($logFile, "Request completed at " . date('Y-m-d H:i:s') . "\n\n", FILE_APPEND);
?> 