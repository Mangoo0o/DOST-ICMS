<?php
// Test endpoint without authentication
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log('Test save request received: ' . json_encode($data));

if (empty($data['sample_id']) ||
    empty($data['calibration_type']) ||
    empty($data['input_data']) ||
    empty($data['result_data']) ||
    empty($data['calibrated_by'])) {
    error_log('Missing required fields. Data received: ' . json_encode($data));
    echo json_encode(['message' => 'All fields are required.', 'received_data' => $data]);
    exit;
}

try {
    // Check if record already exists
    $checkStmt = $db->prepare('SELECT id FROM calibration_records WHERE sample_id = ?');
    $checkStmt->execute([$data['sample_id']]);
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing record
        $updateStmt = $db->prepare('UPDATE calibration_records SET calibration_type = ?, input_data = ?, result_data = ?, calibrated_by = ?, date_started = ?, date_completed = ?, updated_at = NOW() WHERE sample_id = ?');
        $result = $updateStmt->execute([
            $data['calibration_type'],
            $data['input_data'],
            $data['result_data'],
            $data['calibrated_by'],
            $data['date_started'],
            $data['date_completed'],
            $data['sample_id']
        ]);
        
        if (!$result) {
            error_log('Failed to update calibration record: ' . json_encode($updateStmt->errorInfo()));
            echo json_encode(['message' => 'Failed to update calibration record.', 'error' => $updateStmt->errorInfo()]);
            exit;
        }
        error_log('Calibration record updated successfully for sample_id: ' . $data['sample_id']);
        echo json_encode(['message' => 'Calibration record updated successfully.']);
    } else {
        // Insert new record
        $insertStmt = $db->prepare('INSERT INTO calibration_records (sample_id, calibration_type, input_data, result_data, calibrated_by, date_started, date_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $result = $insertStmt->execute([
            $data['sample_id'],
            $data['calibration_type'],
            $data['input_data'],
            $data['result_data'],
            $data['calibrated_by'],
            $data['date_started'],
            $data['date_completed']
        ]);
        
        if (!$result) {
            error_log('Failed to insert calibration record: ' . json_encode($insertStmt->errorInfo()));
            echo json_encode(['message' => 'Failed to insert calibration record.', 'error' => $insertStmt->errorInfo()]);
            exit;
        }
        error_log('Calibration record created successfully for sample_id: ' . $data['sample_id']);
        echo json_encode(['message' => 'Calibration record created successfully.']);
    }
} catch (Exception $e) {
    error_log('Exception in test save: ' . $e->getMessage());
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}
?>
