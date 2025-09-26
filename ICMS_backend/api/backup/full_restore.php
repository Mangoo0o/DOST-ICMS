<?php
// Full system restore endpoint
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['backup_data'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Backup data is required']);
    exit();
}

$backupData = $data['backup_data'];

try {
    $pdo->beginTransaction();

    // Validate backup format
    if (!isset($backupData['version']) || !isset($backupData['tables'])) {
        throw new Exception('Invalid backup format');
    }

    // Disable foreign key checks temporarily
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Drop all existing tables
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS `$table`");
    }

    // Restore table structures and data
    foreach ($backupData['tables'] as $tableName => $tableData) {
        // Create table
        $pdo->exec($tableData['structure']);

        // Insert data
        if (!empty($tableData['data'])) {
            $firstRow = $tableData['data'][0];
            $columns = array_keys($firstRow);
            $placeholders = ':' . implode(', :', $columns);
            $sql = "INSERT INTO `$tableName` (`" . implode('`, `', $columns) . "`) VALUES ($placeholders)";
            
            $stmt = $pdo->prepare($sql);
            foreach ($tableData['data'] as $row) {
                $stmt->execute($row);
            }
        }
    }

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Restore files
    if (isset($backupData['files']) && !empty($backupData['files'])) {
        $uploadsDir = __DIR__ . '/../../uploads/';
        
        // Create uploads directory if it doesn't exist
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        foreach ($backupData['files'] as $file) {
            $filePath = $uploadsDir . $file['path'];
            $dir = dirname($filePath);
            
            // Create directory if it doesn't exist
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            
            // Write file content
            file_put_contents($filePath, base64_decode($file['content']));
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Full system restored successfully',
        'restored_tables' => count($backupData['tables']),
        'restored_files' => count($backupData['files'] ?? [])
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Full restore error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to restore system: ' . $e->getMessage()
    ]);
}
?>
