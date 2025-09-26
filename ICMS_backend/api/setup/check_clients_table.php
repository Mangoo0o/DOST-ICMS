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
        echo json_encode(['error' => 'Clients table does not exist']);
        exit();
    }

    // Get current table structure
    $stmt = $pdo->query("DESCRIBE clients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Define expected columns
    $expectedColumns = [
        'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
        'first_name' => 'VARCHAR(255)',
        'last_name' => 'VARCHAR(255)',
        'age' => 'INT',
        'gender' => 'VARCHAR(50)',
        'province' => 'VARCHAR(255)',
        'city' => 'VARCHAR(255)',
        'barangay' => 'VARCHAR(255)',
        'contact_number' => 'VARCHAR(50)',
        'email' => 'VARCHAR(255)',
        'company' => 'VARCHAR(255)',
        'industry_type' => 'VARCHAR(255)',
        'service_line' => 'VARCHAR(255)',
        'company_head' => 'VARCHAR(255)',
        'password' => 'VARCHAR(255)',
        'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    
    $currentColumnNames = array_column($columns, 'Field');
    $missingColumns = [];
    $existingColumns = [];
    
    foreach ($expectedColumns as $columnName => $columnType) {
        if (in_array($columnName, $currentColumnNames)) {
            $existingColumns[] = $columnName;
        } else {
            $missingColumns[] = $columnName;
        }
    }
    
    echo json_encode([
        'message' => 'Clients table structure analysis',
        'table_exists' => $tableExists,
        'current_columns' => $columns,
        'existing_columns' => $existingColumns,
        'missing_columns' => $missingColumns,
        'expected_columns' => $expectedColumns
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 