<?php
// Full system backup endpoint
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

try {
    // Get all tables in the database
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    if (!$stmt) {
        throw new Exception('Failed to get table list: ' . implode(', ', $pdo->errorInfo()));
    }
    
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    $backup = [
        'version' => '1.0',
        'created_at' => date('Y-m-d H:i:s'),
        'created_by' => $user_id,
        'database_name' => 'icms_db',
        'tables' => []
    ];

    // Backup each table
    foreach ($tables as $table) {
        try {
            // Get table structure
            $createStmt = $pdo->query("SHOW CREATE TABLE `$table`");
            if (!$createStmt) {
                throw new Exception("Failed to get structure for table $table: " . implode(', ', $pdo->errorInfo()));
            }
            $createTable = $createStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get table data
            $data = [];
            $dataStmt = $pdo->query("SELECT * FROM `$table`");
            if (!$dataStmt) {
                throw new Exception("Failed to get data for table $table: " . implode(', ', $pdo->errorInfo()));
            }
            
            while ($row = $dataStmt->fetch(PDO::FETCH_ASSOC)) {
                $data[] = $row;
            }

            $backup['tables'][$table] = [
                'structure' => $createTable['Create Table'],
                'data' => $data,
                'row_count' => count($data)
            ];
        } catch (Exception $tableError) {
            error_log("Error backing up table $table: " . $tableError->getMessage());
            // Continue with other tables
            $backup['tables'][$table] = [
                'structure' => null,
                'data' => [],
                'row_count' => 0,
                'error' => $tableError->getMessage()
            ];
        }
    }

    // Get file uploads information
    $uploadsDir = __DIR__ . '/../../uploads/';
    $fileBackup = [];
    
    if (is_dir($uploadsDir)) {
        try {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS)
            );
            
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    try {
                        $relativePath = str_replace($uploadsDir, '', $file->getPathname());
                        $fileContent = file_get_contents($file->getPathname());
                        
                        if ($fileContent === false) {
                            error_log("Failed to read file: " . $file->getPathname());
                            continue;
                        }
                        
                        $fileBackup[] = [
                            'path' => $relativePath,
                            'size' => $file->getSize(),
                            'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                            'content' => base64_encode($fileContent)
                        ];
                    } catch (Exception $fileError) {
                        error_log("Error processing file " . $file->getPathname() . ": " . $fileError->getMessage());
                        // Continue with other files
                    }
                }
            }
        } catch (Exception $dirError) {
            error_log("Error accessing uploads directory: " . $dirError->getMessage());
        }
    } else {
        error_log("Uploads directory does not exist: " . $uploadsDir);
    }

    $backup['files'] = $fileBackup;
    $backup['file_count'] = count($fileBackup);

    // Calculate total size
    $totalSize = 0;
    foreach ($fileBackup as $file) {
        $totalSize += $file['size'];
    }
    $backup['total_size'] = $totalSize;

    echo json_encode([
        'success' => true,
        'data' => $backup,
        'message' => 'Full system backup created successfully'
    ]);

} catch (Exception $e) {
    error_log("Full backup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create full backup: ' . $e->getMessage()
    ]);
}
?>
