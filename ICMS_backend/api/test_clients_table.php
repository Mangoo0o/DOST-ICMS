<?php
// Include centralized CORS configuration
require_once __DIR__ . '/config/cors.php';

require_once __DIR__ . '/config/db.php';

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
    
    if ($tableExists) {
        // Get table structure
        $stmt = $pdo->query("DESCRIBE clients");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'message' => 'Clients table exists',
            'columns' => $columns
        ]);
    } else {
        echo json_encode([
            'error' => 'Clients table does not exist',
            'available_tables' => $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN)
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 