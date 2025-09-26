<?php
require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Max-Age: 3600');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../auth/verify_token.php';

// Verify token and get user data
$user_data = verifyToken();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['sample_id']) ||
    empty($data['calibration_type']) ||
    empty($data['input_data']) ||
    empty($data['result_data'])) {
    echo json_encode(['message' => 'Required fields are missing.']);
    exit;
}

// Convert input_data and result_data to JSON strings if they are arrays
if (is_array($data['input_data'])) {
    $data['input_data'] = json_encode($data['input_data']);
}
if (is_array($data['result_data'])) {
    $data['result_data'] = json_encode($data['result_data']);
}

// Check if a record exists for this sample_id
$checkStmt = $db->prepare('SELECT id FROM calibration_records WHERE sample_id = ?');
$checkStmt->execute([$data['sample_id']]);

if ($checkStmt->rowCount() > 0) {
    // Update existing record
    $updateStmt = $db->prepare('UPDATE calibration_records SET calibration_type = ?, input_data = ?, result_data = ?, calibrated_by = ?, date_started = ?, date_completed = ?, updated_at = NOW() WHERE sample_id = ?');
    
    $updateStmt->execute([
        $data['calibration_type'],
        $data['input_data'],
        $data['result_data'],
        $data['calibrated_by'] ?? null,
        $data['date_started'] ?? null,
        $data['date_completed'] ?? null,
        $data['sample_id']
    ]);
    
    // Don't automatically set status to completed - this should only be done when user confirms calibration
    // The status will be updated separately via the updateSampleStatus API
    
    // Request status updates will be handled by the updateSampleStatus API when calibration is confirmed
    
    // Notification logging will be handled by the updateSampleStatus API when calibration is confirmed
    
    echo json_encode(['message' => 'Calibration record updated successfully.']);
} else {
    // Insert new record
    $insertStmt = $db->prepare('INSERT INTO calibration_records (sample_id, calibration_type, input_data, result_data, calibrated_by, date_started, date_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
    
    $insertStmt->execute([
        $data['sample_id'],
        $data['calibration_type'],
        $data['input_data'],
        $data['result_data'],
        $data['calibrated_by'] ?? null,
        $data['date_started'] ?? null,
        $data['date_completed'] ?? null
    ]);
    
    // Don't automatically set status to completed - this should only be done when user confirms calibration
    // The status will be updated separately via the updateSampleStatus API
    
    // Request status updates will be handled by the updateSampleStatus API when calibration is confirmed
    
    // Notification logging will be handled by the updateSampleStatus API when calibration is confirmed
    
    echo json_encode(['message' => 'Calibration record created successfully.']);
} 