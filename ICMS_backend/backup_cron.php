<?php
/**
 * Backup Cron Job Script
 * This script should be run via cron for automated backups
 * 
 * Example cron entries:
 * # Daily full backup at 2 AM
 * 0 2 * * * /usr/bin/php /path/to/ICMS_backend/backup_cron.php daily full
 * 
 * # Weekly settings backup on Sundays at 3 AM
 * 0 3 * * 0 /usr/bin/php /path/to/ICMS_backend/backup_cron.php weekly settings
 * 
 * # Monthly database backup on 1st of month at 4 AM
 * 0 4 1 * * /usr/bin/php /path/to/ICMS_backend/backup_cron.php monthly database
 */

require_once __DIR__ . '/api/config/db.php';

// Get command line arguments
$scheduleType = $argv[1] ?? 'daily';
$backupType = $argv[2] ?? 'full';

// Validate arguments
$validSchedules = ['daily', 'weekly', 'monthly'];
$validTypes = ['full', 'settings', 'database'];

if (!in_array($scheduleType, $validSchedules)) {
    echo "Error: Invalid schedule type. Use: daily, weekly, or monthly\n";
    exit(1);
}

if (!in_array($backupType, $validTypes)) {
    echo "Error: Invalid backup type. Use: full, settings, or database\n";
    exit(1);
}

echo "Starting {$scheduleType} {$backupType} backup...\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Create backup directory
    $backupDir = __DIR__ . '/backups/';
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
            $backupData = createFullBackupData($pdo);
            break;
        case 'settings':
            $backupData = createSettingsBackupData($pdo);
            break;
        case 'database':
            $backupData = createDatabaseBackupData($pdo);
            break;
    }

    // Save backup to file
    file_put_contents($backupFilePath, json_encode($backupData, JSON_PRETTY_PRINT));
    $fileSize = filesize($backupFilePath);

    // Log backup creation
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => $backupType,
        'schedule' => $scheduleType,
        'file' => $backupFileName,
        'size' => $fileSize,
        'status' => 'success'
    ];

    $logFile = $backupDir . 'backup_log.json';
    $logs = [];
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    $logs[] = $logEntry;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));

    // Clean up old backups (keep 30 days by default)
    cleanupOldBackups($backupDir, 30);

    echo "Backup completed successfully!\n";
    echo "File: {$backupFileName}\n";
    echo "Size: " . formatBytes($fileSize) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    
    // Log error
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => $backupType,
        'schedule' => $scheduleType,
        'file' => null,
        'size' => 0,
        'status' => 'error',
        'error' => $e->getMessage()
    ];

    $logFile = $backupDir . 'backup_log.json';
    $logs = [];
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    $logs[] = $logEntry;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
    
    exit(1);
}

function createFullBackupData($pdo) {
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

function createSettingsBackupData($pdo) {
    $settings = [];
    
    $stmt = $pdo->prepare("SELECT * FROM user_preferences");
    $stmt->execute();
    $settings['user_preferences'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM system_settings");
    $stmt->execute();
    $settings['system_settings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM theme_settings");
    $stmt->execute();
    $settings['theme_settings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare("SELECT * FROM notification_preferences");
    $stmt->execute();
    $settings['notification_preferences'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'version' => '1.0',
        'created_at' => date('Y-m-d H:i:s'),
        'settings' => $settings
    ];
}

function createDatabaseBackupData($pdo) {
    return createFullBackupData($pdo);
}

function cleanupOldBackups($backupDir, $retentionDays) {
    $files = glob($backupDir . 'backup_*.json');
    $cutoffDate = time() - ($retentionDays * 24 * 60 * 60);
    $deletedCount = 0;
    
    foreach ($files as $file) {
        if (filemtime($file) < $cutoffDate) {
            unlink($file);
            $deletedCount++;
        }
    }
    
    if ($deletedCount > 0) {
        echo "Cleaned up {$deletedCount} old backup files\n";
    }
}

function formatBytes($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = Math.floor(Math.log($bytes) / Math.log($k));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}
?>
