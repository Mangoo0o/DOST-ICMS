<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

try {
    // Check if clients table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'clients'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Create clients table if it doesn't exist
        $createTableSQL = "
        CREATE TABLE clients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            gender VARCHAR(50) NOT NULL,
            province VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            barangay VARCHAR(255) NOT NULL,
            contact_number VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            company VARCHAR(255) NOT NULL,
            industry_type VARCHAR(255) NOT NULL,
            service_line VARCHAR(255) NOT NULL,
            company_head VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        $stmt = $pdo->prepare($createTableSQL);
        $result = $stmt->execute();
        
        if ($result) {
            echo json_encode(['message' => 'Clients table created successfully']);
        } else {
            echo json_encode(['error' => 'Failed to create clients table']);
        }
        exit();
    }

    // Get current table structure
    $stmt = $pdo->query("DESCRIBE clients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $currentColumnNames = array_column($columns, 'Field');
    
    // Define columns to add
    $columnsToAdd = [
        'password' => "ALTER TABLE clients ADD COLUMN password VARCHAR(255) NOT NULL AFTER company_head",
        'created_at' => "ALTER TABLE clients ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER password",
        'updated_at' => "ALTER TABLE clients ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
    ];
    
    $addedColumns = [];
    $errors = [];
    
    foreach ($columnsToAdd as $columnName => $sql) {
        if (!in_array($columnName, $currentColumnNames)) {
            try {
                $stmt = $pdo->prepare($sql);
                $result = $stmt->execute();
                
                if ($result) {
                    $addedColumns[] = $columnName;
                } else {
                    $errors[] = "Failed to add column: $columnName";
                }
            } catch (PDOException $e) {
                $errors[] = "Error adding column $columnName: " . $e->getMessage();
            }
        }
    }
    
    // Get updated table structure
    $stmt = $pdo->query("DESCRIBE clients");
    $updatedColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'message' => 'Clients table setup completed',
        'table_exists' => $tableExists,
        'added_columns' => $addedColumns,
        'errors' => $errors,
        'current_structure' => $updatedColumns
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 