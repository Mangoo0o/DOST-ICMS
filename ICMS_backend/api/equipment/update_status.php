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

$stmt = $db->prepare('UPDATE sample SET status = :status WHERE id = :id');
$stmt->bindParam(':status', $status);
$stmt->bindParam(':id', $id, PDO::PARAM_INT);

if ($stmt->execute()) {
    // If sample is being marked as completed, check if all samples for this request are completed
    if ($status === 'completed') {
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
                               (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number AND s.status = 'completed') as completed_samples
                        FROM requests r 
                        LEFT JOIN clients c ON r.client_id = c.id 
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
                            'completed_samples' => $requestData['completed_samples']
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