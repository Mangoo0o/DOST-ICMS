<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../api/config/db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Starting database migration...\n";
    
    // Check if user_id column already exists
    $check_column = "SHOW COLUMNS FROM clients LIKE 'user_id'";
    $column_exists = $db->query($check_column)->rowCount() > 0;
    
    if ($column_exists) {
        echo "user_id column already exists in clients table.\n";
    } else {
        // Add user_id column
        $add_column = "ALTER TABLE clients ADD COLUMN user_id INT";
        $db->exec($add_column);
        echo "Added user_id column to clients table.\n";
        
        // Add foreign key constraint
        $add_fk = "ALTER TABLE clients ADD CONSTRAINT fk_clients_user_id 
                   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE";
        $db->exec($add_fk);
        echo "Added foreign key constraint.\n";
        
        // Add index
        $add_index = "CREATE INDEX idx_clients_user_id ON clients(user_id)";
        $db->exec($add_index);
        echo "Added index for user_id column.\n";
    }
    
    // Update users table role enum to include 'client'
    $update_role = "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'calibration_engineers', 'it_programmer', 'client', 'cashier') NOT NULL DEFAULT 'it_programmer'";
    $db->exec($update_role);
    echo "Updated users table role enum to include 'client'.\n";
    
    echo "Database migration completed successfully!\n";
    
    // Show current table structure
    $columns = $db->query("SHOW COLUMNS FROM clients")->fetchAll(PDO::FETCH_ASSOC);
    echo "Current clients table structure:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    http_response_code(500);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    http_response_code(500);
}
?> 