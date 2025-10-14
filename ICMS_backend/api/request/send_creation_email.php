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

if (!empty($data->reference_number)) {
    $db = (new Database())->getConnection();
    
    try {
        // Get request details with client information
        $getRequestQuery = "
            SELECT r.*, c.first_name, c.last_name, c.email as client_email,
                   (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number) as total_samples,
                   CASE WHEN r.attachment_file_name IS NOT NULL THEN 1 ELSE 0 END as has_attachment,
                   r.attachment_file_name, r.attachment_file_size
            FROM requests r 
            LEFT JOIN clients c ON r.client_id = c.id 
            WHERE r.reference_number = ?
        ";
        $getStmt = $db->prepare($getRequestQuery);
        $getStmt->execute([$data->reference_number]);
        $requestData = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$requestData) {
            http_response_code(404);
            echo json_encode(['message' => 'Request not found']);
            exit();
        }
        
        // Check if email notifications are enabled
        $emailEnabledQuery = "SELECT setting_value FROM system_settings WHERE setting_key = 'email_enabled'";
        $emailStmt = $db->prepare($emailEnabledQuery);
        $emailStmt->execute();
        $emailEnabled = $emailStmt->fetchColumn();
        
        $emailSent = false;
        
        // Send email notification if enabled and client email exists
        if ($emailEnabled === 'true' && !empty($requestData['client_email'])) {
            try {
                $emailService = new EmailService();
                $clientName = trim($requestData['first_name'] . ' ' . $requestData['last_name']);
                
                // Prepare request details for email
                $requestDetails = [
                    'total_samples' => $requestData['total_samples'],
                    'expected_completion' => $requestData['date_expected_completion'] ? date('Y-m-d', strtotime($requestData['date_expected_completion'])) : 'Not set',
                    'scheduled_date' => $requestData['date_scheduled'] ? date('Y-m-d', strtotime($requestData['date_scheduled'])) : 'Not set',
                    'has_attachment' => $requestData['has_attachment'],
                    'attachment_name' => $requestData['attachment_file_name'],
                    'attachment_size' => $requestData['attachment_file_size']
                ];
                
                // Send appropriate email based on status and attachment
                if ($requestData['status'] === 'in_progress') {
                    $emailService->sendRequestAcceptanceEmail(
                        $requestData['client_email'],
                        $clientName,
                        $requestData['reference_number'],
                        $requestDetails
                    );
                } else {
                    $emailService->sendRequestCreationEmail(
                        $requestData['client_email'],
                        $clientName,
                        $requestData['reference_number'],
                        $requestDetails
                    );
                }
                
                $emailSent = true;
            } catch (Exception $e) {
                error_log("Email notification failed: " . $e->getMessage());
            }
        }
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Email notification sent successfully',
            'email_sent' => $emailSent,
            'total_samples' => $requestData['total_samples']
        ]);
        
    } catch (Exception $e) {
        error_log("Send email error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['message' => 'Failed to send email notification: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Reference number is required']);
}
?>
