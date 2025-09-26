<?php
// Get backup information endpoint
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

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();
$user_id = $user_data->id;

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    // Try to create database if missing
    try {
        $host = (new Database())->getHost();
        $dbName = (new Database())->getDatabaseName();
        $user = (new Database())->getUsername();
        $pass = (new Database())->getPassword();
        $bootstrap = new PDO("mysql:host={$host}", $user, $pass);
        $bootstrap->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $bootstrap->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo = new PDO("mysql:host={$host};dbname={$dbName}", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => 'Database not available: ' . $e->getMessage(),
            'data' => null
        ]);
        exit();
    }
}

try {
    // Get database information
    $dbInfo = [];
    
    // Get all tables with row counts
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM `$tableName`");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $tables[] = [
            'name' => $tableName,
            'row_count' => $count
        ];
    }

    // Get database size
    $sizeStmt = $pdo->query("
        SELECT 
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
        FROM information_schema.tables 
        WHERE table_schema = 'icms_db'
    ");
    $dbSize = $sizeStmt->fetch(PDO::FETCH_ASSOC)['DB Size in MB'];

    // Get file uploads information
    $uploadsDir = __DIR__ . '/../../uploads/';
    $fileInfo = [
        'total_files' => 0,
        'total_size' => 0,
        'directories' => []
    ];

    if (is_dir($uploadsDir)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileInfo['total_files']++;
                $fileInfo['total_size'] += $file->getSize();
            }
        }
        
        // Get directory structure
        $dirs = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($dirs as $dir) {
            if ($dir->isDir()) {
                $relativePath = str_replace($uploadsDir, '', $dir->getPathname());
                $fileInfo['directories'][] = $relativePath;
            }
        }
    }

    $backupInfo = [
        'database' => [
            'name' => 'icms_db',
            'size_mb' => $dbSize,
            'tables' => $tables,
            'total_tables' => count($tables)
        ],
        'files' => $fileInfo,
        'system' => [
            'php_version' => PHP_VERSION,
            'mysql_version' => $pdo->query('SELECT VERSION()')->fetchColumn(),
            'server_time' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get()
        ]
    ];

    echo json_encode([
        'success' => true,
        'data' => $backupInfo,
        'message' => 'Backup information retrieved successfully'
    ]);

} catch (Exception $e) {
    error_log("Backup info error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get backup information: ' . $e->getMessage()
    ]);
}
?>
