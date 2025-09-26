<?php
// Test backup endpoint for debugging
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

    // Test basic query
    $stmt = $pdo->query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'icms_db'");
    $tableCount = $stmt->fetch(PDO::FETCH_ASSOC)['table_count'];

    // Test file system access
    $uploadsDir = __DIR__ . '/../../uploads/';
    $fileCount = 0;
    $totalSize = 0;
    
    if (is_dir($uploadsDir)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileCount++;
                $totalSize += $file->getSize();
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Backup system test successful',
        'data' => [
            'database_connected' => true,
            'table_count' => $tableCount,
            'uploads_directory_exists' => is_dir($uploadsDir),
            'file_count' => $fileCount,
            'total_file_size' => $totalSize,
            'php_memory_limit' => ini_get('memory_limit'),
            'php_max_execution_time' => ini_get('max_execution_time'),
            'server_time' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    error_log("Backup test error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Backup test failed: ' . $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>
