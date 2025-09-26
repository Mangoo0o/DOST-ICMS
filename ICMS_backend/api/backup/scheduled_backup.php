<?php
// Scheduled backup endpoint for automated backups
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

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['schedule_type']) || !isset($data['backup_type'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Schedule type and backup type are required']);
    exit();
}

$scheduleType = $data['schedule_type']; // 'daily', 'weekly', 'monthly'
$backupType = $data['backup_type']; // 'full', 'settings', 'database'
$retentionDays = $data['retention_days'] ?? 30;

try {
    // Create backup directory if it doesn't exist
    $backupDir = __DIR__ . '/../../backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }

    $timestamp = date('Y-m-d_H-i-s');
    $backupFileName = "backup_{$backupType}_{$scheduleType}_{$timestamp}.json";
    $backupFilePath = $backupDir . $backupFileName;

    $backupData = null;

    // Create backup based on type
    switch ($backupType) {
        case 'full':
            // Use the full backup logic
            require_once __DIR__ . '/full_backup.php';
            $backupData = createFullBackupData($pdo, $user_id);
            break;
            
        case 'settings':
            // Use the settings backup logic
            require_once __DIR__ . '/../settings/backup_settings.php';
            $backupData = createSettingsBackupData($pdo, $user_id);
            break;
            
        case 'database':
            // Database only backup
            $backupData = createDatabaseBackupData($pdo);
            break;
            
        default:
            throw new Exception('Invalid backup type');
    }

    // Save backup to file
    file_put_contents($backupFilePath, json_encode($backupData, JSON_PRETTY_PRINT));

    // Log backup creation
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => $backupType,
        'schedule' => $scheduleType,
        'file' => $backupFileName,
        'size' => filesize($backupFilePath),
        'user_id' => $user_id
    ];

    $logFile = $backupDir . 'backup_log.json';
    $logs = [];
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    $logs[] = $logEntry;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));

    // Clean up old backups based on retention policy
    cleanupOldBackups($backupDir, $retentionDays);

    echo json_encode([
        'success' => true,
        'message' => 'Scheduled backup created successfully',
        'backup_file' => $backupFileName,
        'backup_size' => filesize($backupFilePath)
    ]);

} catch (Exception $e) {
    error_log("Scheduled backup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create scheduled backup: ' . $e->getMessage()
    ]);
}

function createFullBackupData($pdo, $user_id) {
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
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

    foreach ($tables as $table) {
        $createTable = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        
        $data = [];
        $stmt = $pdo->query("SELECT * FROM `$table`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        $backup['tables'][$table] = [
            'structure' => $createTable['Create Table'],
            'data' => $data,
            'row_count' => count($data)
        ];
    }

    return $backup;
}

function createSettingsBackupData($pdo, $user_id) {
    $settings = [];
    
    $stmt = $pdo->prepare("SELECT * FROM user_preferences WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $settings['user_preferences'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM system_settings");
    $stmt->execute();
    $settings['system_settings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM theme_settings WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $settings['theme_settings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM notification_preferences WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $settings['notification_preferences'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'version' => '1.0',
        'created_at' => date('Y-m-d H:i:s'),
        'user_id' => $user_id,
        'settings' => $settings
    ];
}

function createDatabaseBackupData($pdo) {
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    $backup = [
        'version' => '1.0',
        'created_at' => date('Y-m-d H:i:s'),
        'database_name' => 'icms_db',
        'tables' => []
    ];

    foreach ($tables as $table) {
        $createTable = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        
        $data = [];
        $stmt = $pdo->query("SELECT * FROM `$table`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        $backup['tables'][$table] = [
            'structure' => $createTable['Create Table'],
            'data' => $data,
            'row_count' => count($data)
        ];
    }

    return $backup;
}

function cleanupOldBackups($backupDir, $retentionDays) {
    $files = glob($backupDir . 'backup_*.json');
    $cutoffDate = time() - ($retentionDays * 24 * 60 * 60);
    
    foreach ($files as $file) {
        if (filemtime($file) < $cutoffDate) {
            unlink($file);
        }
    }
}
?>
