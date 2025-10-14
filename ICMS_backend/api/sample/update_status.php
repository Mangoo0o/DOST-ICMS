<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

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
    // If sample is being marked as completed, send individual calibration completion email only if there are multiple samples in the request
    if ($status === 'completed') {
        try {
            // First, get the reservation reference number for this sample
            $stmt = $db->prepare('SELECT reservation_ref_no FROM sample WHERE id = :id');
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $reservation_ref_no = $stmt->fetchColumn();
            
            if ($reservation_ref_no) {
                // Check if there are multiple samples in this request
                $countStmt = $db->prepare('SELECT COUNT(*) FROM sample WHERE reservation_ref_no = :ref_no');
                $countStmt->bindParam(':ref_no', $reservation_ref_no);
                $countStmt->execute();
                $total_samples = $countStmt->fetchColumn();
                
                // Only send individual completion email if there are multiple samples in the request
                if ($total_samples > 1) {
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
                        error_log("Sending individual calibration completion email for sample ID: " . $id . " (Request has " . $total_samples . " samples)");
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
                } else {
                    error_log("Skipping individual completion email - Request has only " . $total_samples . " sample(s), will send request completion email instead");
                }
            }
        } catch (Exception $e) {
            // Log email error but don't fail the status update
            error_log("Individual calibration completion email failed: " . $e->getMessage());
        }
        
        // Check if all samples for this request are completed
        
        if ($reservation_ref_no) {
            // Check if all samples for this reservation are completed
            $stmt = $db->prepare('SELECT COUNT(*) FROM sample WHERE reservation_ref_no = :ref_no AND status != "completed"');
            $stmt->bindParam(':ref_no', $reservation_ref_no);
            $stmt->execute();
            $incomplete_count = $stmt->fetchColumn();
            
            // If all samples are completed, update the request status to completed
            if ($incomplete_count == 0) {
                // Mark the request as completed
                $stmt = $db->prepare('UPDATE requests SET status = "completed", date_finished = NOW() WHERE reference_number = :ref_no');
                $stmt->bindParam(':ref_no', $reservation_ref_no);
                $stmt->execute();

                // Fetch client email and name for the completed request
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
                        WHERE r.reference_number = :ref_no
                    ";
                    $requestStmt = $db->prepare($requestQuery);
                    $requestStmt->bindParam(':ref_no', $reservation_ref_no);
                    $requestStmt->execute();
                    $requestData = $requestStmt->fetch(PDO::FETCH_ASSOC);

                    if ($requestData && !empty($requestData['client_email'])) {
                        $clientEmail = $requestData['client_email'];
                        $clientName = trim($requestData['first_name'] . ' ' . $requestData['last_name']);

                        // Send completion email (best-effort, non-blocking for API success)
                        try {
                            $emailService = new EmailService();
                            if ($emailService->isEnabled()) {
                                $requestDetails = [
                                    'total_samples' => $requestData['total_samples'],
                                    'completed_samples' => $requestData['completed_samples'],
                                    'total_amount' => $requestData['total_amount'],
                                    'remaining_balance' => $requestData['remaining_balance'],
                                    'payment_status' => $requestData['payment_status']
                                ];
                                $emailService->sendRequestCompletionEmail($clientEmail, $clientName, $reservation_ref_no, $requestDetails);
                            }
                        } catch (Exception $e) {
                            error_log('Completion email error: ' . $e->getMessage());
                        }
                    }
                } catch (Exception $e) {
                    // Do not fail the API on email issues
                    error_log('Post-completion email lookup failed: ' . $e->getMessage());
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