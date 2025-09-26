<?php
/**
 * Database Migration Script
 * Adds PWD and 4Ps fields to the clients table
 */

require_once __DIR__ . '/api/config/db.php';

echo "Starting database migration...\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    echo "Connected to database successfully.\n";
    
    // Migration queries
    $migrations = [
        "Adding is_pwd field..." => "
            ALTER TABLE `clients` 
            ADD COLUMN IF NOT EXISTS `is_pwd` TINYINT(1) NOT NULL DEFAULT 0 
            COMMENT 'Person with Disability status: 0 = No, 1 = Yes'
        ",
        
        "Adding is_4ps field..." => "
            ALTER TABLE `clients` 
            ADD COLUMN IF NOT EXISTS `is_4ps` TINYINT(1) NOT NULL DEFAULT 0 
            COMMENT '4Ps Beneficiary status: 0 = No, 1 = Yes'
        ",
        
        "Adding indexes..." => "
            ALTER TABLE `clients` 
            ADD INDEX IF NOT EXISTS `idx_is_pwd` (`is_pwd`),
            ADD INDEX IF NOT EXISTS `idx_is_4ps` (`is_4ps`)
        "
    ];
    
    foreach ($migrations as $description => $query) {
        echo $description . "\n";
        $stmt = $db->prepare($query);
        $result = $stmt->execute();
        
        if ($result) {
            echo "✓ Success\n";
        } else {
            echo "✗ Failed\n";
            $error = $stmt->errorInfo();
            echo "Error: " . $error[2] . "\n";
        }
    }
    
    // Verify the changes
    echo "\nVerifying changes...\n";
    $verify_query = "DESCRIBE `clients`";
    $verify_stmt = $db->prepare($verify_query);
    $verify_stmt->execute();
    
    $columns = $verify_stmt->fetchAll(PDO::FETCH_ASSOC);
    $found_pwd = false;
    $found_4ps = false;
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'is_pwd') {
            $found_pwd = true;
            echo "✓ Found is_pwd field: " . $column['Type'] . "\n";
        }
        if ($column['Field'] === 'is_4ps') {
            $found_4ps = true;
            echo "✓ Found is_4ps field: " . $column['Type'] . "\n";
        }
    }
    
    if (!$found_pwd) {
        echo "✗ is_pwd field not found\n";
    }
    if (!$found_4ps) {
        echo "✗ is_4ps field not found\n";
    }
    
    if ($found_pwd && $found_4ps) {
        echo "\n🎉 Migration completed successfully!\n";
        echo "The clients table now supports PWD and 4Ps fields.\n";
    } else {
        echo "\n⚠️  Migration may have encountered issues.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
}
?> 