<?php
// Debug backup endpoint - no authentication required for testing
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit();
}

try {
    // Test database connection
    $db = new Database();
    $pdo = $db->getConnection();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Test basic queries
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    if (!$stmt) {
        throw new Exception('Failed to get table list: ' . implode(', ', $pdo->errorInfo()));
    }
    
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    // Test one table backup
    $testTable = $tables[0] ?? 'users';
    $testData = [];
    
    if (in_array($testTable, $tables)) {
        $stmt = $pdo->query("SELECT * FROM `$testTable` LIMIT 5");
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $testData[] = $row;
            }
        }
    }

    // Test file system
    $uploadsDir = __DIR__ . '/../../uploads/';
    $fileCount = 0;
    $dirExists = is_dir($uploadsDir);
    
    if ($dirExists) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileCount++;
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Backup debug successful',
        'debug_info' => [
            'database_connected' => true,
            'total_tables' => count($tables),
            'tables' => $tables,
            'test_table' => $testTable,
            'test_data_count' => count($testData),
            'test_data_sample' => $testData,
            'uploads_dir_exists' => $dirExists,
            'uploads_dir_path' => $uploadsDir,
            'file_count' => $fileCount,
            'php_memory_limit' => ini_get('memory_limit'),
            'php_max_execution_time' => ini_get('max_execution_time'),
            'php_version' => PHP_VERSION,
            'server_time' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    error_log("Backup debug error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Backup debug failed: ' . $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>
