<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

$data = json_decode(file_get_contents("php://input"));
// Support updating by id or reference_number for flexibility
if ((!empty($data->id) || !empty($data->reference_number)) && !empty($data->status)) {
    $db = (new Database())->getConnection();
    
    try {
        $db->beginTransaction();
        
        // Resolve ID by reference_number if needed
        if (empty($data->id) && !empty($data->reference_number)) {
            $refLookup = $db->prepare("SELECT id FROM requests WHERE reference_number = ? LIMIT 1");
            $refLookup->execute([$data->reference_number]);
            $foundId = $refLookup->fetchColumn();
            if ($foundId) {
                $data->id = (int)$foundId;
            }
        }

        // Get request details before updating
        $getRequestQuery = "
            SELECT r.*, c.first_name, c.last_name, c.email as client_email,
                   (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number) as total_samples,
                   (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number AND s.is_calibrated = true) as completed_samples
            FROM requests r 
            LEFT JOIN clients c ON r.client_id = c.id 
            WHERE r.id = ?
        ";
        $getStmt = $db->prepare($getRequestQuery);
        $getStmt->execute([$data->id]);
        $requestData = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        // Update request status
        if ($data->status === 'completed') {
            $query = "UPDATE requests SET status = ?, date_finished = NOW() WHERE id = ?";
        } else {
            $query = "UPDATE requests SET status = ? WHERE id = ?";
        }
        $stmt = $db->prepare($query);
        
        if ($stmt->execute([$data->status, $data->id])) {
            // Check if email notifications are enabled
            $emailEnabledQuery = "SELECT setting_value FROM system_settings WHERE setting_key = 'email_enabled'";
            $emailStmt = $db->prepare($emailEnabledQuery);
            $emailStmt->execute();
            $emailEnabled = $emailStmt->fetchColumn();
            
            // Send email notification if enabled and client email exists
            if ($emailEnabled === 'true' && !empty($requestData['client_email'])) {
                try {
                    $emailService = new EmailService();
                    $clientName = trim($requestData['first_name'] . ' ' . $requestData['last_name']);
                    
                    if ($data->status === 'completed') {
                        // Send completion email
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
                    } else {
                        // Send status update email
                        $requestDetails = [
                            'total_samples' => $requestData['total_samples'],
                            'completed_samples' => $requestData['completed_samples']
                        ];
                        $emailService->sendRequestStatusUpdateEmail(
                            $requestData['client_email'],
                            $clientName,
                            $requestData['reference_number'],
                            $data->status,
                            $requestDetails
                        );
                    }
                } catch (Exception $e) {
                    // Log email error but don't fail the status update
                    error_log("Email notification failed: " . $e->getMessage());
                }
            }
            
            $db->commit();
            http_response_code(200);
            echo json_encode([
                "message" => "Request status updated successfully.",
                "email_sent" => ($emailEnabled === 'true' && !empty($requestData['client_email']))
            ]);
        } else {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to update status."]);
        }
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Update status error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "Failed to update status: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing data. Provide id or reference_number and status."]);
} 