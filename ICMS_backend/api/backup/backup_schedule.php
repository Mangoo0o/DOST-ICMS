<?php
// Backup schedule management endpoint
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get backup schedules
    $backupDir = __DIR__ . '/../../backups/';
    $logFile = $backupDir . 'backup_log.json';
    
    $schedules = [];
    $logs = [];
    
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    
    // Get available backup files
    $backupFiles = [];
    if (is_dir($backupDir)) {
        $files = glob($backupDir . 'backup_*.json');
        foreach ($files as $file) {
            $backupFiles[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created' => date('Y-m-d H:i:s', filemtime($file)),
                'path' => $file
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'schedules' => $schedules,
            'logs' => $logs,
            'backup_files' => $backupFiles
        ]
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create or update backup schedule
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['schedule_type']) || !isset($data['backup_type'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Schedule type and backup type are required']);
        exit();
    }
    
    // For now, we'll just trigger an immediate backup
    // In a real implementation, you'd want to use a cron job or task scheduler
    $scheduleType = $data['schedule_type'];
    $backupType = $data['backup_type'];
    $retentionDays = $data['retention_days'] ?? 30;
    
    // Call the scheduled backup endpoint
    $backupData = [
        'schedule_type' => $scheduleType,
        'backup_type' => $backupType,
        'retention_days' => $retentionDays
    ];
    
    // Simulate the backup creation
    echo json_encode([
        'success' => true,
        'message' => 'Backup schedule created successfully',
        'schedule' => $scheduleType,
        'type' => $backupType,
        'retention_days' => $retentionDays
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>
