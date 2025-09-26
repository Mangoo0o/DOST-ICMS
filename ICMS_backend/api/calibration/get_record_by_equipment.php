<?php
require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

// Simple test to see if the file loads
if (!isset($_GET['sample_id'])) {
    echo json_encode(['error' => 'Sample ID is required']);
    exit();
}

$sample_id = $_GET['sample_id'];

// Test database connection
include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    // Query for calibration record
    $stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
    $stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $record = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$record) {
        echo json_encode([
            'status' => 'not_found',
            'message' => 'No calibration record found for this sample',
            'sample_id' => $sample_id
        ]);
        exit();
    }
    
    // Return the calibration record
    echo json_encode($record);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage(),
        'sample_id' => $sample_id
    ]);
}
?>
