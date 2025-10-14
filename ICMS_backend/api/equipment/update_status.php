<?php
require_once '../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/db.php';
require_once '../services/EmailService.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id']) || empty($data['status'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Sample ID and status are required.']);
    exit();
}

$id = $data['id'];
$status = $data['status'];

// Update both status and is_calibrated fields
if ($status === 'completed') {
    $stmt = $db->prepare('UPDATE sample SET status = :status, is_calibrated = 1 WHERE id = :id');
} else {
    $stmt = $db->prepare('UPDATE sample SET status = :status WHERE id = :id');
}
$stmt->bindParam(':status', $status);
$stmt->bindParam(':id', $id, PDO::PARAM_INT);

if ($stmt->execute()) {
    // If sample is being marked as completed, send individual calibration completion email
    if ($status === 'completed') {
        try {
            // Get sample and client details for individual calibration completion email
            $sampleQuery = "
                SELECT s.*, r.reference_number, r.client_id,
                       c.first_name, c.last_name, c.email as client_email,
                       cr.calibrated_by, cr.date_completed,
                       u.first_name as calibrator_first_name, u.last_name as calibrator_last_name
                FROM sample s 
                LEFT JOIN requests r ON s.reservation_ref_no = r.reference_number
                LEFT JOIN clients c ON r.client_id = c.id 
                LEFT JOIN calibration_records cr ON s.id = cr.sample_id
                LEFT JOIN users u ON cr.calibrated_by = u.id
                WHERE s.id = ?
            ";
            $sampleStmt = $db->prepare($sampleQuery);
            $sampleStmt->execute([$id]);
            $sampleData = $sampleStmt->fetch(PDO::FETCH_ASSOC);
            
            // Check if email notifications are enabled
            $emailEnabledQuery = "SELECT setting_value FROM system_settings WHERE setting_key = 'email_enabled'";
            $emailStmt = $db->prepare($emailEnabledQuery);
            $emailStmt->execute();
            $emailEnabled = $emailStmt->fetchColumn();
            
            // Send individual calibration completion email if enabled and client email exists
            if ($emailEnabled === 'true' && !empty($sampleData['client_email'])) {
                error_log("Sending individual calibration completion email for sample ID: " . $id);
                error_log("Client email: " . $sampleData['client_email']);
                error_log("Equipment type: " . $sampleData['type']);
                
                $emailService = new EmailService();
                $clientName = trim($sampleData['first_name'] . ' ' . $sampleData['last_name']);
                
                $sampleDetails = [
                    'equipment_type' => $sampleData['type'],
                    'serial_number' => $sampleData['serial_no'],
                    'calibration_date' => $sampleData['date_completed'] ? date('Y-m-d', strtotime($sampleData['date_completed'])) : date('Y-m-d'),
                    'calibrated_by' => !empty($sampleData['calibrator_first_name']) && !empty($sampleData['calibrator_last_name']) 
                        ? trim($sampleData['calibrator_first_name'] . ' ' . $sampleData['calibrator_last_name'])
                        : 'DOST-PSTO Engineer'
                ];
                
                $emailResult = $emailService->sendCalibrationCompletionEmail(
                    $sampleData['client_email'],
                    $clientName,
                    $sampleData['reference_number'],
                    $sampleDetails
                );
                
                error_log("Calibration completion email result: " . ($emailResult ? 'SUCCESS' : 'FAILED'));
            } else {
                error_log("Calibration completion email not sent - Email enabled: " . $emailEnabled . ", Client email: " . ($sampleData['client_email'] ?? 'empty'));
            }
        } catch (Exception $e) {
            // Log email error but don't fail the status update
            error_log("Individual calibration completion email failed: " . $e->getMessage());
        }
        
        // Check if all samples for this request are completed
        // Get the reservation reference number for this sample
        $stmt = $db->prepare('SELECT reservation_ref_no FROM sample WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $reservation_ref_no = $stmt->fetchColumn();
        
        if ($reservation_ref_no) {
            // Check if all samples for this reservation are completed
            $stmt = $db->prepare('SELECT COUNT(*) FROM sample WHERE reservation_ref_no = :ref_no AND status != "completed"');
            $stmt->bindParam(':ref_no', $reservation_ref_no);
            $stmt->execute();
            $incomplete_count = $stmt->fetchColumn();
            
            // If all samples are completed, update the request status to completed
            if ($incomplete_count == 0) {
                $stmt = $db->prepare('UPDATE requests SET status = "completed" WHERE reference_number = :ref_no');
                $stmt->bindParam(':ref_no', $reservation_ref_no);
                $stmt->execute();
                
                // Send email notification for request completion
                try {
                    // Get request and client details for email
                    $requestQuery = "
                        SELECT r.*, c.first_name, c.last_name, c.email as client_email,
                               (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number) as total_samples,
                               (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number AND s.status = 'completed') as completed_samples,
                               t.amount as total_amount, t.balance as remaining_balance, t.status as payment_status
                        FROM requests r 
                        LEFT JOIN clients c ON r.client_id = c.id 
                        LEFT JOIN transaction t ON t.reservation_ref_no = r.reference_number
                        WHERE r.reference_number = ?
                    ";
                    $requestStmt = $db->prepare($requestQuery);
                    $requestStmt->execute([$reservation_ref_no]);
                    $requestData = $requestStmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Check if email notifications are enabled
                    $emailEnabledQuery = "SELECT setting_value FROM system_settings WHERE setting_key = 'email_enabled'";
                    $emailStmt = $db->prepare($emailEnabledQuery);
                    $emailStmt->execute();
                    $emailEnabled = $emailStmt->fetchColumn();
                    
                    // Send email notification if enabled and client email exists
                    if ($emailEnabled === 'true' && !empty($requestData['client_email'])) {
                        $emailService = new EmailService();
                        $clientName = trim($requestData['first_name'] . ' ' . $requestData['last_name']);
                        
                        $requestDetails = [
                            'total_samples' => $requestData['total_samples'],
                            'completed_samples' => $requestData['completed_samples'],
                            'total_amount' => $requestData['total_amount'],
                            'remaining_balance' => $requestData['remaining_balance'],
                            'payment_status' => $requestData['payment_status']
                        ];
                        
                        $emailService->sendRequestCompletionEmail(
                            $requestData['client_email'],
                            $clientName,
                            $requestData['reference_number'],
                            $requestDetails
                        );
                    }
                } catch (Exception $e) {
                    // Log email error but don't fail the status update
                    error_log("Email notification failed for auto-completion: " . $e->getMessage());
                }
            }
        }
    }
    
    echo json_encode(['message' => 'Sample status updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to update sample status.']);
}
?> 