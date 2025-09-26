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

    // Check if password column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM clients LIKE 'password'");
    $passwordColumnExists = $stmt->rowCount() > 0;
    
    if ($passwordColumnExists) {
        echo json_encode(['message' => 'Password column already exists in clients table']);
        exit();
    }

    // Add password column to clients table
    $sql = "ALTER TABLE clients ADD COLUMN password VARCHAR(255) NOT NULL AFTER company_head";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute();
    
    if ($result) {
        echo json_encode([
            'message' => 'Password column successfully added to clients table',
            'sql' => $sql
        ]);
    } else {
        echo json_encode(['error' => 'Failed to add password column']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 