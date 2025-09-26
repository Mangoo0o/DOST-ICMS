<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../config/db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

$database = new Database();
$db = $database->getConnection();

try {
    // Check if users table exists
    $check_table = "SHOW TABLES LIKE 'users'";
    $table_exists = $db->query($check_table)->rowCount() > 0;

    if (!$table_exists) {
        // Create users table
        $create_table = "CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'calibration_engineers', 'it_programmer', 'cashier') NOT NULL DEFAULT 'it_programmer',
            status BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        $db->exec($create_table);
        echo json_encode(["message" => "Users table created successfully"]);
    } else {
        // Check table structure
        $columns = $db->query("SHOW COLUMNS FROM users")->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode([
            "message" => "Users table exists",
            "columns" => $columns
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Database error",
        "error" => $e->getMessage()
    ]);
}
?> 