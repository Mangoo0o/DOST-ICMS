<?php
// Setup script for settings backup/restore functionality
require_once __DIR__ . '/api/config/db.php';

echo "Setting up settings backup/restore functionality...\n";

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    echo "ERROR: Database connection failed\n";
    exit(1);
}

try {
    // Read and execute the SQL file
    $sql = file_get_contents(__DIR__ . '/create_settings_tables.sql');
    
    // Split by semicolon and execute each statement
    $statements = explode(';', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "SUCCESS: Settings tables created successfully\n";
    echo "Settings backup/restore functionality is now available\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
