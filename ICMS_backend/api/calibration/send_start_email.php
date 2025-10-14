<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->sample_id)) {
    $db = (new Database())->getConnection();
    
    try {
        // Get sample and request details with client information
        $getSampleQuery = "
            SELECT s.*, r.reference_number, r.client_id, r.date_expected_completion,
                   c.first_name, c.last_name, c.email as client_email
            FROM sample s 
            LEFT JOIN requests r ON s.reservation_ref_no = r.reference_number
            LEFT JOIN clients c ON r.client_id = c.id 
            WHERE s.id = ?
        ";
        $getStmt = $db->prepare($getSampleQuery);
        $getStmt->execute([$data->sample_id]);
        $sampleData = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$sampleData) {
            http_response_code(404);
            echo json_encode(['message' => 'Sample not found']);
            exit();
        }
        
        // Check if email notifications are enabled
        $emailEnabledQuery = "SELECT setting_value FROM system_settings WHERE setting_key = 'email_enabled'";
        $emailStmt = $db->prepare($emailEnabledQuery);
        $emailStmt->execute();
        $emailEnabled = $emailStmt->fetchColumn();
        
        $emailSent = false;
        
        // Send email notification if enabled and client email exists
        if ($emailEnabled === 'true' && !empty($sampleData['client_email'])) {
            try {
                $emailService = new EmailService();
                $clientName = trim($sampleData['first_name'] . ' ' . $sampleData['last_name']);
                
                // Prepare sample details for email
                $sampleDetails = [
                    'equipment_type' => $sampleData['type'],
                    'serial_number' => $sampleData['serial_no'],
                    'range_capacity' => $sampleData['range_capacity'],
                    'reference_number' => $sampleData['reference_number'],
                    'expected_completion' => $sampleData['date_expected_completion'] ? date('Y-m-d', strtotime($sampleData['date_expected_completion'])) : 'Not set'
                ];
                
                // Send calibration start email
                $emailService->sendCalibrationStartEmail(
                    $sampleData['client_email'],
                    $clientName,
                    $sampleData['reference_number'],
                    $sampleDetails
                );
                
                $emailSent = true;
            } catch (Exception $e) {
                error_log('Failed to send calibration start email: ' . $e->getMessage());
            }
        }
        
        echo json_encode([
            'message' => 'Calibration start notification processed',
            'email_sent' => $emailSent,
            'client_email' => $sampleData['client_email'] ?? null
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to process calibration start notification: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Sample ID is required']);
}
?>
