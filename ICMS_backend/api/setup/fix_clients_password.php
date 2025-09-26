<?php
// Simple script to add password column to clients table
require_once __DIR__ . '/../config/db.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Database connection failed");
    }
    
    // Add password column to clients table
    $sql = "ALTER TABLE clients ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER company_head";
    
    $stmt = $db->prepare($sql);
    $result = $stmt->execute();
    
    if ($result) {
        echo "SUCCESS: Password column added to clients table!";
        echo "<br><br>";
        echo "SQL executed: " . $sql;
    } else {
        echo "ERROR: Failed to add password column";
    }
    
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "SUCCESS: Password column already exists in clients table!";
    } else {
        echo "ERROR: " . $e->getMessage();
    }
}
?> 